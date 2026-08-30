import { useState, useEffect, useCallback, useRef, forwardRef } from "react";
import { createPortal } from "react-dom";
import { X, Copy, Check, MousePointerClick, Layers, Code2, Palette, Maximize2 } from "lucide-react";

interface CapturedElement {
  tag: string;
  id: string;
  classes: string;
  text: string;
  html: string;
  computedStyles: Record<string, string>;
  dimensions: { width: number; height: number; top: number; left: number };
  ancestors: string;
  dataAttrs: Record<string, string>;
  rect: DOMRect;
}

function getReactFiber(el: Element): Record<string, string> {
  const fiberKey = Object.keys(el).find(
    (k) => k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$"),
  );
  if (!fiberKey) return {};
  const raw = (el as unknown as Record<string, unknown>)[fiberKey] as
    | Record<string, unknown>
    | undefined;
  if (!raw) return {};

  const info: Record<string, string> = {};
  let current: Record<string, unknown> | null = raw;
  let depth = 0;
  while (current && depth < 20) {
    if (typeof current.type === "function") {
      const fn = current.type as { name?: string; displayName?: string };
      info.component = fn.name || fn.displayName || "Anonymous";
      break;
    }
    if (typeof current.type === "string") {
      info.host = current.type;
      break;
    }
    current = current.return as Record<string, unknown> | null;
    depth++;
  }
  return info;
}

function captureElement(el: Element): CapturedElement {
  const rect = el.getBoundingClientRect();
  const computed = window.getComputedStyle(el);

  const styleKeys = [
    "display",
    "position",
    "width",
    "height",
    "margin",
    "padding",
    "border",
    "borderRadius",
    "background",
    "backgroundColor",
    "color",
    "fontSize",
    "fontWeight",
    "fontFamily",
    "lineHeight",
    "textAlign",
    "flex",
    "flexDirection",
    "alignItems",
    "justifyContent",
    "gap",
    "overflow",
    "opacity",
    "zIndex",
    "boxShadow",
  ];
  const computedStyles: Record<string, string> = {};
  for (const key of styleKeys) {
    const val = computed.getPropertyValue(key);
    if (
      val &&
      val !== "none" &&
      val !== "normal" &&
      val !== "0px" &&
      val !== "auto" &&
      val !== "rgba(0, 0, 0, 0)"
    ) {
      computedStyles[key] = val;
    }
  }

  const dataAttrs: Record<string, string> = {};
  for (const attr of Array.from(el.attributes)) {
    if (attr.name.startsWith("data-")) {
      dataAttrs[attr.name] = attr.value;
    }
  }

  const ancestors: string[] = [];
  let parent = el.parentElement;
  let depth = 0;
  while (parent && depth < 6) {
    const pTag = parent.tagName.toLowerCase();
    const pId = parent.id ? `#${parent.id}` : "";
    const pClass =
      parent.className && typeof parent.className === "string"
        ? "." + parent.className.split(/\s+/).filter(Boolean).slice(0, 2).join(".")
        : "";
    ancestors.push(`${pTag}${pId}${pClass}`);
    parent = parent.parentElement;
    depth++;
  }

  const outerHtml = el.outerHTML;
  const html = outerHtml.length > 800 ? outerHtml.slice(0, 800) + "..." : outerHtml;

  return {
    tag: el.tagName.toLowerCase(),
    id: el.id || "",
    classes: el.className && typeof el.className === "string" ? el.className : "",
    text: (el.textContent || "").trim().slice(0, 200),
    html,
    computedStyles,
    dimensions: { width: rect.width, height: rect.height, top: rect.top, left: rect.left },
    ancestors: ancestors.join(" → "),
    dataAttrs,
    rect,
  };
}

