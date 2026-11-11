import type { ComponentPropsWithRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-primary text-primary-foreground [@media(hover:hover)_and_(pointer:fine)]:enabled:hover:bg-action-hover enabled:active:bg-action-hover",
  secondary: "border-transparent bg-soft text-primary [@media(hover:hover)_and_(pointer:fine)]:enabled:hover:bg-accent",
  outline: "border-border bg-transparent text-inherit",
  danger: "border-transparent bg-danger text-primary-foreground [@media(hover:hover)_and_(pointer:fine)]:enabled:hover:bg-primary enabled:active:bg-primary",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-touch-target min-w-touch-target px-3",
  md: "min-h-control-height min-w-control-height px-5 py-3",
  lg: "min-h-14 min-w-14 px-6 py-4",
};

/** Native semantics and React 19 ref forwarding; icon-only callers supply aria-label. */
export function Button({ variant = "primary", size = "md", type = "button", className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={[
        "inline-flex max-w-full items-center justify-center gap-2 rounded-control border text-center [touch-action:manipulation] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-45",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].filter(Boolean).join(" ")}
    />
  );
}
