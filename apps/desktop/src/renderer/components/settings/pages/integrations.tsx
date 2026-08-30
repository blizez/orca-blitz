import { useTranslation } from "react-i18next";
import { Gmail, Instagram, Slack, WhatsApp } from "@orca-blitz/ui/components/ui/svgs";

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  WhatsApp,
  Instagram,
  Gmail,
  Slack,
};

export function IntegrationsSettings() {
  const { t } = useTranslation("settings");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t("integrations.title")}</h3>
        <p className="text-sm text-muted-foreground">{t("integrations.description")}</p>
      </div>

      <div className="space-y-4">
        {(["WhatsApp", "Instagram", "Gmail", "Slack"] as const).map((name) => {
          const Icon = icons[name];
          return (
            <div
              key={name}
              className="flex items-center justify-between rounded-lg border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <Icon className="size-8" />
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">{t("integrations.notConnected")}</p>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {t("integrations.disconnected")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
