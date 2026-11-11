import type { ComponentPropsWithRef } from "react";

export type InputVariant = "default" | "outline";
export type InputSize = "sm" | "md" | "lg";

export type InputProps = Omit<ComponentPropsWithRef<"input">, "children"> & {
  variant?: InputVariant;
  /** Visual sizing; the native numeric size attribute remains available. */
  controlSize?: InputSize;
  invalid?: boolean;
};

const variantClasses: Record<InputVariant, string> = {
  default: "rounded-control bg-background",
  outline: "rounded-md bg-transparent shadow-xs focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:ring-primary/20",
};

const sizeClasses: Record<InputSize, string> = {
  sm: "min-h-touch-target px-3 py-[10px]",
  md: "min-h-control-height px-[14px] py-3",
  lg: "min-h-14 px-4 py-4",
};

/** Supply a label/accessible name and connect errors with aria-describedby. */
export function Input({ variant = "default", controlSize = "md", invalid, className, "aria-invalid": ariaInvalid, ...props }: InputProps) {
  return (
    <input
      {...props}
      aria-invalid={invalid ? true : ariaInvalid}
      className={[
        "w-full min-w-0 border border-coffee text-input leading-[1.5] text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring aria-invalid:border-primary disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[controlSize],
        className,
      ].filter(Boolean).join(" ")}
    />
  );
}
