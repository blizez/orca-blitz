import { type ComponentProps } from "react";
import { ArrowUpIcon, SquareIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { iconSwap, iconSwapIn, iconSwapOut } from "@/lib/surfaces";

export function ComposerSend({
  streaming,
  idle,
  className,
  ...props
}: Omit<ComponentProps<"button">, "children"> & {
  streaming: boolean;
  idle: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={streaming ? "Stop generating" : "Send message"}
      data-slot="composer-send"
      className={cn(
        "grid size-8 place-items-center rounded-full bg-primary text-primary-foreground transition-[opacity,scale] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:opacity-90 active:scale-[0.96] motion-reduce:transition-none",
        streaming ? "opacity-100" : idle ? "opacity-60" : "opacity-100",
        className,
      )}
      {...props}
    >
      <ArrowUpIcon className={cn(iconSwap, "size-4", streaming ? iconSwapOut : iconSwapIn)} />
      <SquareIcon
        className={cn(iconSwap, "size-3 fill-current", streaming ? iconSwapIn : iconSwapOut)}
      />
    </button>
  );
}
