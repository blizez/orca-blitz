import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Receipt, BarChart3, Users, Bell, FileText } from "lucide-react";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@orca-blitz/ui/components/ui/empty";
import { Titlebar } from "./components/layout/titlebar";
import { AppSidebar } from "./components/layout/app-sidebar";
import { RightSidebar } from "./components/layout/right-sidebar";
import { SettingsPage } from "./components/settings/settings-page";
import { HomePage } from "./components/home/home-page";
import { BusinessPage } from "./components/business/business-page";
import { SnippetsDrawer } from "./components/business/snippets-drawer";
import { OrcaLogo } from "@orca-blitz/ui/components/ui/logo";
import { useAppStore } from "./store";
import { ElementInspector } from "./components/dev-tools/element-inspector";
import type { Business } from "@orca-blitz/shared";

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [businessSettingsId, setBusinessSettingsId] = useState<string | null>(null);
  const [businessSettingsTab, setBusinessSettingsTab] = useState<string>("business");

  const businesses = useAppStore((s) => s.businesses);
  const setBusinesses = useAppStore((s) => s.setBusinesses);
  const setActiveBusinessId = useAppStore((s) => s.setActiveBusinessId);
  const activeBusinessId = useAppStore((s) => s.activeBusinessId);
  const rightSidebarOpen = useAppStore((s) => s.rightSidebarOpen);
  const toggleRightSidebar = useAppStore((s) => s.toggleRightSidebar);
  const setRightSidebarOpen = useAppStore((s) => s.setRightSidebarOpen);
  const toggleSnippetsDrawer = useAppStore((s) => s.toggleSnippetsDrawer);

  useEffect(() => {
    window.api.businesses.list().then((data) => {
      setBusinesses(data as Business[]);
    });

    const unsubscribe = window.api.businesses.onChanged((data) => {
      setBusinesses(data as Business[]);
    });

    return unsubscribe;
  }, [setBusinesses]);

  const handleNavigate = useCallback(
    (page: string) => {
      setActivePage(page);
      const isPanel = ["billing", "reports", "contacts", "notifications"].includes(page);
      if (isPanel) return;
      const bizId = page.includes(":") ? page.split(":")[0] : page;
      const matchedBiz = businesses.find((b) => b.id === bizId);
      setActiveBusinessId(matchedBiz ? bizId : null);
      if (matchedBiz) setRightSidebarOpen(true);
    },
    [businesses, setActiveBusinessId, setRightSidebarOpen],
  );

  const handleBusinessSettings = useCallback(
    (biz: Business, tab?: string) => {
      setBusinessSettingsId(biz.id);
      setBusinessSettingsTab(tab ?? "business");
      setActiveBusinessId(biz.id);
      setActivePage("settings");
    },
    [setBusinessSettingsId, setBusinessSettingsTab, setActiveBusinessId, setActivePage],
  );

  const handleUpdateBusiness = useCallback(
    (id: string, data: Partial<Business>) => {
      setBusinesses(businesses.map((b) => (b.id === id ? { ...b, ...data } : b)));
    },
    [businesses, setBusinesses],
  );

  const handleDeleteBusiness = useCallback(
    (id: string) => {
      setBusinesses(businesses.filter((b) => b.id !== id));
      setBusinessSettingsId(null);
      setActiveBusinessId(null);
      setActivePage("home");
    },
    [businesses, setBusinesses, setActiveBusinessId],
  );

  const isBusinessPage =
    activePage.includes(":") ||
    (!activePage.startsWith("business-") && businesses.some((b) => activePage === b.id));
  const activeBusinessForPage =
    businesses.find((b) => activePage === b.id || activePage.startsWith(b.id + ":")) ?? null;
  const activeBusiness = businessSettingsId
    ? (businesses.find((b) => b.id === businessSettingsId) ?? null)
    : null;

  useEffect(() => {
    const isMac = navigator.userAgent.includes("Mac");
    const mod = isMac ? "metaKey" : "ctrlKey";

    function handleKeyDown(e: KeyboardEvent) {
      if (!e[mod]) return;

      switch (e.key) {
        case "n":
          e.preventDefault();
          document.querySelector<HTMLButtonElement>("[data-add-business]")?.click();
          break;
        case "b":
          e.preventDefault();
          setSidebarOpen((prev) => !prev);
          break;
        case ",":
          e.preventDefault();
          setActivePage("settings");
          break;
        case "q":
          e.preventDefault();
          window.api.window.close();
          break;
        case "/":
          e.preventDefault();
          // TODO: implementar búsqueda global
          break;
        case "s":
          e.preventDefault();
          // TODO: implementar guardado context-aware
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen bg-background">
      <ElementInspector />
      {activePage !== "settings" && (
        <AppSidebar
          activePage={activePage}
          onNavigate={handleNavigate}
          collapsed={!sidebarOpen}
          onToggleCollapse={() => setSidebarOpen(!sidebarOpen)}
          businesses={businesses}
          onBusinessesChange={setBusinesses}
          onBusinessSettings={handleBusinessSettings}
        />
      )}
      <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
        <Titlebar
          center={
            activePage === "settings" ? (
              <div
                className="flex h-8 w-[220px] shrink-0 items-center border-b border-r border-sidebar-border bg-sidebar px-2"
                style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
              >
                <OrcaLogo className="size-4 text-foreground" />
              </div>
            ) : undefined
          }
          rightSidebarOpen={rightSidebarOpen}
          onToggleRightSidebar={activeBusinessId ? toggleRightSidebar : undefined}
        />
        <div className="flex flex-1 min-w-0 min-h-0 overflow-hidden">
          <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
            <main className="flex-1 overflow-hidden">
              {activePage === "settings" ? (
                <SettingsPage
                  onBack={() => {
                    handleNavigate("home");
                    setBusinessSettingsId(null);
                  }}
                  initialTab={businessSettingsTab}
                  businessId={businessSettingsId}
                  business={activeBusiness}
                  businesses={businesses}
                  onUpdateBusiness={handleUpdateBusiness}
                  onDeleteBusiness={handleDeleteBusiness}
                  onSelectBusiness={(biz) => setBusinessSettingsId(biz.id)}
                />
              ) : activePage === "home" ? (
                <HomePage />
              ) : activePage === "billing" ? (
                <BillingPage />
              ) : activePage === "reports" ? (
                <ReportsPage />
              ) : activePage === "contacts" ? (
                <ContactsPage />
              ) : activePage === "notifications" ? (
                <NotificationsPage />
              ) : isBusinessPage ? (
                <BusinessPage page={activePage} business={activeBusinessForPage} />
              ) : (
                <>
                  <header className="flex h-12 items-center border-b border-border px-6">
                    <h1 className="text-sm font-medium capitalize">
                      {activePage.replace("-", " ")}
                    </h1>
                  </header>
                  <div className="p-6">
                    <div className="mx-auto max-w-4xl space-y-6">
                      <h2 className="text-2xl font-bold capitalize">
                        {activePage.replace("-", " ")}
                      </h2>
                      <p className="text-muted-foreground">
                        This is the {activePage} module. Start building features here.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </main>
          </div>
          <RightSidebar onNavigate={handleNavigate} />
        </div>
      </div>

      {activeBusinessId && (
        <>
          <button
            onClick={toggleSnippetsDrawer}
            className="fixed bottom-6 z-50 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
            style={{ right: `${24 + (rightSidebarOpen ? 52 : 0)}px` }}
          >
            <FileText className="size-5" />
          </button>
          <SnippetsDrawer businessId={activeBusinessId} />
        </>
      )}
    </div>
  );
}

function BillingPage() {
  const { t } = useTranslation("sidebar");
  return (
    <div className="h-full overflow-y-auto scrollbar-sleek">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{t("rightSidebar.billing")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Gestiona facturación y pagos de tu negocio.
            </p>
          </div>
        </div>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Receipt />
            </EmptyMedia>
            <EmptyTitle>Sin facturación</EmptyTitle>
            <EmptyDescription>
              Agrega métodos de pago y gestiona tus facturas desde la configuración.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </div>
  );
}

function ReportsPage() {
  const { t } = useTranslation("sidebar");
  return (
    <div className="h-full overflow-y-auto scrollbar-sleek">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{t("rightSidebar.reports")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Analiza el rendimiento de tu negocio.
            </p>
          </div>
        </div>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BarChart3 />
            </EmptyMedia>
            <EmptyTitle>Sin reportes</EmptyTitle>
            <EmptyDescription>
              Los reportes se generarán automáticamente cuando tengas actividad.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </div>
  );
}

function ContactsPage() {
  const { t } = useTranslation("sidebar");
  return (
    <div className="h-full overflow-y-auto scrollbar-sleek">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{t("rightSidebar.contactsPanel")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Administra tus contactos y clientes.
            </p>
          </div>
        </div>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>Sin contactos</EmptyTitle>
            <EmptyDescription>
              Tus contactos aparecerán aquí cuando interactúen con tu negocio.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </div>
  );
}

function NotificationsPage() {
  const { t } = useTranslation("sidebar");
  return (
    <div className="h-full overflow-y-auto scrollbar-sleek">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{t("rightSidebar.notifications")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Revisa las notificaciones importantes.
            </p>
          </div>
        </div>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Bell />
            </EmptyMedia>
            <EmptyTitle>Sin notificaciones</EmptyTitle>
            <EmptyDescription>Recibirás notificaciones importantes aquí.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    </div>
  );
}