function formatForAI(el: CapturedElement, instruction?: string): string {
  const fiber = getReactFiber(
    document.querySelector(`.${el.classes.split(" ")[0]}`) || document.body,
  );
  const lines = [
    "## Element Inspector",
    "",
    `**Tag:** <${el.tag}>`,
    el.id ? `**ID:** #${el.id}` : "",
    el.classes ? `**Classes:** ${el.classes}` : "",
    fiber.component ? `**React Component:** <${fiber.component}>` : "",
    fiber.host ? `**Host Element:** ${fiber.host}` : "",
    "",
    `**Dimensions:** ${Math.round(el.dimensions.width)}×${Math.round(el.dimensions.height)}px`,
    `**Position:** top=${Math.round(el.dimensions.top)}, left=${Math.round(el.dimensions.left)}`,
    "",
    el.text ? `**Text Content:** ${el.text.slice(0, 150)}` : "",
    "",
    "**Computed Styles:**",
    ...Object.entries(el.computedStyles).map(([k, v]) => `- ${k}: ${v}`),
    "",
    el.dataAttrs
      ? "**Data Attributes:**\n" +
        Object.entries(el.dataAttrs)
          .map(([k, v]) => `- ${k}="${v}"`)
          .join("\n")
      : "",
    "",
    "**Ancestors:** " + el.ancestors,
    "",
    "**HTML:**",
    "```html",
    el.html,
    "```",
    "",
    "---",
    instruction
      ? `**Instruction:** ${instruction}`
      : "Modify this element. What changes should I make?",
  ];
  return lines.filter(Boolean).join("\n");
}

/* ── Token helpers ── */
const t = (token: string) => `var(--${token})`;
const mix = (token: string, pct: number) => `color-mix(in srgb, ${t(token)} ${pct}%, transparent)`;
const borderMix = (token: string, pct: number) => `1px solid ${mix(token, pct)}`;

/* ── Reusable style objects ── */

const headerBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 28,
  height: 28,
  borderRadius: 6,
  background: mix("muted", 60),
  color: t("muted-foreground"),
  border: "none",
  cursor: "pointer",
  transition: "all 150ms",
};

const tagStyle: React.CSSProperties = {
  fontSize: 11,
  fontFamily: "monospace",
  padding: "2px 8px",
  borderRadius: 4,
  fontWeight: 500,
};

const cardStyle: React.CSSProperties = {
  background: mix("muted", 40),
  border: borderMix("border", 60),
  borderRadius: 8,
  padding: "8px 10px",
};

const cardHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 11,
  fontWeight: 600,
  color: t("muted-foreground"),
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: 6,
};

export function ElementInspector() {
  const [active, setActive] = useState(false);
  const [hoveredEl, setHoveredEl] = useState<Element | null>(null);
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const [hoverLabel, setHoverLabel] = useState("");
  const [captured, setCaptured] = useState<CapturedElement | null>(null);
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const toggle = useCallback(() => setActive((prev) => !prev), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = navigator.userAgent.includes("Mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.shiftKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }
    }
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [toggle]);

  useEffect(() => {
    if (!active) return;

    function isInspector(el: Element): boolean {
      return !!el.closest("[data-orca-inspector]");
    }

    function handleMouseMove(e: MouseEvent) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (!target || isInspector(target)) {
          setHoveredEl(null);
          setHoverRect(null);
          return;
        }
        setHoveredEl(target);
        const rect = target.getBoundingClientRect();
        setHoverRect(rect);
        const tag = target.tagName.toLowerCase();
        const id = target.id ? `#${target.id}` : "";
        const cls =
          target.className && typeof target.className === "string"
            ? "." + target.className.split(/\s+/).filter(Boolean).slice(0, 2).join(".")
            : "";
        setHoverLabel(`<${tag}${id}${cls}>`);
      });
    }

    function handleClick(e: MouseEvent) {
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target || isInspector(target)) return;
      e.preventDefault();
      e.stopPropagation();
      setCaptured(captureElement(target));
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setCaptured(null);
        setActive(false);
      }
    }

    document.addEventListener("mousemove", handleMouseMove, true);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("keydown", handleEscape, true);
    document.body.style.cursor = "crosshair";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove, true);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("keydown", handleEscape, true);
      document.body.style.cursor = "";
      cancelAnimationFrame(rafRef.current);
      setHoveredEl(null);
      setHoverRect(null);
      setCaptured(null);
    };
  }, [active]);

  const handleCopy = useCallback(
    async (instruction?: string) => {
      if (!captured) return;
      const text = formatForAI(captured, instruction);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    },
    [captured],
  );

  if (!active) return null;

  return createPortal(
    <div data-orca-inspector="">
      {hoverRect && (
        <div
          ref={overlayRef}
          data-orca-inspector=""
          style={{
            position: "fixed",
            top: hoverRect.top - 2,
            left: hoverRect.left - 2,
            width: hoverRect.width + 4,
            height: hoverRect.height + 4,
            border: `2px solid ${t("primary")}`,
            borderRadius: "3px",
            background: mix("primary", 8),
            pointerEvents: "none",
            zIndex: 2147483646,
            transition: "all 50ms ease-out",
          }}
        >
          <div
            data-orca-inspector=""
            style={{
              position: "absolute",
              bottom: "100%",
              left: 0,
              background: t("primary"),
              color: t("primary-foreground"),
              fontSize: "11px",
              fontFamily: "monospace",
              padding: "2px 6px",
              borderRadius: "3px 3px 0 0",
              whiteSpace: "nowrap",
              lineHeight: "16px",
              pointerEvents: "none",
              marginBottom: "-1px",
            }}
          >
            {hoverLabel}
          </div>
        </div>
      )}

      {hoveredEl && !captured && (
        <div
          data-orca-inspector=""
          className="bg-popover text-popover-foreground backdrop-blur-md"
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "12px",
            fontFamily: "ui-monospace, monospace",
            padding: "8px 12px",
            borderRadius: "8px",
            border: borderMix("primary", 40),
            zIndex: 2147483647,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <MousePointerClick className="size-3.5 text-primary" />
          <span className="text-popover-foreground">Click to inspect</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">ESC to exit</span>
        </div>
      )}

      {captured && (
        <InspectorPanel
          ref={panelRef}
          captured={captured}
          copied={copied}
          onCopy={handleCopy}
          onClose={() => setCaptured(null)}
          onExit={() => {
            setCaptured(null);
            setActive(false);
          }}
        />
      )}
    </div>,
    document.body,
  );
}

