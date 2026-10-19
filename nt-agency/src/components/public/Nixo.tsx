"use client";

import Image from "next/image";
import { cn } from "@/components/ui";

/** Event the chat widget listens for, so any button on the page can open Nixo. */
export const OPEN_NIXO_EVENT = "nixo:open";

export function openNixoChat() {
  window.dispatchEvent(new Event(OPEN_NIXO_EVENT));
}

/** Round avatar of Nixo, the NT Tech Innovation mascot. */
export function NixoAvatar({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/nixo/nixo-face.webp"
      alt="Nixo"
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full object-cover", className)}
    />
  );
}

export function AskNixoButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={openNixoChat} className={className}>
      {children}
    </button>
  );
}
