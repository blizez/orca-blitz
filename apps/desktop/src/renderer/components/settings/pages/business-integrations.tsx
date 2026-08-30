import { useEffect, useState } from "react";
import { CheckCircle2, Link2, Loader2, Mail, MessageCircle, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@orca-blitz/ui/components/ui/dialog";
import { Button } from "@orca-blitz/ui/components/ui/button";
import { Input } from "@orca-blitz/ui/components/ui/input";
import { toast } from "@orca-blitz/ui/components/ui/toast";
import type { Business, ChannelSession } from "@orca-blitz/shared";
import { ConnectWhatsAppCard } from "../../integrations/connect-whatsapp-card";

type AccountChannel = "whatsapp" | "instagram" | "facebook" | "telegram" | "gmail";

const channels: Array<{ id: AccountChannel; name: string; description: string }> = [
  { id: "whatsapp", name: "WhatsApp", description: "Escanea un QR. Sin configuración extra." },
  { id: "instagram", name: "Instagram", description: "Inicia sesión con tu usuario y contraseña." },
  {
    id: "facebook",
    name: "Facebook Messenger",
    description: "Inicia sesión con tu email y contraseña.",
  },
  { id: "telegram", name: "Telegram", description: "Usa tu teléfono y código." },
  { id: "gmail", name: "Gmail", description: "Conecta tu correo con Google." },
];

export function BusinessIntegrations({
  businessId,
  business,
  embedded = false,
}: {
  businessId: string;
  business?: Business | null;
  embedded?: boolean;
}) {
  const [statuses, setStatuses] = useState<Record<string, ChannelSession>>({});
  const [loading, setLoading] = useState<AccountChannel | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [loginChannel, setLoginChannel] = useState<AccountChannel | null>(null);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      const entries = await Promise.all(
        channels.map(async (item) => {
          let status: ChannelSession;
          if (item.id === "gmail") {
            status = (await window.api.integrations.gmailGetStatus(businessId)) as ChannelSession;
          } else {
            status = (await window.api.integrations.getStatus(
              businessId,
              item.id,
            )) as ChannelSession;
          }
          return [item.id, status] as const;
        }),
      );
      if (active) setStatuses(Object.fromEntries(entries));
    };
    void load();
    const removeStatus = window.api.integrations.onStatus((value) => {
      const status = value as ChannelSession;
      if (status.businessId === businessId)
        setStatuses((current) => ({ ...current, [status.channel]: status }));
    });
    const removeQr = window.api.integrations.onQR((value) => {
      if (value.businessId === businessId) {
        setQr(value.qr);
        setStatuses((current) => ({
          ...current,
          whatsapp: {
            ...current.whatsapp,
            businessId,
            channel: "whatsapp",
            status: "qr",
          } as ChannelSession,
        }));
      }
    });
    return () => {
      active = false;
      removeStatus();
      removeQr();
    };
  }, [businessId]);

  async function connect(channel: AccountChannel): Promise<void> {
    // Para Instagram/Messenger abrimos login directo sin pasar por Meta OAuth
    if (channel === "instagram" || channel === "facebook") {
      setLoginChannel(channel);
      setLoginUser("");
      setLoginPass("");
      return;
    }
    setLoading(channel);
    // Optimistic feedback: muestra spinner y estado conectando al instante
    setStatuses((current) => ({
      ...current,
      [channel]: { businessId, channel, status: "connecting" } as ChannelSession,
    }));
    toast.add({
      title: `Conectando ${channel}...`,
      description: "Se abrirá una ventana para iniciar sesión. Sigue los pasos del navegador.",
      type: "info",
    });
    try {
      if (channel === "gmail") {
        await window.api.integrations.gmailConnect(businessId);
      } else if (channel === "telegram") {
        await window.api.integrations.telegramConnect(businessId);
      } else {
        await window.api.integrations.connect(businessId);
      }
      let status: ChannelSession;
      if (channel === "gmail") {
        status = (await window.api.integrations.gmailGetStatus(businessId)) as ChannelSession;
      } else {
        status = (await window.api.integrations.getStatus(businessId, channel)) as ChannelSession;
      }
      setStatuses((current) => ({ ...current, [channel]: status }));
      if (
        status.error === "google_credentials_missing" ||
        status.error === "telegram_credentials_missing"
      ) {
        toast.add({
          title: "Servicio no disponible",
          description: "La conexión con este canal no está configurada. Contacta al administrador.",
          type: "error",
        });
      }
    } finally {
      setLoading(null);
    }
  }

  async function submitLogin(): Promise<void> {
    if (!loginChannel) return;
    const channel = loginChannel;
    if (!loginUser.trim() || !loginPass.trim()) {
      toast.add({ title: "Completa usuario y contraseña", type: "error" });
      return;
    }
    setLoading(channel);
    setStatuses((current) => ({
      ...current,
      [channel]: { businessId, channel, status: "connecting" } as ChannelSession,
    }));
    try {
      let status: ChannelSession;
      if (channel === "instagram") {
        status = (await window.api.integrations.instagramLogin(
          businessId,
          loginUser.trim(),
          loginPass,
        )) as ChannelSession;
      } else {
        status = (await window.api.integrations.messengerLogin(
          businessId,
          loginUser.trim(),
          loginPass,
        )) as ChannelSession;
      }
      setStatuses((current) => ({ ...current, [channel]: status }));
      if (status.status === "connected") {
        toast.add({ title: `${channel} conectado`, type: "success" });
        setLoginChannel(null);
      } else if (status.error) {
        toast.add({ title: "Error al conectar", description: status.error, type: "error" });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al iniciar sesión";
      toast.add({ title: "Error", description: msg, type: "error" });
      setStatuses((current) => ({
        ...current,
        [channel]: { businessId, channel, status: "error", error: msg } as ChannelSession,
      }));
    } finally {
      setLoading(null);
    }
  }

  async function disconnect(channel: AccountChannel): Promise<void> {
    if (channel === "gmail") {
      await window.api.integrations.gmailDisconnect(businessId);
    } else if (channel === "instagram") {
      await window.api.integrations.instagramDisconnect(businessId);
    } else if (channel === "facebook") {
      await window.api.integrations.messengerDisconnect(businessId);
    } else if (channel === "telegram") {
      await window.api.integrations.telegramDisconnect(businessId);
    } else {
      await window.api.integrations.disconnect(businessId);
    }
    setStatuses((current) => ({
      ...current,
      [channel]: { businessId, channel, status: "disconnected" },
    }));
  }

  const [flowOpen, setFlowOpen] = useState(false);

  const flowChannel = (["whatsapp", "telegram"] as const).find((id) =>
    ["qr", "phone", "code", "password"].includes(statuses[id]?.status ?? ""),
  );

  useEffect(() => {
    if (flowChannel) setFlowOpen(true);
    else setFlowOpen(false);
  }, [flowChannel]);

  return (
    <div className="space-y-6">
      {!embedded && (
        <header>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Canales y cuentas</h1>
            {business && (
              <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {business.name}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Conecta las cuentas de este negocio. Social Media usará estas conexiones para
            centralizar los mensajes.
          </p>
        </header>
      )}

      <Dialog open={flowOpen && !!flowChannel} onOpenChange={setFlowOpen}>
        <DialogContent className="max-w-[420px] gap-0 border-0 bg-transparent p-0 shadow-none [&>button]:text-white [&>button]:hover:text-white">
          <DialogHeader className="sr-only">
            <DialogTitle>Conectar {flowChannel}</DialogTitle>
          </DialogHeader>
          {flowChannel && (
            <ConnectWhatsAppCard
              channel={flowChannel}
              session={statuses[flowChannel] ?? null}
              qr={qr}
              onConnect={(value) => {
                if (flowChannel === "telegram")
                  void window.api.integrations.telegramStartLogin(businessId, value ?? "");
                else void window.api.integrations.connect(businessId);
              }}
              onSubmitCode={(value) =>
                void window.api.integrations.telegramSubmitCode(businessId, value)
              }
              onSubmitPassword={(value) =>
                void window.api.integrations.telegramSubmitPassword(businessId, value)
              }
              onDisconnect={() => {
                setQr(null);
                setFlowOpen(false);
                if (flowChannel === "telegram")
                  void window.api.integrations.telegramDisconnect(businessId);
                else void window.api.integrations.disconnect(businessId);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!loginChannel} onOpenChange={(o) => !o && setLoginChannel(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Conectar{" "}
              {loginChannel === "instagram"
                ? "Instagram"
                : loginChannel === "facebook"
                  ? "Facebook Messenger"
                  : loginChannel}
            </DialogTitle>
            <DialogDescription>
              Inicia sesión con tu cuenta. Sin configuración extra.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                {loginChannel === "instagram" ? "Usuario" : "Email"}
              </label>
              <Input
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder={loginChannel === "instagram" ? "usuario" : "email@ejemplo.com"}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Contraseña</label>
              <Input
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Tus credenciales se guardan cifradas localmente.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoginChannel(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => void submitLogin()}
              disabled={loading === loginChannel || !loginUser.trim() || !loginPass.trim()}
            >
              {loading === loginChannel ? <Loader2 className="size-4 animate-spin" /> : null}
              Iniciar sesión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-3">
        {channels.map((channel) => {
          const status = statuses[channel.id];
          const connected = status?.status === "connected";
          const pending = status?.status === "connecting" || loading === channel.id;
          return (
            <div
              key={channel.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                {channel.id === "gmail" ? (
                  <Mail className="size-5 text-muted-foreground" />
                ) : (
                  <MessageCircle className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">{channel.name}</h2>
                  {connected && <CheckCircle2 className="size-4 text-primary" />}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{channel.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {connected ? (
                  <>
                    <span className="text-xs text-primary">Conectado</span>
                    <button
                      type="button"
                      onClick={() => void disconnect(channel.id)}
                      className="rounded-lg border border-border bg-card px-3 py-2 text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      Desconectar
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={pending || flowChannel === channel.id}
                    onClick={() => void connect(channel.id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 hover:shadow-md disabled:opacity-60"
                  >
                    {pending ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Link2 className="size-3.5" />
                    )}
                    Conectar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        <XCircle className="mt-0.5 size-4 shrink-0" />
        <p>
          Las cuentas se guardan por negocio. No uses esta sección para envíos masivos: cada
          plataforma tiene sus propios límites y políticas.
        </p>
      </div>
    </div>
  );
}
