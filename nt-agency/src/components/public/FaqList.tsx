"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/components/ui";

/** Accordion that animates its panels open and closed (grid-rows trick, no height measuring). */
export function FaqList({ items }: { items: Array<{ q: string; a: string }> }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-white/5 rounded-2xl border border-white/8 bg-white/2">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-medium text-slate-100 transition-colors hover:text-white"
            >
              {item.q}
              <Plus
                className={cn(
                  "h-4 w-4 shrink-0 text-brand-300 transition-transform duration-300",
                  isOpen && "rotate-45",
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-sm leading-relaxed text-slate-400">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
