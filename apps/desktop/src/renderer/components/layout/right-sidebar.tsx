import { useTranslation } from "react-i18next";
import { Receipt, BarChart3, Users, Bell } from "lucide-react";
import { useAppStore } from "@/store";
import { Tooltip, TooltipTrigger, TooltipContent } from "@orca-blitz/ui/components/ui/tooltip";

type PanelId = "billing" | "reports" | "contacts" | "notifications";

interface RightSidebarProps {
  onNavigate: (page: string) => void;
}

export function RightSidebar({ onNavigate }: RightSidebarProps) {
  const { t } = useTranslation("sidebar");
  const activeBusinessId = useAppStore((s) => s.activeBusinessId);
  const rightSidebarOpen = useAppStore((s) => s.rightSidebarOpen);

  const navItems: { id: PanelId; icon: typeof Receipt; label: string }[] = [
    { id: "billing", icon: Receipt, label: t("rightSidebar.billing") },
    { id: "reports", icon: BarChart3, label: t("rightSidebar.reports") },
    { id: "contacts", icon: Users, label: t("rightSidebar.contactsPanel") },
    { id: "notifications", icon: Bell, label: t("rightSidebar.notifications") },
  ];

  if (!activeBusinessId || !rightSidebarOpen) return null;

  return (
    <aside className="relative z-40 flex h-full flex-col bg-sidebar text-sidebar-foreground w-[52px] border-l border-sidebar-border">
      <div className="flex flex-col items-center gap-1 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Tooltip key={item.id}>
              <TooltipTrigger
                render={
                  <button
                    onClick={() => onNavigate(item.id)}
                    className="flex size-8 items-center justify-center rounded-md transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <Icon className="size-4" />
                  </button>
                }
              />
              <TooltipContent side="left" sideOffset={8}>
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </aside>
  );
}
