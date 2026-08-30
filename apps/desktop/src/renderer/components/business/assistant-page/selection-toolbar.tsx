import { createPortal } from "react-dom";
import { MessageSquare, Lightbulb, FileCode } from "lucide-react";
import type { SelectionState } from "./types";

const ICONS = {
  quote: MessageSquare,
  explain: Lightbulb,
  rewrite: FileCode,
} as const;

interface SelectionToolbarProps {
  selectedText: SelectionState | null;
  visible: boolean;
  actions: { key: string; label: string; icon: keyof typeof ICONS }[];
  onAction: (key: string) => void;
}

export function SelectionToolbar({
  selectedText,
  visible,
  actions,
  onAction,
}: SelectionToolbarProps) {
  if (!visible || !selectedText) return null;

  return createPortal(
    <div
      className="fixed z-50"
      style={{ left: selectedText.x, top: selectedText.y, transform: "translateX(-50%)" }}
    >
      <div className="flex items-center gap-0.5 rounded-full border border-border/60 bg-background p-1 shadow-lg dark:bg-popover">
        {actions.map((action) => {
          const Icon = ICONS[action.icon];
          return (
            <button
              key={action.key}
              type="button"
              onClick={() => onAction(action.key)}
              className="text-foreground/60 hover:bg-foreground/[0.06] hover:text-foreground/90 flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium transition-[background-color,color,scale] duration-150 active:scale-[0.96]"
            >
              <Icon className="size-3.5" />
              {action.label}
            </button>
          );
        })}
      </div>
    </div>,
    document.body,
  );
}
