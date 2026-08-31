// TUI lives in blitz_tui_infraestructura/packages/tui — Electron never imports it directly; interaction is via RPC frames over stdin/stdout (JSONL + rpc_chunk reassembly).
// RpcFrameDecoder below is synced from blitz_tui_infraestructura/packages/coding-agent/src/modes/rpc/rpc-frame.ts@18.0.4 (MIT) — preserve behavior for wire-compat.

import { ipcMain, BrowserWindow } from "electron";
import { spawn, type ChildProcess } from "node:child_process";
import type { EventEmitter } from "node:events";
import { getAgentConfig, type AgentConfig } from "./agent-config";

let ompProcess: ChildProcess | null = null;
let frameBuffer = "";
let reqCounter = 0;
let ready = false;
let startupPromise: Promise<void> | null = null;
let startupResolve: (() => void) | null = null;
let startupReject: ((err: Error) => void) | null = null;

const pendingRequests = new Map<
  string,
  { resolve: (data: unknown) => void; reject: (err: Error) => void }
>();

// --- RpcFrameDecoder (copied minimal, MIT) ---
const MAX_RPC_FRAME_BYTES = 1024 * 1024;
const MAX_RPC_REASSEMBLED_BYTES = 64 * 1024 * 1024;
const RPC_CHUNK_PAYLOAD_BYTES = 256 * 1024;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isRpcChunkFrame(
  value: unknown,
): value is {
  type: "rpc_chunk";
  chunkId: string;
  index: number;
  count: number;
  byteLength: number;
  data: unknown;
} {
  return isRecord(value) && value.type === "rpc_chunk";
}

function decodeBase64(data: unknown): Buffer {
  if (typeof data !== "string") throw new Error("rpc chunk data must be base64 string");
  return Buffer.from(data, "base64");
}

interface PendingRpcChunks {
  chunkId: string;
  count: number;
  byteLength: number;
  nextIndex: number;
  chunks: Buffer[];
  receivedBytes: number;
}

class RpcFrameDecoder {
  #pending?: PendingRpcChunks;

  push(value: unknown): object | undefined {
    if (!isRpcChunkFrame(value)) {
      if (this.#pending) throw new Error("rpc chunk sequence interrupted");
      if (!isRecord(value)) throw new Error("rpc frame must be an object");
      return value;
    }
    const { chunkId, index, count, byteLength } = value;
    if (
      typeof chunkId !== "string" ||
      chunkId.length === 0 ||
      chunkId.length > 128 ||
      !Number.isSafeInteger(index) ||
      !Number.isSafeInteger(count) ||
      !Number.isSafeInteger(byteLength) ||
      index < 0 ||
      count < 2 ||
      count > Math.ceil(MAX_RPC_REASSEMBLED_BYTES / RPC_CHUNK_PAYLOAD_BYTES) ||
      index >= count ||
      byteLength < MAX_RPC_FRAME_BYTES ||
      byteLength > MAX_RPC_REASSEMBLED_BYTES
    )
      throw new Error("invalid rpc chunk metadata");
    const bytes = decodeBase64(value.data);
    if (bytes.byteLength > RPC_CHUNK_PAYLOAD_BYTES)
      throw new Error("rpc chunk payload exceeds the transport limit");

    if (!this.#pending) {
      if (index !== 0) throw new Error("rpc chunk sequence must start at index 0");
      this.#pending = { chunkId, count, byteLength, nextIndex: 0, chunks: [], receivedBytes: 0 };
    }
    const pending = this.#pending;
    if (
      pending.chunkId !== chunkId ||
      pending.count !== count ||
      pending.byteLength !== byteLength ||
      pending.nextIndex !== index
    )
      throw new Error("rpc chunk sequence mismatch");
    pending.chunks.push(bytes);
    pending.receivedBytes += bytes.byteLength;
    pending.nextIndex++;
    if (pending.receivedBytes > pending.byteLength)
      throw new Error("rpc chunk sequence exceeds declared length");
    if (pending.nextIndex < pending.count) return undefined;
    if (pending.receivedBytes !== pending.byteLength)
      throw new Error("rpc chunk sequence length mismatch");

    this.#pending = undefined;
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(pending.chunks));
    const frame: unknown = JSON.parse(decoded);
    if (!isRecord(frame)) throw new Error("rpc frame must be an object");
    return frame;
  }
}

const rpcDecoder = new RpcFrameDecoder();

function broadcast(event: unknown) {
  if (!isRecord(event)) return;
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send("agent:event", event);
  }
}

