import { createElement } from "react";
import type { ComponentPropsWithRef } from "react";

export type BadgeElement = "span" | "bdi";
export type BadgeVariant = "default" | "soft" | "outline";
export type BadgeSize = "sm" | "md" | "count";

export type BadgeProps = ComponentPropsWithRef<"span"> & {
  as?: BadgeElement;
  variant?: BadgeVariant;
  size?: BadgeSize;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-transparent bg-primary text-primary-foreground",
  soft: "border-border bg-accent text-foreground",
  outline: "border-border bg-transparent text-primary",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-[10px] font-medium",
  md: "px-2.5 py-1 text-caption font-medium",
  count: "size-[23px] text-[10px] font-normal tabular-nums",
};

/** Informational content: no automatic role, live announcement, or tab stop. */
export function Badge({ as = "span", variant = "default", size = "md", className, ...props }: BadgeProps) {
  return createElement(as, {
    ...props,
    className: [
      "inline-flex shrink-0 items-center justify-center rounded-full border focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
      variantClasses[variant],
      sizeClasses[size],
      className,
    ].filter(Boolean).join(" "),
  });
}