const InspectorPanel = forwardRef<
  HTMLDivElement,
  {
    captured: CapturedElement;
    copied: boolean;
    onCopy: (instruction?: string) => void;
    onClose: () => void;
    onExit: () => void;
  }
>(function InspectorPanel({ captured, copied, onCopy, onClose, onExit }, ref) {
  const [tab, setTab] = useState<"overview" | "html" | "styles">("overview");
  const [instruction, setInstruction] = useState("");
  const el = captured;
  const fiber = (() => {
    try {
      const sel = el.id
        ? document.getElementById(el.id)
        : el.classes
          ? document.querySelector("." + el.classes.split(" ")[0])
          : null;
      return sel ? getReactFiber(sel) : {};
    } catch {
      return {};
    }
  })();

  return (
    <div
      ref={ref}
      data-orca-inspector=""
      className="bg-popover text-popover-foreground backdrop-blur-md"
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        width: 420,
        maxHeight: "calc(100vh - 32px)",
        borderRadius: "var(--radius-xl, 14px)",
        border: borderMix("primary", 30),
        zIndex: 2147483647,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ padding: "12px 14px", borderBottom: borderMix("border", 80) }}
      >
        <div className="flex items-center gap-2">
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: t("primary"),
              boxShadow: `0 0 6px ${mix("primary", 50)}`,
            }}
          />
          <span className="text-sm font-semibold text-popover-foreground">Element Inspector</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={onClose}
            title="Clear selection"
            className="hover:bg-accent"
            style={headerBtnStyle}
          >
            <MousePointerClick className="size-3.5" />
          </button>
          <button
            onClick={onExit}
            title="Exit inspector (ESC)"
            className="hover:bg-accent"
            style={headerBtnStyle}
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex" style={{ borderBottom: borderMix("border", 80) }}>
        {(
          [
            ["overview", <Layers key="overview" className="size-3.5" />, "Overview"],
            ["html", <Code2 key="html" className="size-3.5" />, "HTML"],
            ["styles", <Palette key="styles" className="size-3.5" />, "Styles"],
          ] as const
        ).map(([id, icon, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={tab === id ? "text-primary" : "text-muted-foreground"}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "8px 0",
              fontSize: 12,
              fontWeight: tab === id ? 600 : 400,
              background: tab === id ? mix("primary", 10) : "transparent",
              border: "none",
              borderBottomWidth: 2,
              borderBottomStyle: "solid",
              borderBottomColor: tab === id ? t("primary") : "transparent",
              cursor: "pointer",
              transition: "all 150ms",
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="scrollbar-sleek" style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
        {tab === "overview" && (
          <div className="flex flex-col gap-3">
            {/* Element badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-primary"
                style={{ ...tagStyle, background: mix("primary", 12) }}
              >
                &lt;{el.tag}&gt;
              </span>
              {el.id && (
                <span
                  className="text-chart-1"
                  style={{ ...tagStyle, background: mix("chart-1", 12) }}
                >
                  #{el.id}
                </span>
              )}
              {fiber.component && (
                <span
                  className="text-chart-3"
                  style={{ ...tagStyle, background: mix("chart-3", 12) }}
                >
                  {"<"}
                  {fiber.component}
                  {" />"}
                </span>
              )}
            </div>

            {/* Dimensions */}
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <Maximize2 className="size-3.5 text-primary" />
                <span>Dimensions</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-popover-foreground">
                <div>
                  <span className="text-muted-foreground">W:</span>{" "}
                  {Math.round(el.dimensions.width)}px
                </div>
                <div>
                  <span className="text-muted-foreground">H:</span>{" "}
                  {Math.round(el.dimensions.height)}px
                </div>
                <div>
                  <span className="text-muted-foreground">X:</span> {Math.round(el.dimensions.left)}
                  px
                </div>
                <div>
                  <span className="text-muted-foreground">Y:</span> {Math.round(el.dimensions.top)}
                  px
                </div>
              </div>
            </div>

            {/* Classes */}
            {el.classes && (
              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <Palette className="size-3.5 text-chart-4" />
                  <span>Classes</span>
                </div>
                <div className="text-xs text-popover-foreground break-all">{el.classes}</div>
              </div>
            )}

            {/* Text */}
            {el.text && (
              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <span>Text Content</span>
                </div>
                <div className="text-xs text-popover-foreground whitespace-pre-wrap break-word">
                  {el.text.length > 200 ? el.text.slice(0, 200) + "…" : el.text}
                </div>
              </div>
            )}

            {/* Ancestors */}
            <div style={cardStyle}>
              <div style={cardHeaderStyle}>
                <span>Ancestors</span>
              </div>
              <div className="text-[11px] text-muted-foreground font-mono">{el.ancestors}</div>
            </div>

            {/* Data attrs */}
            {Object.keys(el.dataAttrs).length > 0 && (
              <div style={cardStyle}>
                <div style={cardHeaderStyle}>
                  <span>Data Attributes</span>
                </div>
                {Object.entries(el.dataAttrs).map(([k, v]) => (
                  <div key={k} className="text-xs font-mono">
                    <span className="text-chart-5">{k}</span>=
                    <span className="text-chart-3">"{v}"</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "html" && (
          <pre className="text-[11px] leading-relaxed text-muted-foreground whitespace-pre-wrap break-all font-mono m-0">
            {el.html}
          </pre>
        )}

        {tab === "styles" && (
          <div className="flex flex-col gap-1">
            {Object.entries(el.computedStyles).length === 0 && (
              <div className="text-muted-foreground text-xs">
                No relevant computed styles found.
              </div>
            )}
            {Object.entries(el.computedStyles).map(([k, v]) => (
              <div
                key={k}
                className="flex justify-between text-xs py-1"
                style={{ borderBottom: borderMix("border", 40) }}
              >
                <span className="text-muted-foreground font-mono">{k}</span>
                <span className="text-popover-foreground font-mono text-right max-w-[60%] overflow-hidden text-ellipsis">
                  {v}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex flex-col gap-2"
        style={{ padding: "10px 14px", borderTop: borderMix("border", 80) }}
      >
        <textarea
          data-orca-inspector=""
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="What should I change? e.g. 'change color to blue', 'make it bigger'..."
          rows={2}
          className="bg-input text-popover-foreground placeholder:text-muted-foreground focus:ring-ring resize-none outline-none"
          style={{
            width: "100%",
            borderRadius: "var(--radius-md)",
            padding: "8px 10px",
            fontSize: 12,
            fontFamily: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
            lineHeight: "1.5",
            border: borderMix("border", 80),
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              onCopy(instruction || undefined);
            }
          }}
        />
        <button
          onClick={() => onCopy(instruction || undefined)}
          className={copied ? "text-chart-3" : "text-primary"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "8px 12px",
            background: copied ? mix("chart-3", 15) : mix("primary", 15),
            border: `1px solid ${copied ? mix("chart-3", 30) : mix("primary", 30)}`,
            borderRadius: "var(--radius-md)",
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 150ms",
          }}
        >
          {copied ? (
            <>
              <Check className="size-3.5" /> Copied!
            </>
          ) : (
            <>
              <Copy className="size-3.5" /> Copy for AI
            </>
          )}
        </button>
        <div className="text-center text-muted-foreground" style={{ fontSize: 10 }}>
          Ctrl+Enter to copy · ESC to close
        </div>
      </div>
    </div>
  );
});
