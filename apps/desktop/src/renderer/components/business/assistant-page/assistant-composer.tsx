import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import {
  Composer,
  ComposerBar,
  ComposerInput,
  ComposerSend,
  ComposerToolbar,
  ComposerActions,
  ComposerAttachButton,
  ComposerMenu,
  ComposerMenuItem,
  ComposerCommandItem,
  ComposerVoice,
  ComposerVoiceButton,
  ComposerModelTrigger,
  ComposerModelItem,
  ComposerAttachments,
  ComposerAttachmentChip,
  useSlashMatches,
  useMentionMatches,
  applyMention,
  type ComposerCommand,
  type ComposerPerson,
  type ComposerAttachment,
  type ComposerModel,
} from "@orca-blitz/ui/components/composer";
import { COMMANDS, PEOPLE, MODELS } from "./types";
import { useAgent } from "@/hooks/useAgent";

interface AssistantComposerProps {
  onSend: (value: string, attachments: ComposerAttachment[]) => void;
}

export function AssistantComposer({ onSend }: AssistantComposerProps) {
  const { t } = useTranslation("sidebar");
  const agent = useAgent();
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [modelOpen, setModelOpen] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  // Derive available models: prefer agent.availableModels, fallback to providerConfigs cached models, then static MODELS
  const dynamicModels: ComposerModel[] = (() => {
    if (agent.availableModels.length > 0) {
      return agent.availableModels.map((m) => ({
        name: `${m.provider}/${m.id}`,
        meta: m.provider,
      }));
    }
    try {
      const configsRaw = localStorage.getItem("oc_provider_configs");
      const cacheRaw = localStorage.getItem("oc_provider_models_cache");
      if (configsRaw) {
        const configs = JSON.parse(configsRaw) as Record<
          string,
          {
            selectedModel?: string | null;
            selectedModelZen?: string | null;
            selectedModelGo?: string | null;
          }
        >;
        const cache = cacheRaw ? (JSON.parse(cacheRaw) as Record<string, string[]>) : {};
        const providerOrder = Object.keys(configs);
        for (const pid of providerOrder) {
          const cfg = configs[pid];
          const sel = cfg.selectedModel ?? cfg.selectedModelZen ?? cfg.selectedModelGo;
          if (sel) {
            const cached = cache[pid] ?? cache[`${pid}:zen`] ?? cache[`${pid}:go`];
            if (cached && cached.length > 0)
              return cached.slice(0, 20).map((mid) => ({ name: mid, meta: pid }));
            return [{ name: sel, meta: pid }];
          }
        }
      }
    } catch {
      // ignore
    }
    return MODELS;
  })();

  const selectedModel: ComposerModel = (() => {
    if (agent.model) {
      const found = dynamicModels.find(
        (m) =>
          m.name === agent.model ||
          m.name.endsWith(`/${agent.model}`) ||
          agent.model?.endsWith(m.name),
      );
      if (found) return found;
      const bySuffix = dynamicModels.find(
        (m) => agent.model?.includes(m.name) || m.name.includes(agent.model ?? ""),
      );
      if (bySuffix) return bySuffix;
      return { name: agent.model, meta: "" };
    }
    return (dynamicModels[0] ?? MODELS[0]) as ComposerModel;
  })();
  // Sync providerConfigs selectedModel to agent on first mount if agent still on default
  useEffect(() => {
    try {
      const raw = localStorage.getItem("oc_provider_configs");
      if (!raw) return;
      const configs = JSON.parse(raw) as Record<
        string,
        {
          selectedModel?: string | null;
          selectedModelZen?: string | null;
          selectedModelGo?: string | null;
        }
      >;
      for (const [pid, cfg] of Object.entries(configs)) {
        const sel = cfg.selectedModel ?? cfg.selectedModelZen ?? cfg.selectedModelGo;
        if (sel && sel.trim()) {
          const expected = `${pid}/${sel}`;
          if (agent.model !== expected && agent.model !== sel) {
            // Only set if agent model is still default or empty — avoid looping
            void agent.setModel(pid, sel);
          }
          break;
        }
      }
    } catch {
      // ignore
    }
  }, [agent]);

  const slashMatches = useSlashMatches(value, COMMANDS);
  const mentionMatches = useMentionMatches(value, PEOPLE);
  const showSlashMenu = slashMatches.length > 0;
  const showMentionMenu = mentionMatches.length > 0;

  const handleSlashSelect = useCallback((command: ComposerCommand) => {
    setValue(`/${command.name} `);
  }, []);

  const handleMentionSelect = useCallback((person: ComposerPerson) => {
    setValue((prev) => applyMention(prev, person.name));
  }, []);

  const handleAttach = useCallback(() => {
    const mock: ComposerAttachment = {
      name: `file-${Date.now()}.txt`,
      meta: "2.4 KB",
      state: "done",
      kind: "text",
    };
    setAttachments((prev) => [...prev, mock]);
  }, []);

  const handleRemoveAttachment = useCallback((name: string) => {
    setAttachments((prev) => prev.filter((a) => a.name !== name));
  }, []);

  const handleToggleRecording = useCallback(() => {
    if (recording) {
      setRecording(false);
      setSeconds(0);
    } else {
      setRecording(true);
      const id = setInterval(() => setSeconds((s) => s + 1), 1000);
      setTimeout(() => {
        clearInterval(id);
        setRecording(false);
        setSeconds(0);
      }, 30000);
    }
  }, [recording]);

  const handleEnhance = useCallback(() => {
    if (!value.trim()) return;
    setEnhancing(true);
    setTimeout(() => setEnhancing(false), 1500);
  }, [value]);

  const handleSend = useCallback(() => {
    if (!value.trim() && attachments.length === 0) return;
    onSend(value, attachments);
    setValue("");
    setAttachments([]);
  }, [value, attachments, onSend]);

  return (
    <>
      {attachments.length > 0 && (
        <ComposerAttachments className="mb-2">
          {attachments.map((a) => (
            <ComposerAttachmentChip key={a.name} attachment={a} onRemove={handleRemoveAttachment} />
          ))}
        </ComposerAttachments>
      )}

      <Composer>
        <ComposerMenu open={showSlashMenu}>
          {slashMatches.map((cmd) => (
            <ComposerCommandItem
              key={cmd.name}
              command={cmd}
              active={false}
              onClick={() => handleSlashSelect(cmd)}
            />
          ))}
        </ComposerMenu>

        <ComposerMenu open={showMentionMenu} align="end">
          {mentionMatches.map((person) => (
            <ComposerMenuItem
              key={person.name}
              active={false}
              onClick={() => handleMentionSelect(person)}
            >
              <span className="bg-sidebar-accent text-sidebar-foreground/50 flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-medium">
                {person.name[0]}
              </span>
              <span className="flex-1 truncate text-start">{person.name}</span>
            </ComposerMenuItem>
          ))}
        </ComposerMenu>

        <ComposerBar>
          {recording ? (
            <ComposerVoice recording={recording} seconds={seconds} />
          ) : (
            <ComposerInput
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={t("assistant.placeholder")}
              onSubmit={handleSend}
            />
          )}

          <ComposerToolbar>
            <ComposerActions>
              <ComposerAttachButton onClick={handleAttach} />
              <ComposerModelTrigger
                model={selectedModel.name}
                open={modelOpen}
                onClick={() => setModelOpen(!modelOpen)}
              />
              <ComposerMenu open={modelOpen} align="start">
                {dynamicModels.map((m) => (
                  <ComposerModelItem
                    key={m.name}
                    entry={m}
                    selected={m.name === selectedModel.name}
                    onClick={() => {
                      // Parse provider/model from m.name or m.meta
                      const raw = m.name;
                      let provider = m.meta;
                      let modelId = raw;
                      if (raw.includes("/")) {
                        const parts = raw.split("/");
                        provider = parts[0];
                        modelId = parts.slice(1).join("/");
                      } else if (!provider) {
                        // Fallback to first provider with that model in configs
                        try {
                          const configs = JSON.parse(
                            localStorage.getItem("oc_provider_configs") ?? "{}",
                          );
                          for (const [pid, cfg] of Object.entries(
                            configs as Record<string, { selectedModel?: string }>,
                          )) {
                            if ((cfg as { selectedModel?: string }).selectedModel === raw) {
                              provider = pid;
                              break;
                            }
                          }
                        } catch {
                          // ignore
                        }
                      }
                      if (provider && modelId) void agent.setModel(provider, modelId);
                      setModelOpen(false);
                    }}
                  />
                ))}
              </ComposerMenu>
            </ComposerActions>
            <ComposerActions>
              <ComposerVoiceButton active={recording} onClick={handleToggleRecording} />
              <button
                type="button"
                aria-label="Improve prompt"
                onClick={handleEnhance}
                disabled={!value.trim() || enhancing}
                className="flex items-center justify-center rounded-full text-sidebar-foreground/45 outline-none transition-[background-color,color,scale] duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:scale-[0.96] focus-visible:ring-1 focus-visible:ring-sidebar-ring motion-reduce:transition-none size-8 disabled:pointer-events-none disabled:opacity-30"
              >
                <Sparkles className={`size-4 ${enhancing ? "animate-spin" : ""}`} />
              </button>
              <ComposerSend
                streaming={false}
                idle={!value.trim() && attachments.length === 0}
                onClick={handleSend}
              />
            </ComposerActions>
          </ComposerToolbar>
        </ComposerBar>
      </Composer>
    </>
  );
}
