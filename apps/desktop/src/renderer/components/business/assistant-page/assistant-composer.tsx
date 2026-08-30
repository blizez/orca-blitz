import { useState, useCallback } from "react";
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
  ComposerContext,
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
} from "@orca-blitz/ui/components/composer";
import { COMMANDS, PEOPLE, MODELS, USAGE } from "./types";

interface AssistantComposerProps {
  onSend: (value: string, attachments: ComposerAttachment[]) => void;
}

export function AssistantComposer({ onSend }: AssistantComposerProps) {
  const { t } = useTranslation("sidebar");
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([]);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [enhancing, setEnhancing] = useState(false);

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
                {MODELS.map((m) => (
                  <ComposerModelItem
                    key={m.name}
                    entry={m}
                    selected={m.name === selectedModel.name}
                    onClick={() => {
                      setSelectedModel(m);
                      setModelOpen(false);
                    }}
                  />
                ))}
              </ComposerMenu>
              <ComposerContext usage={USAGE} />
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
