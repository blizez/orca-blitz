import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { mono } from "@/lib/surfaces";
import { clamp, pct } from "@/lib/range";
import type { ComposerUsage } from "./types";

export function ComposerContext({
  usage,
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & { usage: ComposerUsage }) {
  const used = usage.system + usage.tools + usage.messages;
  const fraction = usage.total === 0 ? 0 : used / usage.total;
  const warn = fraction > 0.85;
  const circumference = 2 * Math.PI * 6;
  const segments = [
    { label: "System", value: usage.system, className: "bg-sidebar-foreground/25" },
    { label: "Tools", value: usage.tools, className: "bg-sidebar-foreground/45" },
    { label: "Messages", value: usage.messages, className: "bg-sidebar-foreground/80" },
  ];

  return (
    <div data-slot="composer-context" className={cn("group/ctx relative", className)} {...props}>
      <div
        className={cn(
          "absolute end-0 bottom-full z-10 mb-2 flex w-60 origin-bottom-right flex-col gap-3.5 rounded-lg p-4",
          "bg-sidebar text-sidebar-foreground border border-sidebar-border",
          "transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
          "pointer-events-none scale-[0.97] opacity-0",
          "group-hover/ctx:pointer-events-auto group-hover/ctx:scale-100 group-hover/ctx:opacity-100",
          "group-focus-within/ctx:pointer-events-auto group-focus-within/ctx:scale-100 group-focus-within/ctx:opacity-100",
        )}
      >
        <div className="flex items-baseline justify-between">
          <p className="text-[13.5px] font-medium">Context</p>
          <p
            className={cn(
              mono,
              "tabular-nums",
              warn ? "text-destructive" : "text-sidebar-foreground/50",
            )}
          >
            {Math.round(fraction * 100)}%
          </p>
        </div>
        <div className="bg-sidebar-accent flex h-[5px] w-full gap-px overflow-hidden rounded-full">
          {segments.map((segment) => (
            <span
              key={segment.label}
              className={cn(
                "h-full transition-[width] duration-700 motion-reduce:transition-none",
                segment.className,
              )}
              style={{ width: `${pct(segment.value, usage.total)}%` }}
            />
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {segments.map((segment) => (
            <div
              key={segment.label}
              className="text-sidebar-foreground/70 flex items-center gap-2.5 text-[13px]"
            >
              <span aria-hidden className={cn("size-1.5 rounded-full", segment.className)} />
              <span className="flex-1">{segment.label}</span>
              <span className={cn(mono, "text-sidebar-foreground/50 tabular-nums")}>
                {segment.value}k
              </span>
            </div>
          ))}
        </div>
        <div className="bg-sidebar-border h-px" />
        <div className="text-sidebar-foreground/70 flex items-center justify-between text-[13px]">
          <span>Total</span>
          <span className={cn(mono, "text-sidebar-foreground/50 tabular-nums")}>
            {used}k / {usage.total}k
          </span>
        </div>
      </div>
      <button
        type="button"
        aria-label="Context usage"
        className={cn(
          "flex items-center justify-center rounded-full text-sidebar-foreground/45 outline-none transition-[background-color,color,scale] duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:scale-[0.96] focus-visible:ring-1 focus-visible:ring-sidebar-ring motion-reduce:transition-none",
          "size-8",
          warn && "text-destructive",
        )}
      >
        <svg viewBox="0 0 16 16" className="size-4 -rotate-90" aria-hidden>
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            strokeWidth="2.5"
            className="stroke-sidebar-foreground/10"
          />
          <circle
            cx="8"
            cy="8"
            r="6"
            fill="none"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="stroke-current transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - clamp(fraction, 0, 1))}
          />
        </svg>
      </button>
    </div>
  );
}
