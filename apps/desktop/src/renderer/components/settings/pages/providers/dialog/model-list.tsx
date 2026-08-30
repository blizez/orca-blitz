import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Cpu } from "lucide-react";
import { Label } from "@orca-blitz/ui/components/ui/label";
import { cn } from "@/lib/utils";

interface ModelListProps {
  models: string[];
  selectedModel: string | null;
  isFetching: boolean;
  onSelect: (model: string) => void;
}

export const ModelList = forwardRef<HTMLDivElement, ModelListProps>(
  ({ models, selectedModel, isFetching, onSelect }, ref) => {
    const { t } = useTranslation("providers");

    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <Cpu className="size-3" />
          {models.length > 0 ? t("models.select") : t("models.model")}
        </Label>

        {models.length > 0 ? (
          <div
            ref={ref}
            className="grid grid-cols-1 gap-1.5 max-h-[240px] overflow-y-auto rounded-lg border border-border p-2"
          >
            {models.map((model) => (
              <label
                key={model}
                onClick={() => onSelect(model)}
                data-selected={selectedModel === model ? "true" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 cursor-pointer transition-all",
                  selectedModel && selectedModel !== model && "opacity-40",
                )}
              >
                <div
                  className={cn(
                    "size-4 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors",
                    selectedModel === model
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/40",
                  )}
                >
                  {selectedModel === model && (
                    <div className="size-1.5 rounded-full bg-primary-foreground" />
                  )}
                </div>
                <span className="text-sm font-mono">{model}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-4 text-center">
            <p className="text-xs text-muted-foreground">
              {isFetching ? t("models.detecting") : t("apiKey.enterKey")}
            </p>
          </div>
        )}
      </div>
    );
  },
);

ModelList.displayName = "ModelList";
