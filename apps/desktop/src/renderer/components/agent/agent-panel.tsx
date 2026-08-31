import { useEffect, useRef, useState } from "react";
import { Button } from "@orca-blitz/ui/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@orca-blitz/ui/components/ui/card";
import { Input } from "@orca-blitz/ui/components/ui/input";
import { ScrollArea } from "@orca-blitz/ui/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@orca-blitz/ui/components/ui/select";
import { Loader2, Send, Square } from "lucide-react";
import { useAgent } from "@/hooks/useAgent";
import { useAppStore } from "@/store";

function ToolRow({ ev }: { ev: unknown }) {
  if (!ev || typeof ev !== "object" || !("type" in ev)) return null;
  const t = (ev as { type: string }).type;
  if (t !== "tool_execution_start" && t !== "tool_execution_update" && t !== "tool_execution_end")
    return null;
  const tool = ev as unknown as {
    toolName: string;
    args?: unknown;
    result?: unknown;
    isError?: boolean;
    toolCallId: string;
  };
  const collapsed = t === "tool_execution_start";
  return (
    <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="font-medium">{tool.toolName}</span>
        <span className="truncate text-muted-foreground">{tool.toolCallId.slice(0, 8)}</span>
        {t === "tool_execution_end" && tool.isError && (
          <span className="text-destructive">error</span>
        )}
      </div>
      {tool.args ? (
        <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap text-[11px] text-muted-foreground">
          {JSON.stringify(tool.args, null, 2).slice(0, 2000)}
        </pre>
      ) : null}
      {tool.result ? (
        <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap text-[11px]">
          {typeof tool.result === "string"
            ? tool.result.slice(0, 2000)
            : JSON.stringify(tool.result, null, 2).slice(0, 2000)}
        </pre>
      ) : null}
      {collapsed ? <span className="text-[11px] text-muted-foreground">running…</span> : null}
    </div>
  );
}

function MessageRow({ ev }: { ev: unknown }) {
  if (!ev || typeof ev !== "object" || !("type" in ev)) return null;
  const t = (ev as { type: string }).type;
  if (t !== "message_start" && t !== "message_update" && t !== "message_end") return null;
  const msg = (ev as { message?: unknown }).message as Record<string, unknown> | undefined;
  if (!msg) return <div className="text-xs text-muted-foreground">{t}</div>;
  const content = (msg.content as unknown[]) ?? [];
  // content may be string or array; normalize
  let text = "";
  if (typeof msg.content === "string") text = msg.content;
  else if (Array.isArray(content)) {
    for (const block of content as Array<Record<string, unknown>>) {
      if (block.type === "text" && typeof block.text === "string") text += block.text;
      if (block.type === "thinking" && typeof block.thinking === "string") text += block.thinking;
    }
  } else if (typeof (msg as Record<string, unknown>).text === "string") {
    text = (msg as Record<string, unknown>).text as string;
  }
  if (!text) text = JSON.stringify(msg).slice(0, 2000);
  return (
    <div className="rounded-md border bg-card px-3 py-2">
      <div className="text-xs font-medium text-muted-foreground">{t}</div>
      <div className="whitespace-pre-wrap text-sm leading-relaxed">{text.slice(0, 8000)}</div>
    </div>
  );
}

export function AgentPanel() {
  const agent = useAgent();
  const activeBusinessId = useAppStore((s) => s.activeBusinessId);
  const draftKey = `agent-draft:${activeBusinessId ?? "global"}`;
  const [input, setInput] = useState(() => {
    try {
      const saved = localStorage.getItem(`agent-draft:${activeBusinessId ?? "global"}`);
      return saved ?? "";
    } catch {
      return "";
    }
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(draftKey, input);
    } catch {
      // ignore
    }
  }, [input, draftKey]);

  // auto-scroll on new events
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [agent.events.length]);

  // Ctrl+Shift+C abort (like TUI app.interrupt) + Enter send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
    if (e.key.toLowerCase() === "c" && e.ctrlKey && e.shiftKey) {
      e.preventDefault();
      void agent.abort();
    }
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // ignore
    }
    try {
      await agent.send(trimmed);
    } catch (err) {
      // show in events via error state already
      console.error(err);
    }
  };

  if (agent.unavailable) {
    return (
      <Card className="m-4">
        <CardHeader>
          <CardTitle>Agente no disponible en modo web</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Ejecuta la app en Electron para usar el agente. (window.api ausente)
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <Select
          value={agent.model ?? ""}
          onValueChange={(v: string | null) => {
            if (!v || v === "__empty") return;
            const [provider, ...rest] = v.split("/");
            const modelId = rest.join("/");
            if (provider && modelId) void agent.setModel(provider, modelId);
          }}
        >
          <SelectTrigger className="w-[260px]">
            <SelectValue placeholder={agent.model ?? "Seleccionar modelo"} />
          </SelectTrigger>
          <SelectContent>
            {agent.availableModels.length === 0 ? (
              <SelectItem value="__empty" disabled>
                Sin modelos (verifica auth)
              </SelectItem>
            ) : (
              agent.availableModels.map((m) => (
                <SelectItem key={`${m.provider}/${m.id}`} value={`${m.provider}/${m.id}`}>
                  {m.provider}/{m.name ?? m.id}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <Select
          value={agent.thinkingLevel ?? "off"}
          onValueChange={(v: string | null) => void agent.setThinkingLevel(v ?? "off")}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Thinking" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="off">off</SelectItem>
            <SelectItem value="low">low</SelectItem>
            <SelectItem value="medium">medium</SelectItem>
            <SelectItem value="high">high</SelectItem>
            <SelectItem value="max">max</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => void agent.abort()}
          disabled={!agent.isStreaming}
        >
          <Square className="mr-1 size-3" /> Abort (Ctrl+Shift+C)
        </Button>
        {agent.isStreaming && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        {agent.error && <span className="text-xs text-destructive">{agent.error}</span>}
      </div>

      <Card className="flex min-h-0 flex-1 flex-col">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Eventos del agente</CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col p-0">
          <ScrollArea className="flex-1">
            <div ref={scrollRef} className="flex max-h-[60vh] flex-col gap-2 overflow-auto p-3">
              {agent.events.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Sin eventos — escribe un mensaje abajo.
                </div>
              ) : (
                agent.events.map((ev, idx) => {
                  const t = (ev as { type?: string }).type ?? "";
                  if (t.startsWith("tool_execution")) return <ToolRow key={idx} ev={ev} />;
                  if (t.startsWith("message_")) return <MessageRow key={idx} ev={ev} />;
                  return (
                    <div
                      key={idx}
                      className="rounded border bg-muted/20 px-3 py-1 text-xs text-muted-foreground"
                    >
                      <span className="font-mono">{t}</span> {JSON.stringify(ev).slice(0, 500)}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje al agente (Enter para enviar, Shift+Enter nueva línea)"
          className="flex-1"
        />
        <Button onClick={() => void handleSend()} disabled={!input.trim() || agent.isStreaming}>
          <Send className="mr-1 size-4" /> Enviar
        </Button>
      </div>
      <div className="text-[11px] text-muted-foreground">
        Enter envía • Ctrl+Shift+C aborta • draft persiste por business
      </div>
    </div>
  );
}
