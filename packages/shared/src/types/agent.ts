// synced from blitz_tui_infraestructura/packages/wire/src/index.ts@18.0.4
// synced from blitz_tui_infraestructura/packages/coding-agent/src/session/agent-session-events.ts@18.0.4
// synced from blitz_tui_infraestructura/packages/coding-agent/src/session/session-listing.ts@18.0.4
// synced from blitz_tui_infraestructura/packages/catalog/src/types.ts@18.0.4 (Model)
// Keep strict, no any — update comment when resyncing.

export type AgentEvent =
  | { type: "agent_start" }
  | { type: "agent_end"; isTerminal?: boolean }
  | { type: "turn_start" }
  | { type: "turn_end" }
  | { type: "message_start"; message: unknown }
  | { type: "message_update"; message: unknown }
  | { type: "message_end"; message: unknown }
  | {
      type: "tool_execution_start";
      toolCallId: string;
      toolName: string;
      args: unknown;
      intent?: string;
    }
  | {
      type: "tool_execution_update";
      toolCallId: string;
      toolName: string;
      args: unknown;
      partialResult: unknown;
    }
  | {
      type: "tool_execution_end";
      toolCallId: string;
      toolName: string;
      result: unknown;
      isError?: boolean;
    }
  | { type: "notice"; level: "info" | "warning" | "error"; message: string; source?: string }
  | { type: "auto_compaction_start"; reason: string; action: string }
  | {
      type: "auto_compaction_end";
      aborted: boolean;
      willRetry: boolean;
      errorMessage?: string;
      skipped?: boolean;
    }
  | {
      type: "auto_retry_start";
      attempt: number;
      maxAttempts: number;
      delayMs: number;
      errorMessage: string;
    }
  | { type: "auto_retry_end"; success: boolean; attempt: number; finalError?: string }
  | {
      type: "thinking_level_changed";
      thinkingLevel?: string;
      configured?: string;
      resolved?: string;
    }
  | { type: "model_changed" }
  | { type: "goal_updated"; goal: unknown; state?: unknown }
  | { type: "omp:disconnected"; code: number | null };

export type SessionStatus =
  | "complete"
  | "interrupted"
  | "aborted"
  | "error"
  | "pending"
  | "unknown";

export interface SessionInfo {
  path: string;
  id: string;
  cwd: string;
  title?: string;
  parentSessionPath?: string;
  created: Date;
  modified: Date;
  messageCount: number;
  size: number;
  firstMessage: string;
  allMessagesText: string;
  status?: SessionStatus;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
}

export type AgentSessionEvent = AgentEvent;
