"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ComponentPropsWithRef } from "react";

export type ModalSize = "sm" | "md" | "lg" | "drawer";
type ModalLabel =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-labelledby": string; "aria-label"?: string };

export type ModalProps = Omit<ComponentPropsWithRef<"dialog">, "open" | "aria-label" | "aria-labelledby"> & ModalLabel & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: ModalSize;
  closeOnBackdropClick?: boolean;
  /** Optional selector overriding the native opener, e.g. a persistent header control. */
  restoreFocusTo?: string;
};

const sizeClasses: Record<ModalSize, string> = {
  sm: "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm rounded-2xl p-6",
  md: "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg rounded-2xl p-6 tablet:p-8",
  lg: "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl rounded-2xl p-6 tablet:p-8",
  drawer: "m-0 ms-auto h-dvh max-h-dvh w-full max-w-[480px] p-6 shadow-[-10px_0_60px_color-mix(in_srgb,var(--theme-foreground)_7%,transparent)] tablet:p-8",
};

/** Native modal focus containment; callers own visibility and provide a close control. */
export function Modal({ open, onOpenChange, size = "md", closeOnBackdropClick = true, restoreFocusTo,
  ref, className, onCancel, onClose, onClick, ...props }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const setRef = useCallback((node: HTMLDialogElement | null) => {
    dialogRef.current = node;
    if (typeof ref === "function") return ref(node);
    if (ref) ref.current = node;
  }, [ref]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    const opener = document.activeElement;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      const target = (restoreFocusTo ? document.querySelector(restoreFocusTo) : null) ?? opener;
      if (target instanceof HTMLElement && target.isConnected) target.focus();
    };
  }, [open, restoreFocusTo]);

  return (
    <dialog {...props} ref={setRef}
      className={[
        "fixed inset-0 overflow-y-auto overscroll-contain border border-transparent bg-background text-foreground backdrop:bg-overlay backdrop:backdrop-blur-[3px]",
        sizeClasses[size], className,
      ].filter(Boolean).join(" ")}
      onCancel={(event) => {
        onCancel?.(event);
        if (event.defaultPrevented) return;
        event.preventDefault();
        onOpenChange(false);
      }}
      onClose={(event) => {
        onClose?.(event);
        if (!event.currentTarget.open && open) onOpenChange(false);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !closeOnBackdropClick || event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onOpenChange(false);
      }}
    />
  );
}
