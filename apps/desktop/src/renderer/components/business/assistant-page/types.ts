import { Terminal, FileCode, MessageSquare, Lightbulb } from "lucide-react";
import { type ReasoningStep } from "@orca-blitz/ui/components/reasoning-panel";
import { type QuoteAction } from "@orca-blitz/ui/components/quote-reply";
import type {
  ComposerCommand,
  ComposerPerson,
  ComposerModel,
  ComposerUsage,
} from "@orca-blitz/ui/components/composer";

export interface AssistantPageProps {
  businessId: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  reasoning?: {
    steps: ReasoningStep[];
    elapsed: string;
  };
}

export interface SelectionState {
  msgId: string;
  text: string;
  x: number;
  y: number;
}

export const COMMANDS: ComposerCommand[] = [
  { name: "fix", description: "Fix a bug or error", icon: Terminal },
  { name: "explain", description: "Explain how something works", icon: MessageSquare },
  { name: "refactor", description: "Refactor code for better quality", icon: FileCode },
  { name: "suggest", description: "Get improvement suggestions", icon: Lightbulb },
];

export const PEOPLE: ComposerPerson[] = [
  { name: "Alice", role: "agent" },
  { name: "Bob", role: "human" },
];

export const MODELS: ComposerModel[] = [
  { name: "Claude 4 Sonnet", meta: "128k" },
  { name: "Claude 4 Opus", meta: "200k" },
  { name: "GPT-4o", meta: "128k" },
];

export const USAGE: ComposerUsage = {
  system: 2,
  tools: 1,
  messages: 5,
  total: 128,
};

export const QUOTE_ACTIONS: QuoteAction[] = [
  { key: "quote", label: "Quote", icon: "quote" },
  { key: "explain", label: "Explain", icon: "explain" },
  { key: "rewrite", label: "Rewrite", icon: "rewrite" },
];
