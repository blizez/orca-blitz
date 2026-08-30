import { useEffect } from "react";
import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { TypingIndicator } from "@orca-blitz/ui/components/typing-indicator";
import { ErrorState } from "@orca-blitz/ui/components/error-state";
import { EditMessage } from "@orca-blitz/ui/components/edit-message";
import { ReasoningPanel, type ReasoningStep } from "@orca-blitz/ui/components/reasoning-panel";
import type { Message } from "./types";

interface AssistantMessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  streaming: boolean;
  streamingWords: string[];
  visibleWords: number;
  reasoningSteps: ReasoningStep[];
  visibleSteps: number;
  reasoningOpen: boolean;
  openReasonings: Set<string>;
  toggleReasoning: (id: string) => void;
  setReasoningOpen: (open: boolean) => void;
  elapsed: string;
  loading: boolean;
  error: { title: string; detail: string } | null;
  retrying: boolean;
  onRetry: () => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editValue: string;
  setEditValue: (value: string) => void;
  onStartEdit: (msg: Message) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

export function AssistantMessageList({
  messages,
  messagesEndRef,
  streaming,
  streamingWords,
  visibleWords,
  reasoningSteps,
  visibleSteps,
  reasoningOpen,
  openReasonings,
  toggleReasoning,
  setReasoningOpen,
  elapsed,
  loading,
  error,
  retrying,
  onRetry,
  editingId,
  setEditingId: _setEditingId,
  editValue,
  setEditValue,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
}: AssistantMessageListProps) {
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messagesEndRef]);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          data-msg-id={msg.role === "assistant" ? msg.id : undefined}
          className={cn(
            "flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both",
            msg.role === "user" ? "items-end" : "items-start",
          )}
        >
          <div className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="size-4" />
              </div>
            )}
            {msg.role === "user" && editingId === msg.id ? (
              <EditMessage
                value={editValue}
                discardedReplies={0}
                editing={true}
                onValueChange={setEditValue}
                onSave={onSaveEdit}
                onCancel={onCancelEdit}
              />
            ) : msg.role === "user" ? (
              <EditMessage
                value={msg.content}
                discardedReplies={0}
                editing={false}
                onStartEdit={() => onStartEdit(msg)}
              />
            ) : (
              <div className="flex w-full flex-col gap-2">
                {msg.reasoning && msg.reasoning.steps.length > 0 && (
                  <ReasoningPanel
                    steps={msg.reasoning.steps}
                    visibleSteps={msg.reasoning.steps.length}
                    streaming={false}
                    open={openReasonings.has(msg.id)}
                    onOpenChange={() => toggleReasoning(msg.id)}
                    restingLabel="Reasoning complete"
                    elapsed={msg.reasoning.elapsed}
                  />
                )}
                <div className="text-sm leading-relaxed text-foreground">{msg.content}</div>
              </div>
            )}
            {msg.role === "user" && editingId !== msg.id && (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <User className="size-4" />
              </div>
            )}
          </div>
        </div>
      ))}
      {(streaming || reasoningSteps.length > 0) && (
        <div className="flex gap-3 animate-in fade-in duration-200">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bot className="size-4" />
          </div>
          <div className="flex w-full flex-col gap-2">
            {reasoningSteps.length > 0 && (
              <ReasoningPanel
                steps={reasoningSteps}
                visibleSteps={visibleSteps}
                streaming={streaming}
                open={reasoningOpen}
                onOpenChange={setReasoningOpen}
                restingLabel="Reasoning complete"
                elapsed={elapsed}
              />
            )}
            {streaming && visibleSteps >= reasoningSteps.length && (
              <p className="text-sm leading-relaxed text-foreground/90">
                {streamingWords.slice(0, visibleWords).map((word, index) => {
                  const fresh = streamingWords.length - 1 - index < 2;
                  return (
                    <span
                      key={`${word}-${index}`}
                      className="fade-in animate-in fill-mode-both duration-500 motion-reduce:animate-none"
                    >
                      <span
                        className={cn(
                          "transition-colors duration-700 motion-reduce:transition-none",
                          fresh && "text-primary",
                        )}
                      >
                        {word}
                      </span>{" "}
                    </span>
                  );
                })}
                {streaming && visibleWords > 0 && (
                  <span
                    aria-hidden
                    className="-mb-0.5 ml-0.5 inline-block h-4 w-0.5 animate-pulse rounded-full bg-primary motion-reduce:animate-none"
                  />
                )}
              </p>
            )}
          </div>
        </div>
      )}
      {error && (
        <div className="flex gap-3 animate-in fade-in duration-200">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <Bot className="size-4" />
          </div>
          <ErrorState
            title={error.title}
            detail={error.detail}
            retrying={retrying}
            onRetry={onRetry}
          />
        </div>
      )}
      {loading && !streaming && !error && (
        <div className="flex items-center gap-3 animate-in fade-in duration-200">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bot className="size-4" />
          </div>
          <TypingIndicator variant="bare" />
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
