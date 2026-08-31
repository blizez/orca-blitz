import { app } from "electron";
import * as path from "node:path";
import * as fs from "node:fs";

export interface AgentConfig {
  ompSourceDir: string;
  ompCliPath: string;
  sessionDir: string;
  defaultModel: string;
  defaultProvider: string;
  enabledTools: string[];
}

function findOmpSource(): string | null {
  // 1) Env override — permite OMP_SOURCE_DIR para CI / custom installs
  const envDir = process.env.OMP_SOURCE_DIR?.trim();
  if (envDir && fs.existsSync(path.join(envDir, "packages", "coding-agent", "src", "cli.ts"))) {
    return envDir;
  }
  // 2) Ruta canónica absoluta (plan step 5) + variantes portable
  const candidates = [
    "C:/Users/Luxury/orca/orca-blitz/blitz_tui_infraestructura",
    path.join(app.getPath("home"), "orca", "orca-blitz", "blitz_tui_infraestructura"),
    path.join(app.getPath("home"), "orca", "blitz_tui_infraestructura"),
  ];
  for (const dir of candidates) {
    const cliPath = path.join(dir, "packages", "coding-agent", "src", "cli.ts");
    if (fs.existsSync(cliPath)) return dir;
  }
  return null;
}

export function loadAgentConfig(): AgentConfig {
  const ompDir = findOmpSource();
  const sessionDir = path.join(app.getPath("userData"), "agent-sessions");

  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  return {
    ompSourceDir: ompDir ?? "",
    ompCliPath: ompDir ? path.join(ompDir, "packages", "coding-agent", "src", "cli.ts") : "",
    sessionDir,
    defaultProvider: "anthropic",
    defaultModel: "claude-sonnet-4-20250514",
    enabledTools: ["read", "write", "edit", "bash", "grep", "glob", "web_search"],
  };
}

let cachedConfig: AgentConfig | null = null;

export function getAgentConfig(): AgentConfig {
  if (!cachedConfig) cachedConfig = loadAgentConfig();
  return cachedConfig;
}
