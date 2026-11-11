import { createElement } from "react";
import type { ComponentPropsWithRef } from "react";

export type CardElement = "div" | "section" | "article" | "aside";
export type CardVariant = "default" | "soft" | "outline";
export type CardPadding = "none" | "sm" | "md" | "lg" | "responsive";

/** Common HTMLElement attributes and refs; semantic containers remain non-interactive. */
export type CardProps = ComponentPropsWithRef<"section"> & {
  as?: CardElement;
  variant?: CardVariant;
  padding?: CardPadding;
};

const variantClasses: Record<CardVariant, string> = {
  default: "bg-background",
  soft: "bg-soft",
  outline: "bg-transparent",
};

const paddingClasses: Record<CardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
  responsive: "p-[clamp(24px,4vw,48px)]",
};

export function Card({ as = "div", variant = "default", padding = "md", className, ...props }: CardProps) {
  return createElement(as, {
    ...props,
    className: [
      "rounded-2xl border border-border focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
      variantClasses[variant],
      paddingClasses[padding],
      className,
    ].filter(Boolean).join(" "),
  });
}