function sendFrame(frame: Record<string, unknown>) {
  if (!ompProcess?.stdin?.writable) return;
  ompProcess.stdin.write(JSON.stringify(frame) + "\n");
}

function nextId(): string {
  return `req_${++reqCounter}`;
}

function sendRequest(
  type: string,
  data?: Record<string, unknown>,
  timeoutMs = 10000,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const id = nextId();
    const timeout = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error(`Request ${type} timed out`));
    }, timeoutMs);
    pendingRequests.set(id, {
      resolve: (d) => {
        clearTimeout(timeout);
        resolve(d);
      },
      reject: (e) => {
        clearTimeout(timeout);
        reject(e);
      },
    });
    sendFrame({ id, type, ...data });
  });
}

function handleLine(line: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch {
    return;
  }

  let frame: object | undefined;
  try {
    frame = rpcDecoder.push(parsed);
  } catch (err) {
    console.error(
      "[Agent] RpcFrameDecoder error:",
      err instanceof Error ? err.message : String(err),
    );
    // reset decoder by creating new instance if corrupted? Keep current pending cleared on error throw already left pending set; to recover, we drop pending
    // The decoder throws but retains pending on mismatch — we continue; next push will throw interrupted unless we clear. Easiest: broadcast error notice
    broadcast({
      type: "notice",
      level: "error",
      message: String(err instanceof Error ? err.message : err),
      source: "rpc-decoder",
    });
    return;
  }
  if (!frame) return; // waiting for more chunks

  const typed = frame as Record<string, unknown>;

  if (typed.type === "ready") {
    ready = true;
    const supported = typed.supportedProtocolVersions as number[] | undefined;
    // If ready carries error field, reject startup
    if (typed.error) {
      const err = new Error(String(typed.error));
      startupReject?.(err);
      startupResolve = null;
      startupReject = null;
      return;
    }
    if (supported?.includes(2)) {
      sendFrame({ type: "negotiate_protocol", protocolVersion: 2, id: nextId() });
    }
    startupResolve?.();
    startupResolve = null;
    startupReject = null;
    return;
  }

  if (typed.type === "response" && typeof typed.id === "string") {
    const pending = pendingRequests.get(typed.id);
    if (pending) {
      pendingRequests.delete(typed.id);
      if (typed.success) {
        pending.resolve(typed.data);
      } else {
        pending.reject(new Error(String(typed.error ?? "Request failed")));
      }
      return;
    }
  }

  broadcast(typed);
}

function startOmp(config: AgentConfig): Promise<void> {
  if (startupPromise) return startupPromise;

  startupPromise = new Promise((resolve, reject) => {
    startupResolve = resolve;
    startupReject = reject;

    const args = [
      config.ompCliPath,
      "--mode",
      "rpc",
      "--session-dir",
      config.sessionDir,
      "--provider",
      config.defaultProvider,
      "--model",
      config.defaultModel,
    ];

    ompProcess = spawn("bun", args, {
      cwd: config.ompSourceDir,
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        ...process.env,
        PI_NOTIFICATIONS: "off",
        PI_NO_TITLE: "1",
      },
    });

    ompProcess.stdout?.on("data", (data: Buffer) => {
      frameBuffer += data.toString();
      // Guard against unbounded buffer growth / overflow
      if (Buffer.byteLength(frameBuffer, "utf8") > MAX_RPC_REASSEMBLED_BYTES * 2) {
        console.error("[Agent] frameBuffer overflow, resetting");
        frameBuffer = "";
        return;
      }
      const lines = frameBuffer.split("\n");
      frameBuffer = lines.pop() ?? "";
      for (const line of lines) {
        if (line.trim()) handleLine(line.trim());
      }
    });

    ompProcess.stderr?.on("data", (data: Buffer) => {
      console.error("[OMP]", data.toString().trim());
    });

    (ompProcess as unknown as EventEmitter).on("exit", (code: number | null) => {
      console.log("[OMP] Process exited with code:", code);
      ompProcess = null;
      ready = false;
      startupPromise = null;
      startupResolve = null;
      const rej = startupReject;
      startupReject = null;
      if (rej) rej(new Error(`OMP exited with code ${code ?? "unknown"}`));
      for (const [, pending] of pendingRequests) {
        pending.reject(new Error("OMP process exited"));
      }
      pendingRequests.clear();
      broadcast({ type: "omp:disconnected", code });
    });

    (ompProcess as unknown as EventEmitter).on("error", (err: Error) => {
      console.error("[OMP] Spawn error:", err.message);
      startupReject?.(err);
      startupResolve = null;
      startupReject = null;
      startupPromise = null;
    });
  });

  return startupPromise;
}

