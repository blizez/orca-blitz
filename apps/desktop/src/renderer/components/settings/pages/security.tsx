import { useTranslation } from "react-i18next";

export function SecuritySettings() {
  const { t } = useTranslation("settings");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t("security.title")}</h3>
        <p className="text-sm text-muted-foreground">{t("security.description")}</p>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium">{t("security.twoFactor.label")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("security.twoFactor.notEnabled")}</p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium">{t("security.sessions.label")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("security.sessions.count")}</p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-sm font-medium">{t("security.apiKeys.label")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("security.apiKeys.noKeys")}</p>
        </div>
      </div>
    </div>
  );
}
