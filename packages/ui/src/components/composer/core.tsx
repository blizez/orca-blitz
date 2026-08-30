import { useEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Composer({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="composer" className={cn("relative w-full", className)} {...props} />;
}

export function ComposerBar({
  dragActive = false,
  className,
  ...props
}: ComponentProps<"div"> & { dragActive?: boolean }) {
  return (
    <div
      data-slot="composer-bar"
      data-drag-active={dragActive || undefined}
      className={cn(
        "bg-sidebar text-sidebar-foreground border border-sidebar-border",
        "flex w-full flex-col gap-0.5 rounded-lg p-2.5 transition-colors",
        dragActive && "bg-primary/[0.04] dark:bg-primary/10",
        className,
      )}
      {...props}
    />
  );
}

export function ComposerInput({
  onSubmit,
  onKeyDown,
  className,
  ...props
}: Omit<ComponentProps<"textarea">, "onSubmit"> & { onSubmit?: () => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [props.value]);

  return (
    <textarea
      ref={ref}
      data-slot="composer-input"
      rows={1}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
        event.preventDefault();
        onSubmit?.();
      }}
      className={cn(
        "placeholder:text-sidebar-foreground/40 min-h-11 max-h-40 w-full resize-none bg-transparent px-3 text-[15px] caret-primary outline-none",
        className,
      )}
      {...props}
    />
  );
}