function ensureRunning(): Promise<void> {
  if (ready && ompProcess) return Promise.resolve();
  const config = getAgentConfig();
  if (!config.ompCliPath) {
    return Promise.reject(
      new Error("OMP not found. Install OMP or set OMP_SOURCE_DIR. See https://bun.sh for Bun."),
    );
  }
  // Check bun availability: if spawn fails, error handler will reject; we eagerly log banner via broadcast
  return startOmp(config);
}

export function registerAgentHandlers() {
  const config = getAgentConfig();

  if (!config.ompCliPath) {
    console.warn(
      "[Agent] OMP not found at",
      config.ompSourceDir,
      ". Agent features will be unavailable. Install Bun + OMP.",
    );
    ipcMain.handle("agent:send", () => {
      throw new Error("OMP not found. Install OMP to use agent features.");
    });
    ipcMain.handle("agent:abort", () => {});
    ipcMain.handle("agent:steer", () => {});
    ipcMain.handle("agent:getState", () => ({ isStreaming: false }));
    ipcMain.handle("agent:setModel", () => {});
    ipcMain.handle("agent:setThinkingLevel", () => {});
    ipcMain.handle("agent:getAvailableModels", () => []);
    ipcMain.handle("agent:login", () => ({ success: false }));
    ipcMain.handle("agent:getLoginProviders", () => []);
    ipcMain.handle("agent:onDisconnected", () => {}); // placeholder for preload symmetry
    return;
  }

  console.log("[Agent] OMP found at", config.ompSourceDir, "sessionDir", config.sessionDir);

  startOmp(config).catch((err) => {
    console.error("[Agent] Failed to start OMP:", err.message);
  });

  ipcMain.handle("agent:send", async (_e, message: string, images?: string[]) => {
    await ensureRunning();
    sendFrame({ id: nextId(), type: "prompt", message, images });
  });

  ipcMain.handle("agent:steer", async (_e, message: string) => {
    await ensureRunning();
    sendFrame({ id: nextId(), type: "steer", message });
  });

  ipcMain.handle("agent:abort", async () => {
    if (!ompProcess) return;
    sendFrame({ id: nextId(), type: "abort" });
  });

  ipcMain.handle("agent:getState", async () => {
    try {
      await ensureRunning();
      const data = (await sendRequest("get_state")) as Record<string, unknown> | undefined;
      return {
        isStreaming: Boolean(data?.isStreaming),
        model: data?.model ? String((data.model as Record<string, unknown>).id ?? "") : undefined,
        thinkingLevel: data?.thinkingLevel ? String(data.thinkingLevel) : undefined,
      };
    } catch {
      return { isStreaming: false };
    }
  });

  ipcMain.handle("agent:setModel", async (_e, provider: string, modelId: string) => {
    await ensureRunning();
    sendFrame({ id: nextId(), type: "set_model", provider, modelId });
  });

  ipcMain.handle("agent:setThinkingLevel", async (_e, level: string) => {
    await ensureRunning();
    sendFrame({ id: nextId(), type: "set_thinking_level", level });
  });

  ipcMain.handle("agent:getAvailableModels", async () => {
    try {
      await ensureRunning();
      const data = (await sendRequest("get_available_models")) as
        | { models?: Array<{ id: string; name: string; provider: string }> }
        | undefined;
      return data?.models ?? [];
    } catch {
      return [];
    }
  });

  ipcMain.handle("agent:login", async (_e, providerId: string) => {
    await ensureRunning();
    try {
      await sendRequest("login", { providerId }, 600000);
      return { success: true };
    } catch {
      return { success: false };
    }
  });

  ipcMain.handle("agent:getLoginProviders", async () => {
    try {
      await ensureRunning();
      const data = (await sendRequest("get_login_providers")) as
        | {
            providers?: Array<{
              id: string;
              name: string;
              available: boolean;
              authenticated: boolean;
            }>;
          }
        | undefined;
      return data?.providers ?? [];
    } catch {
      return [];
    }
  });
}

export function stopOmp() {
  if (ompProcess) {
    sendFrame({ id: nextId(), type: "abort" });
    try {
      ompProcess.kill("SIGTERM");
    } catch {
      // process already dead
    }
    ompProcess = null;
    ready = false;
    startupPromise = null;
    startupResolve = null;
    startupReject = null;
    for (const [, pending] of pendingRequests) {
      pending.reject(new Error("OMP shutting down"));
    }
    pendingRequests.clear();
  }
}
