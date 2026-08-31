import { Openai, OpenaiDark } from "@orca-blitz/ui/components/ui/svgs";
import { AnthropicBlack, AnthropicWhite } from "@orca-blitz/ui/components/ui/svgs";
import { Google } from "@orca-blitz/ui/components/ui/svgs";
import { Deepseek } from "@orca-blitz/ui/components/ui/svgs";
import { OllamaDark, OllamaLight } from "@orca-blitz/ui/components/ui/svgs";
import { OpenCode, OpenCodeDark } from "@orca-blitz/ui/components/ui/svgs";
import type { BuiltInProvider } from "./types";

function GenericIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <rect width="24" height="24" rx="4" fill="currentColor" fillOpacity="0.1" />
      <text x="12" y="16" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="600">
        ?
      </text>
    </svg>
  );
}

const G = GenericIcon;

export const builtInProviders: BuiltInProvider[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    Icon: AnthropicBlack,
    IconDark: AnthropicWhite,
    placeholder: "sk-ant-...",
  },
  { id: "openai", name: "OpenAI", Icon: Openai, IconDark: OpenaiDark, placeholder: "sk-..." },
  { id: "google", name: "Google Gemini", Icon: Google, IconDark: Google, placeholder: "AI..." },
  { id: "deepseek", name: "DeepSeek", Icon: Deepseek, IconDark: Deepseek, placeholder: "sk-..." },
  {
    id: "ollama",
    name: "Ollama",
    Icon: OllamaLight,
    IconDark: OllamaDark,
    placeholder: "http://localhost:11434",
  },
  {
    id: "opencode-zen",
    name: "OpenCode Zen",
    Icon: OpenCode,
    IconDark: OpenCodeDark,
    placeholder: "sk-...",
  },
  {
    id: "opencode-go",
    name: "OpenCode Go",
    Icon: OpenCode,
    IconDark: OpenCodeDark,
    placeholder: "sk-...",
  },
  { id: "xai", name: "xAI", Icon: G, IconDark: G, placeholder: "xai-..." },
  { id: "xai-oauth", name: "xAI (OAuth)", Icon: G, IconDark: G, placeholder: "" },
  { id: "openrouter", name: "OpenRouter", Icon: G, IconDark: G, placeholder: "sk-or-..." },
  { id: "groq", name: "Groq", Icon: G, IconDark: G, placeholder: "gsk_..." },
  { id: "mistral", name: "Mistral", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "together", name: "Together", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "fireworks", name: "Fireworks", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "cerebras", name: "Cerebras", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "github-copilot", name: "GitHub Copilot", Icon: G, IconDark: G, placeholder: "" },
  { id: "cursor", name: "Cursor", Icon: G, IconDark: G, placeholder: "" },
  { id: "amazon-bedrock", name: "Amazon Bedrock", Icon: G, IconDark: G, placeholder: "" },
  { id: "google-vertex", name: "Google Vertex AI", Icon: G, IconDark: G, placeholder: "" },
  { id: "azure", name: "Azure OpenAI", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "siliconflow", name: "SiliconFlow", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "siliconflow-cn", name: "SiliconFlow CN", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "nvidia", name: "NVIDIA", Icon: G, IconDark: G, placeholder: "nvapi-..." },
  { id: "huggingface", name: "Hugging Face", Icon: G, IconDark: G, placeholder: "hf_..." },
  {
    id: "lm-studio",
    name: "LM Studio",
    Icon: G,
    IconDark: G,
    placeholder: "http://localhost:1234",
  },
  { id: "vllm", name: "vLLM", Icon: G, IconDark: G, placeholder: "http://localhost:8000" },
  { id: "litellm", name: "LiteLLM", Icon: G, IconDark: G, placeholder: "http://localhost:4000" },
  { id: "devin", name: "Devin", Icon: G, IconDark: G, placeholder: "" },
  { id: "gitlab-duo", name: "GitLab Duo", Icon: G, IconDark: G, placeholder: "" },
  { id: "gitlab-duo-agent", name: "GitLab Duo Agent", Icon: G, IconDark: G, placeholder: "" },
  { id: "moonshot", name: "Moonshot (Kimi)", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "kimi-code", name: "Kimi Code", Icon: G, IconDark: G, placeholder: "" },
  { id: "minimax", name: "MiniMax", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "minimax-code", name: "MiniMax Code", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "minimax-code-cn", name: "MiniMax Code (CN)", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "meta", name: "Meta", Icon: G, IconDark: G, placeholder: "" },
  { id: "zai", name: "Z.AI (GLM)", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "zai-coding-plan", name: "Z.AI Coding Plan", Icon: G, IconDark: G, placeholder: "" },
  {
    id: "zhipu-coding-plan",
    name: "Zhipu Coding Plan",
    Icon: G,
    IconDark: G,
    placeholder: "sk-...",
  },
  { id: "qianfan", name: "Qianfan (Baidu)", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "qwen-portal", name: "Qwen Portal", Icon: G, IconDark: G, placeholder: "" },
  { id: "xiaomi", name: "Xiaomi MiMo", Icon: G, IconDark: G, placeholder: "sk-..." },
  {
    id: "xiaomi-token-plan-ams",
    name: "Xiaomi Token Plan (EU)",
    Icon: G,
    IconDark: G,
    placeholder: "sk-...",
  },
  {
    id: "xiaomi-token-plan-cn",
    name: "Xiaomi Token Plan (CN)",
    Icon: G,
    IconDark: G,
    placeholder: "sk-...",
  },
  {
    id: "xiaomi-token-plan-sgp",
    name: "Xiaomi Token Plan (SG)",
    Icon: G,
    IconDark: G,
    placeholder: "sk-...",
  },
  { id: "venice", name: "Venice", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "nanogpt", name: "NanoGPT", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "novita", name: "Novita", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "baseten", name: "Baseten", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "coreweave", name: "CoreWeave", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "gmi-cloud", name: "GMI Cloud", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "sakana", name: "Sakana AI", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "aiand", name: "ai&", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "aimlapi", name: "AIML API", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "firepass", name: "Fire Pass", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "kilo", name: "Kilo Gateway", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "zenmux", name: "ZenMux", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "synthetic", name: "Synthetic", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "parallel", name: "Parallel", Icon: G, IconDark: G, placeholder: "sk-..." },
  {
    id: "cloudflare-ai-gateway",
    name: "Cloudflare AI Gateway",
    Icon: G,
    IconDark: G,
    placeholder: "sk-...",
  },
  {
    id: "vercel-ai-gateway",
    name: "Vercel AI Gateway",
    Icon: G,
    IconDark: G,
    placeholder: "sk-...",
  },
  { id: "wafer-serverless", name: "Wafer Serverless", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "ollama-cloud", name: "Ollama Cloud", Icon: G, IconDark: G, placeholder: "sk-..." },
  { id: "openai-codex", name: "OpenAI Codex", Icon: Openai, IconDark: OpenaiDark, placeholder: "" },
  {
    id: "openai-codex-device",
    name: "ChatGPT Plus/Pro (Codex)",
    Icon: Openai,
    IconDark: OpenaiDark,
    placeholder: "",
  },
  { id: "umans", name: "Umans AI", Icon: G, IconDark: G, placeholder: "sk-..." },
  {
    id: "google-gemini-cli",
    name: "Google Gemini CLI",
    Icon: Google,
    IconDark: Google,
    placeholder: "",
  },
  {
    id: "google-antigravity",
    name: "Google Antigravity",
    Icon: Google,
    IconDark: Google,
    placeholder: "",
  },
  { id: "bedrock-mantle", name: "Bedrock Mantle", Icon: G, IconDark: G, placeholder: "" },
  {
    id: "alibaba-coding-plan",
    name: "Alibaba Coding Plan",
    Icon: G,
    IconDark: G,
    placeholder: "sk-...",
  },
  {
    id: "alibaba-token-plan",
    name: "Alibaba Token Plan",
    Icon: G,
    IconDark: G,
    placeholder: "sk-...",
  },
  { id: "perplexity", name: "Perplexity", Icon: G, IconDark: G, placeholder: "pplx-..." },
  {
    id: "llama.cpp",
    name: "llama.cpp",
    Icon: G,
    IconDark: G,
    placeholder: "http://localhost:8080",
  },
  { id: "exa", name: "Exa", Icon: G, IconDark: G, placeholder: "" },
  { id: "kagi", name: "Kagi", Icon: G, IconDark: G, placeholder: "" },
  { id: "tavily", name: "Tavily", Icon: G, IconDark: G, placeholder: "" },
];
