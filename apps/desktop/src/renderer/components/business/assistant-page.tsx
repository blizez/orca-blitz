import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  EmptyState,
  EmptyStateGreeting,
  EmptyStateSuggestions,
  EmptyStateSuggestion,
} from "@orca-blitz/ui/components/empty-state";
import { useAssistantStreaming } from "./assistant-page/use-assistant-streaming";
import { useSelectionToolbar } from "./assistant-page/use-selection-toolbar";
import { AssistantMessageList } from "./assistant-page/assistant-message-list";
import { AssistantComposer } from "./assistant-page/assistant-composer";
import { SelectionToolbar } from "./assistant-page/selection-toolbar";
import { QUOTE_ACTIONS, type Message } from "./assistant-page/types";

interface AssistantPageProps {
  businessId: string;
}

export function AssistantPage({ businessId }: AssistantPageProps) {
  const { t } = useTranslation("sidebar");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const streaming = useAssistantStreaming(businessId);
  const selection = useSelectionToolbar(streaming.messages);

  const hasMessages = streaming.messages.length > 0;

  const handleSend = useCallback(
    (value: string, attachments: unknown[]) => {
      streaming.handleSend(value, attachments);
    },
    [streaming],
  );

  const handleStartEdit = useCallback((msg: Message) => {
    setEditingId(msg.id);
    setEditValue(msg.content);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingId) return;
    streaming.handleSaveEdit(editingId, editValue);
    setEditingId(null);
    setEditValue("");
  }, [editingId, editValue, streaming]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditValue("");
  }, []);

  const handleQuoteAction = useCallback(
    (key: string) => {
      selection.handleQuoteAction(key, (_fn) => {});
    },
    [selection],
  );

  // Ctrl+Shift+C abort like TUI
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "c" && e.ctrlKey && e.shiftKey) {
        e.preventDefault();
        void streaming.agent.abort();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [streaming.agent]);

  return (
    <div className="flex h-full flex-col">
      {streaming.agent.unavailable && (
        <div className="mx-6 mt-4 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200">
          Agente no disponible en modo web — ejecuta en Electron para chatear con la IA (mismo CORE
          que TUI).
        </div>
      )}
      {streaming.error && streaming.error.detail.includes("OMP not found") && (
        <div className="mx-6 mt-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">
          OMP no encontrado. Instala Bun (https://bun.sh) y verifica blitz_tui_infraestructura.
        </div>
      )}
      {streaming.streaming && (
        <div className="flex justify-end px-6 pt-2">
          <button
            onClick={() => void streaming.agent.abort()}
            className="rounded-md border px-2 py-1 text-xs hover:bg-muted"
          >
            Abortar (Ctrl+Shift+C)
          </button>
        </div>
      )}
      {hasMessages ? (
        <>
          <div className="flex-1 overflow-y-auto p-6">
            <AssistantMessageList
              messages={streaming.messages}
              messagesEndRef={streaming.messagesEndRef}
              streaming={streaming.streaming}
              streamingWords={streaming.streamingWords}
              visibleWords={streaming.visibleWords}
              reasoningSteps={streaming.reasoningSteps}
              visibleSteps={streaming.visibleSteps}
              reasoningOpen={streaming.reasoningOpen}
              openReasonings={streaming.openReasonings}
              toggleReasoning={streaming.toggleReasoning}
              setReasoningOpen={streaming.setReasoningOpen}
              elapsed={streaming.elapsed}
              loading={streaming.loading}
              error={streaming.error}
              retrying={streaming.retrying}
              onRetry={streaming.handleRetry}
              editingId={editingId}
              setEditingId={setEditingId}
              editValue={editValue}
              setEditValue={setEditValue}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
            />
          </div>
          <div className="flex justify-center p-6 pt-0">
            <div className="w-full max-w-2xl">
              <AssistantComposer onSend={handleSend} />
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
          <EmptyState className="max-w-md">
            <EmptyStateGreeting>{t("assistant.greeting")}</EmptyStateGreeting>
            <EmptyStateSuggestions>
              <EmptyStateSuggestion index={0} onClick={() => {}}>
                {t("assistant.suggestionFix")}
              </EmptyStateSuggestion>
              <EmptyStateSuggestion index={1} onClick={() => {}}>
                {t("assistant.suggestionExplain")}
              </EmptyStateSuggestion>
              <EmptyStateSuggestion index={2} onClick={() => {}}>
                {t("assistant.suggestionImprove")}
              </EmptyStateSuggestion>
            </EmptyStateSuggestions>
          </EmptyState>
          <div className="w-full max-w-2xl">
            <AssistantComposer onSend={handleSend} />
          </div>
        </div>
      )}
      <SelectionToolbar
        selectedText={selection.selectedText}
        visible={selection.toolbarVisible}
        actions={QUOTE_ACTIONS}
        onAction={handleQuoteAction}
      />
    </div>
  );
}
