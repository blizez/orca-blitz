import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { type ReasoningStep } from "@orca-blitz/ui/components/reasoning-panel";
import type { Message } from "./types";
import { useAgent } from "@/hooks/useAgent";

function extractTextFromMessage(message: unknown): string {
  if (!message || typeof message !== "object") return "";
  const msg = message as Record<string, unknown>;
  if (typeof msg.content === "string") return msg.content;
  if (Array.isArray(msg.content)) {
    let out = "";
    for (const block of msg.content as Array<Record<string, unknown>>) {
      if (block.type === "text" && typeof block.text === "string") out += block.text;
      else if (block.type === "thinking" && typeof block.thinking === "string")
        out += block.thinking;
      else if (block.type === "toolCall" && typeof block.text === "string") out += block.text;
    }
    return out;
  }
  if (typeof msg.text === "string") return msg.text as string;
  try {
    return JSON.stringify(msg).slice(0, 4000);
  } catch {
    return "";
  }
}

function getMessageRole(message: unknown): string {
  if (!message || typeof message !== "object") return "assistant";
  const msg = message as Record<string, unknown>;
  if (typeof msg.role === "string") return msg.role;
  return "assistant";
}

export function useAssistantStreaming(businessId?: string) {
  const agent = useAgent();
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [errorOverride, setErrorOverride] = useState<{ title: string; detail: string } | null>(
    null,
  );
  const [retrying, setRetrying] = useState(false);
  const [elapsed, setElapsed] = useState("0.0s");
  const [reasoningOpen, setReasoningOpen] = useState(true);
  const [openReasonings, setOpenReasonings] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<number | null>(null);

  // Tool events -> reasoning steps
  const toolEvents = useMemo(
    () =>
      agent.events.filter((e) => {
        const t = (e as Record<string, unknown> | null)?.type as string | undefined;
        return (
          t === "tool_execution_start" ||
          t === "tool_execution_update" ||
          t === "tool_execution_end"
        );
      }),
    [agent.events],
  );

  const reasoningSteps: ReasoningStep[] = useMemo(() => {
    return toolEvents.map((ev) => {
      const typed = ev as Record<string, unknown>;
      const toolName = (typed.toolName as string) ?? "tool";
      const args = typed.args;
      let body = "";
      if (typed.type === "tool_execution_end" && typed.isError)
        body = `error: ${String(typed.result ?? "").slice(0, 200)}`;
      else if (typeof args === "object" && args !== null) body = JSON.stringify(args).slice(0, 200);
      else if (typed.result) body = String(typed.result).slice(0, 200);
      return { title: toolName, body } satisfies ReasoningStep;
    });
  }, [toolEvents]);

  const derivedMessages = useMemo(() => {
    const msgs: Message[] = [...localMessages];
    const assistantMap = new Map<string, number>();

    for (const ev of agent.events) {
      if (!ev || typeof ev !== "object" || !("type" in ev)) continue;
      const typed = ev as Record<string, unknown>;
      const type = typed.type as string;

      if (type === "message_start" || type === "message_update" || type === "message_end") {
        const message = (typed as { message?: unknown }).message;
        if (!message) continue;
        const role = getMessageRole(message);
        const text = extractTextFromMessage(message);
        if (!text) continue;
        const msgId = (message as Record<string, unknown>).id as string | undefined;
        const id = msgId ?? `evt_${type}_${assistantMap.size}`;
        if (role === "assistant") {
          const key = id;
          if (assistantMap.has(key)) {
            const idx = assistantMap.get(key)!;
            msgs[idx] = { ...msgs[idx], content: text };
          } else {
            if (
              type === "message_update" &&
              msgs.length > 0 &&
              msgs[msgs.length - 1].role === "assistant"
            ) {
              const lastIdx = msgs.length - 1;
              msgs[lastIdx] = { ...msgs[lastIdx], content: text };
              assistantMap.set(key, lastIdx);
            } else {
              const newMsg: Message = { id, role: "assistant", content: text };
              assistantMap.set(key, msgs.length);
              msgs.push(newMsg);
            }
          }
        } else if (role === "user") {
          const exists = msgs.some((m) => m.role === "user" && m.content === text);
          if (!exists) {
            const newMsg: Message = { id, role: "user", content: text };
            msgs.push(newMsg);
          }
        }
      }
    }
    return msgs;
  }, [agent.events, localMessages]);

  const messages = derivedMessages;

  const error = (() => {
    if (errorOverride) return errorOverride;
    if (agent.error) return { title: "Agente", detail: agent.error };
    for (let i = agent.events.length - 1; i >= 0; i--) {
      const ev = agent.events[i] as Record<string, unknown> | undefined;
      if (ev && ev.type === "notice" && (ev as { level?: string }).level === "error") {
        return {
          title: "Error",
          detail: String((ev as { message?: unknown }).message ?? "Error del agente"),
        };
      }
    }
    return null;
  })();

  const streaming = agent.isStreaming;
  const loading = agent.isStreaming && messages.length === 0;

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const streamingWords = useMemo(() => {
    if (!lastAssistant || !streaming) return [];
    return lastAssistant.content.split(" ");
  }, [lastAssistant, streaming]);

  const visibleWords = streaming ? streamingWords.length : 0;
  const visibleSteps = reasoningSteps.length;

  useEffect(() => {
    if (!streaming) {
      startRef.current = null;
      return;
    }
    if (startRef.current === null) startRef.current = Date.now();
    const id = setInterval(() => {
      if (startRef.current !== null) {
        const sec = (Date.now() - startRef.current) / 1000;
        setElapsed(`${sec.toFixed(1)}s`);
      }
    }, 100);
    return () => clearInterval(id);
  }, [streaming]);

  const toggleReasoning = useCallback((id: string) => {
    setOpenReasonings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSend = useCallback(
    async (value: string, attachments: unknown[]) => {
      if (!value.trim() && attachments.length === 0) return;
      const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: value };
      setLocalMessages((prev) => [...prev, userMsg]);
      setErrorOverride(null);
      setRetrying(false);
      let images: string[] | undefined;
      if (attachments.length > 0) {
        const maybeImages = attachments
          .map((a) => {
            if (typeof a === "string" && a.startsWith("data:image")) return a;
            if (a && typeof a === "object" && "data" in (a as Record<string, unknown>)) {
              const d = (a as Record<string, unknown>).data;
              if (typeof d === "string") return d;
            }
            return null;
          })
          .filter(Boolean) as string[];
        if (maybeImages.length > 0) images = maybeImages;
      }
      try {
        await agent.send(value, images);
      } catch (err) {
        setErrorOverride({
          title: "No disponible",
          detail: err instanceof Error ? err.message : String(err),
        });
      }
    },
    [agent],
  );

  const handleRetry = useCallback(() => {
    setErrorOverride(null);
    setRetrying(true);
    const lastUser = [...localMessages].reverse().find((m) => m.role === "user");
    if (lastUser) void handleSend(lastUser.content, []);
    setTimeout(() => setRetrying(false), 1000);
  }, [handleSend, localMessages]);

  const handleSaveEdit = useCallback(
    async (editingId: string, editValue: string) => {
      if (!editingId) return;
      setLocalMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === editingId);
        if (idx === -1) return prev;
        const next = prev.map((m, i) => (i === idx ? { ...m, content: editValue } : m));
        if (idx + 1 < next.length && next[idx + 1].role === "assistant")
          return next.slice(0, idx + 1);
        return next;
      });
      try {
        await agent.steer(editValue);
      } catch {
        await agent.send(editValue);
      }
    },
    [agent],
  );

  const startStreaming = useCallback((_responseText: string) => {}, []);

  return {
    messages,
    setMessages: setLocalMessages,
    loading,
    streaming,
    streamingWords,
    visibleWords,
    reasoningSteps,
    visibleSteps,
    reasoningOpen,
    setReasoningOpen,
    openReasonings,
    toggleReasoning,
    elapsed,
    error,
    setError: setErrorOverride,
    retrying,
    messagesEndRef,
    handleSend,
    handleRetry,
    handleSaveEdit,
    startStreaming,
    agent,
    businessId,
  };
}
