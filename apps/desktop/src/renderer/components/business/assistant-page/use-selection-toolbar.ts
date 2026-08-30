import { useState, useCallback, useEffect } from "react";
import type { Message, SelectionState } from "./types";

export function useSelectionToolbar(messages: Message[]) {
  const [selectedText, setSelectedText] = useState<SelectionState | null>(null);
  const [toolbarVisible, setToolbarVisible] = useState(false);

  useEffect(() => {
    function handleMouseUp() {
      setTimeout(() => {
        const selection = window.getSelection();
        const text = selection?.toString().trim() || "";
        if (text.length > 2) {
          const range = selection?.getRangeAt(0);
          const container = range?.commonAncestorContainer;
          const msgEl = (
            container instanceof Element ? container : container?.parentElement
          )?.closest("[data-msg-id]");
          const msgId = msgEl?.getAttribute("data-msg-id") || "";
          if (!msgId) {
            setToolbarVisible(false);
            setSelectedText(null);
            return;
          }
          const isAssistant = messages.some((m) => m.id === msgId && m.role === "assistant");
          if (!isAssistant) {
            setToolbarVisible(false);
            setSelectedText(null);
            return;
          }
          const rect = range?.getBoundingClientRect();
          if (rect) {
            setSelectedText({ msgId, text, x: rect.left + rect.width / 2, y: rect.bottom + 8 });
            setToolbarVisible(true);
          }
        } else {
          setToolbarVisible(false);
          setSelectedText(null);
        }
      }, 10);
    }
    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [messages]);

  const handleQuoteAction = useCallback(
    (key: string, setValue: React.Dispatch<React.SetStateAction<string>>) => {
      if (!selectedText) return;
      if (key === "quote") {
        setValue((prev) => (prev ? `${prev}\n\n> ${selectedText.text}` : `> ${selectedText.text}`));
      } else if (key === "explain") {
        setValue(`Explain this: "${selectedText.text}"`);
      } else if (key === "rewrite") {
        setValue(`Rewrite this: "${selectedText.text}"`);
      }
      setSelectedText(null);
      setToolbarVisible(false);
      window.getSelection()?.removeAllRanges();
    },
    [selectedText],
  );

  return {
    selectedText,
    toolbarVisible,
    handleQuoteAction,
  };
}
