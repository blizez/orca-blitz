import { useState, useCallback, useRef } from "react";
import { type ReasoningStep } from "@orca-blitz/ui/components/reasoning-panel";
import type { Message } from "./types";

export function useAssistantStreaming() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamingWords, setStreamingWords] = useState<string[]>([]);
  const [visibleWords, setVisibleWords] = useState(0);
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [reasoningOpen, setReasoningOpen] = useState(true);
  const [openReasonings, setOpenReasonings] = useState<Set<string>>(new Set());
  const [elapsed, setElapsed] = useState("0.0s");
  const [error, setError] = useState<{ title: string; detail: string } | null>(null);
  const [retrying, setRetrying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleReasoning = useCallback((id: string) => {
    setOpenReasonings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const startStreaming = useCallback((responseText: string) => {
    const mockReasoning: ReasoningStep[] = [
      { title: "Analyzing request", body: "Understanding the user intent and context..." },
      { title: "Searching codebase", body: "Looking for relevant files and patterns..." },
      { title: "Generating response", body: "Formulating the answer with code examples..." },
    ];
    const words = responseText.split(" ");
    setLoading(false);
    setStreaming(true);
    setStreamingWords([]);
    setVisibleWords(0);
    setReasoningSteps(mockReasoning);
    setVisibleSteps(0);
    setReasoningOpen(true);
    setElapsed("0.0s");

    let stepIdx = 0;
    let elapsedMs = 0;
    const reasoningInterval = setInterval(() => {
      elapsedMs += 200;
      setElapsed(`${(elapsedMs / 1000).toFixed(1)}s`);
      if (stepIdx < mockReasoning.length && elapsedMs % 600 === 0) {
        stepIdx++;
        setVisibleSteps(stepIdx);
      }
      if (stepIdx >= mockReasoning.length && elapsedMs % 600 === 0) {
        clearInterval(reasoningInterval);
        setReasoningOpen(false);
        setTimeout(() => {
          setStreamingWords(words);
          let current = 0;
          const wordInterval = setInterval(() => {
            current++;
            setVisibleWords(current);
            if (current >= words.length) {
              clearInterval(wordInterval);
              setStreaming(false);
              const finalElapsed = `${(elapsedMs / 1000).toFixed(1)}s`;
              const assistantMsg: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: responseText,
                reasoning: {
                  steps: mockReasoning,
                  elapsed: finalElapsed,
                },
              };
              setMessages((prev) => [...prev, assistantMsg]);
              setStreamingWords([]);
              setVisibleWords(0);
              setReasoningSteps([]);
              setVisibleSteps(0);
            }
          }, 60);
        }, 300);
      }
    }, 200);
  }, []);

  const handleSend = useCallback(
    (value: string, attachments: unknown[]) => {
      if (!value.trim() && attachments.length === 0) return;
      const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: value };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      setReasoningSteps([]);
      setVisibleSteps(0);
      setReasoningOpen(true);
      setElapsed("0.0s");

      if (value.trim() === "/error") {
        setTimeout(() => {
          setLoading(false);
          setError({
            title: "Modelo no disponible",
            detail: "El servicio de IA no responde. Intenta de nuevo en unos segundos.",
          });
        }, 1000);
        return;
      }

      const responseText =
        "I'll help you with that. Let me analyze the code and suggest improvements. Here are the key areas we should focus on: performance optimization, code readability, and error handling.";

      setTimeout(() => {
        startStreaming(responseText);
      }, 1000);
    },
    [startStreaming],
  );

  const handleRetry = useCallback(() => {
    setError(null);
    setRetrying(true);
    setTimeout(() => {
      setRetrying(false);
      startStreaming("I'll help you with that. Let me analyze the code and suggest improvements.");
    }, 1000);
  }, [startStreaming]);

  const handleSaveEdit = useCallback(
    (editingId: string, editValue: string) => {
      if (!editingId) return;
      setMessages((prev) => {
        const idx = prev.findIndex((m) => m.id === editingId);
        if (idx === -1) return prev;
        const next = prev.map((m, i) => (i === idx ? { ...m, content: editValue } : m));
        if (idx + 1 < next.length && next[idx + 1].role === "assistant") {
          return next.slice(0, idx + 1);
        }
        return next;
      });
      setLoading(true);
      setTimeout(() => {
        startStreaming(
          "I'll help you with that. Let me analyze the code and suggest improvements.",
        );
      }, 1000);
    },
    [startStreaming],
  );

  return {
    messages,
    setMessages,
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
    setError,
    retrying,
    messagesEndRef,
    handleSend,
    handleRetry,
    handleSaveEdit,
    startStreaming,
  };
}
