import { useState } from "react";
import {
  FileSearch,
  Terminal,
  Pencil,
  Globe,
  FolderSearch,
  ChevronDown,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ToolCall } from "./types";

const TOOL_ICONS: Record<string, typeof FileSearch> = {
  read: FileSearch,
  write: Pencil,
  edit: Pencil,
  bash: Terminal,
  grep: FolderSearch,
  glob: FolderSearch,
  web_search: Globe,
  browser: Globe,
  lsp: FileSearch,
  ast_grep: FileSearch,
  ast_edit: Pencil,
};

export function ToolCallCard({ tool }: { tool: ToolCall }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = TOOL_ICONS[tool.name] ?? Terminal;

  return (
    <div
      className={cn(
        "rounded-lg border text-xs transition-colors",
        tool.status === "error"
          ? "border-destructive/30 bg-destructive/5"
          : tool.status === "running"
            ? "border-primary/30 bg-primary/5"
            : "border-border/60 bg-muted/30",
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        {tool.status === "running" ? (
          <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" />
        ) : tool.status === "error" ? (
          <XCircle className="size-3.5 shrink-0 text-destructive" />
        ) : (
          <CheckCircle2 className="size-3.5 shrink-0 text-muted-foreground/60" />
        )}
        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="font-medium text-foreground/80">{tool.name}</span>
        {tool.args && (
          <span className="truncate text-muted-foreground/60">
            {tool.args.command
              ? String(tool.args.command).slice(0, 60)
              : tool.args.pattern
                ? String(tool.args.pattern)
                : tool.args.path
                  ? String(tool.args.path).split("/").pop()
                  : ""}
          </span>
        )}
        <ChevronDown
          className={cn(
            "ml-auto size-3 shrink-0 text-muted-foreground/40 transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>
      {expanded && tool.result && (
        <div className="border-t border-border/40 px-3 py-2">
          <pre className="max-h-40 overflow-auto whitespace-pre-wrap text-[11px] leading-relaxed text-muted-foreground">
            {tool.result}
          </pre>
        </div>
      )}
    </div>
  );
}
