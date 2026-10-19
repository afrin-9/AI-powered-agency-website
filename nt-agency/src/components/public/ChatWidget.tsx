"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Send, X } from "lucide-react";
import { api, FetchError } from "@/lib/fetcher";
import { cn } from "@/components/ui";
import { CHAT_HISTORY_LIMIT, CHAT_MAX_MESSAGE_LENGTH, OPEN_NIXO_EVENT } from "@/constants/app";
import { CHAT_GREETING, CHAT_SUGGESTIONS } from "@/data/chat";
import { NixoAvatar } from "./Nixo";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = { role: "assistant", content: CHAT_GREETING };

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // "Ask Nixo" buttons elsewhere on the page open the chat through this event.
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_NIXO_EVENT, show);
    return () => window.removeEventListener(OPEN_NIXO_EVENT, show);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    if (content.length > CHAT_MAX_MESSAGE_LENGTH) {
      setError(`Please keep messages under ${CHAT_MAX_MESSAGE_LENGTH} characters.`);
      return;
    }
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);
    try {
      // Send only the real conversation (not the greeting) and cap the history length.
      const history = next.filter((m) => m !== GREETING).slice(-CHAT_HISTORY_LIMIT);
      const res = await api<{ reply: string }>("/api/chat", { method: "POST", json: { messages: history } });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch (err) {
      setError(err instanceof FetchError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="glow-ring fixed bottom-5 right-5 z-50 grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-night-900 transition-transform hover:scale-105"
        aria-label={open ? "Close chat with Nixo" : "Chat with Nixo"}
      >
        {open ? <X className="h-6 w-6 text-brand-200" /> : <NixoAvatar size={64} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[min(560px,75vh)] w-[min(380px,calc(100vw-2rem))] origin-bottom-right animate-pop-in flex-col overflow-hidden rounded-2xl border border-brand-300/40 bg-night-900 shadow-2xl shadow-brand-900/30">
          <div className="flex items-center gap-3 bg-linear-to-r from-night-950 via-night-800 to-brand-800 px-4 py-3 text-white">
            <NixoAvatar size={40} className="ring-2 ring-brand-400/60" />
            <div>
              <p className="text-sm font-semibold">Nixo</p>
              <p className="text-xs text-brand-200">NT Tech&apos;s assistant · answers from our website</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-night-950/40 p-4" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex animate-slide-up items-end gap-2", m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role === "assistant" && <NixoAvatar size={26} />}
                <div
                  className={cn(
                    "max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm",
                    m.role === "user"
                      ? "rounded-br-sm bg-brand-600 text-white"
                      : "rounded-bl-sm border border-brand-400/15 bg-night-900 text-slate-100",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <NixoAvatar size={26} />
                <Loader2 className="h-4 w-4 animate-spin text-brand-400" /> Nixo is thinking...
              </div>
            )}
            {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pl-8">
                {CHAT_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-brand-400/25 bg-night-900 px-3 py-1 text-xs text-brand-300 hover:bg-brand-500/10"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            className="flex items-center gap-2 border-t border-brand-400/15 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Nixo a question..."
              maxLength={CHAT_MAX_MESSAGE_LENGTH}
              className="flex-1 rounded-lg border border-white/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              aria-label="Your message"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-lg bg-brand-600 p-2 text-white hover:bg-brand-700 disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="px-3 pb-2 text-center text-[11px] text-slate-500">
            Nixo can make mistakes. For exact pricing use{" "}
            <Link href="/quote" className="underline">
              Get a Quote
            </Link>
            .
          </p>
        </div>
      )}
    </>
  );
}
