import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Link2, Loader2 } from "lucide-react";
import type { DevToolIntegration, DevToolSession } from "@orca-blitz/shared";

interface IntegrationItem {
  id: string;
  name: string;
  descriptionKey: string;
}

const devToolIntegrations: IntegrationItem[] = [
  { id: "github", name: "GitHub", descriptionKey: "integrations.descriptions.github" },
  { id: "gitlab", name: "GitLab", descriptionKey: "integrations.descriptions.gitlab" },
  { id: "linear", name: "Linear", descriptionKey: "integrations.descriptions.linear" },
  { id: "jira", name: "Jira", descriptionKey: "integrations.descriptions.jira" },
];

function IntegrationCard({
  item,
  status,
  onConnect,
  onDisconnect,
  loading,
}: {
  item: IntegrationItem;
  status?: DevToolSession;
  onConnect: () => void;
  onDisconnect: () => void;
  loading: boolean;
}) {
  const { t } = useTranslation("settings");
  const connected = status?.status === "connected";
  const pending = status?.status === "connecting" || loading;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <span className="text-sm font-bold text-muted-foreground">{item.name[0]}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">{item.name}</h2>
          {connected && <CheckCircle2 className="size-4 text-primary" />}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{t(item.descriptionKey)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {connected ? (
          <>
            <span className="text-xs text-primary">{t("integrations.connected")}</span>
            <button
              type="button"
              onClick={onDisconnect}
              className="rounded-lg border border-border bg-card px-3 py-2 text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {t("integrations.disconnected")}
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={onConnect}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 hover:shadow-md disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Link2 className="size-3.5" />
            )}
            {t("integrations.notConnected")}
          </button>
        )}
      </div>
    </div>
  );
}

export function IntegrationsSettings() {
  const { t } = useTranslation("settings");
  const [devToolStatuses, setDevToolStatuses] = useState<Record<string, DevToolSession>>({});
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const ids = devToolIntegrations.map((i) => i.id) as DevToolIntegration[];
      const entries = await Promise.all(
        ids.map(async (id) => {
          const session = await window.api.devtools.getStatus(id);
          return [id, session] as const;
        }),
      );
      if (active) setDevToolStatuses(Object.fromEntries(entries));
    };
    void load();
    const unsub = window.api.devtools.onStatus((session) => {
      setDevToolStatuses((prev) => ({ ...prev, [session.integrationId]: session }));
    });
    return () => {
      active = false;
      unsub();
    };
  }, []);

  async function handleConnect(id: string) {
    setLoading(id);
    try {
      await window.api.devtools.connect(id as DevToolIntegration);
    } finally {
      setLoading(null);
    }
  }

  async function handleDisconnect(id: string) {
    setLoading(id);
    try {
      await window.api.devtools.disconnect(id as DevToolIntegration);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div>
        <h3 className="text-lg font-medium">{t("integrations.title")}</h3>
        <p className="text-sm text-muted-foreground">{t("integrations.description")}</p>
      </div>

      <section className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">
          {t("integrations.categories.developer")}
        </h4>
        <div className="space-y-3">
          {devToolIntegrations.map((item) => (
            <IntegrationCard
              key={item.id}
              item={item}
              status={devToolStatuses[item.id]}
              loading={loading === item.id}
              onConnect={() => void handleConnect(item.id)}
              onDisconnect={() => void handleDisconnect(item.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
