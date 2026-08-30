import { Openai, OpenaiDark } from "@orca-blitz/ui/components/ui/svgs";
import { AnthropicBlack, AnthropicWhite } from "@orca-blitz/ui/components/ui/svgs";
import { Google } from "@orca-blitz/ui/components/ui/svgs";
import { Deepseek } from "@orca-blitz/ui/components/ui/svgs";
import { OllamaDark, OllamaLight } from "@orca-blitz/ui/components/ui/svgs";
import { OpenCode, OpenCodeDark } from "@orca-blitz/ui/components/ui/svgs";
import type { BuiltInProvider } from "./types";

export const builtInProviders: BuiltInProvider[] = [
  {
    id: "opencode",
    name: "OpenCode",
    Icon: OpenCode,
    IconDark: OpenCodeDark,
    placeholder: "sk-...",
  },
  {
    id: "openai",
    name: "OpenAI",
    Icon: Openai,
    IconDark: OpenaiDark,
    placeholder: "sk-...",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    Icon: AnthropicBlack,
    IconDark: AnthropicWhite,
    placeholder: "sk-ant-...",
  },
  {
    id: "google",
    name: "Google AI",
    Icon: Google,
    IconDark: Google,
    placeholder: "AI...",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    Icon: Deepseek,
    IconDark: Deepseek,
    placeholder: "sk-...",
  },
  {
    id: "ollama",
    name: "Ollama",
    Icon: OllamaLight,
    IconDark: OllamaDark,
    placeholder: "http://localhost:11434",
  },
];

export const opencodeTabs = [
  { id: "zen", label: "Zen", endpoint: "https://opencode.ai/zen/v1/models" },
  { id: "go", label: "Go", endpoint: "https://opencode.ai/zen/go/v1/models" },
];
