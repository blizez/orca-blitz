import { useState, type ReactNode } from "react";
import { Minus, Square, X, Maximize2, PanelRightClose } from "lucide-react";

interface TitlebarProps {
  center?: ReactNode;
  rightSidebarOpen?: boolean;
  onToggleRightSidebar?: () => void;
}

export function Titlebar({ center, rightSidebarOpen, onToggleRightSidebar }: TitlebarProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  const handleMaximize = async () => {
    await window.api.window.maximize();
    const maximized = await window.api.window.isMaximized();
    setIsMaximized(maximized);
  };

  return (
    <div
      className="flex h-8 shrink-0 select-none items-center border-b border-border bg-background"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      <div className="flex flex-1 min-w-0 items-center">{center}</div>
      <div
        className="flex items-center gap-0.5 px-1"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        {onToggleRightSidebar && (
          <button
            onClick={onToggleRightSidebar}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {rightSidebarOpen ? (
              <PanelRightClose className="size-3.5" />
            ) : (
              <PanelRightClose className="size-3.5 rotate-180" />
            )}
          </button>
        )}
        <button
          onClick={() => window.api.window.minimize()}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Minus className="size-3.5" />
        </button>
        <button
          onClick={() => handleMaximize()}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {isMaximized ? <Maximize2 className="size-3" /> : <Square className="size-3" />}
        </button>
        <button
          onClick={() => window.api.window.close()}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
