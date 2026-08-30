import { useState } from "react";
import { useTranslation } from "react-i18next";
import { X, FolderOpen, Globe, Plus, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSound } from "@/lib/sound-context";
import type { BusinessData } from "@orca-blitz/shared";

interface AddBusinessModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (business: BusinessData) => void;
}

export function AddBusinessModal({ open, onClose, onAdd }: AddBusinessModalProps) {
  const { t } = useTranslation("modals");
  const { play } = useSound();
  const [hovered, setHovered] = useState<string | null>(null);

  if (!open) return null;

  const handleExplore = () => {
    play("success");
    onAdd({
      name: "New Project",
      type: "other",
      industry: "",
      description: "",
      website: "",
      products: "",
      audience: "",
      competitors: "",
      usp: "",
      painPoints: "",
      monthlyRevenue: "",
      yearEstablished: "",
      channels: [],
      goals: [],
      teamSize: "",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative z-50 w-full max-w-md rounded-xl border border-border bg-background p-6 shadow-lg"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-foreground">{t("addProject.title")}</h2>
          <button
            onClick={() => {
              onClose();
              play("droplet");
            }}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Host selector */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">{t("addProject.host")}</span>
          <button className="flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2.5 py-1 text-sm text-foreground hover:bg-muted transition-colors">
            <Monitor className="size-3.5 text-muted-foreground" />
            {t("addProject.hostLocal")}
            <svg
              className="size-3.5 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* Main option */}
        <button
          onClick={handleExplore}
          onMouseEnter={() => setHovered("explore")}
          onMouseLeave={() => setHovered(null)}
          className={cn(
            "flex w-full items-start gap-3 rounded-lg border border-border p-4 text-left transition-colors mb-5",
            hovered === "explore" ? "bg-accent" : "bg-background",
          )}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <FolderOpen className="size-4.5 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-foreground">
              {t("addProject.exploreFolder")}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {t("addProject.exploreDescription")}
            </div>
          </div>
        </button>

        {/* Section divider */}
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
          {t("addProject.otherWays")}
        </div>

        {/* Other options */}
        <div className="space-y-0.5">
          <button
            onClick={handleExplore}
            onMouseEnter={() => setHovered("clone")}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors",
              hovered === "clone" ? "bg-accent" : "bg-background",
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Globe className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground">{t("addProject.cloneUrl")}</div>
              <div className="text-xs text-muted-foreground">
                {t("addProject.cloneDescription")}
              </div>
            </div>
          </button>

          <button
            onClick={handleExplore}
            onMouseEnter={() => setHovered("new")}
            onMouseLeave={() => setHovered(null)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors",
              hovered === "new" ? "bg-accent" : "bg-background",
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
              <Plus className="size-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground">{t("addProject.createNew")}</div>
              <div className="text-xs text-muted-foreground">
                {t("addProject.createDescription")}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
