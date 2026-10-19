"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";
import { api, FetchError } from "@/lib/fetcher";
import { cn } from "@/components/ui";

type Msg = { role: "user" | "assistant"; content: string };

const MAX_LENGTH = 1000;
const SUGGESTIONS = ["Do you build mobile apps?", "How is pricing calculated?", "What is your process?"];
const GREETING: Msg = {
  role: "assistant",
  content: "Hi! I'm the NT Tech assistant. Ask me about our services, pricing, process or past projects.",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    if (content.length > MAX_LENGTH) {
      setError(`Please keep messages under ${MAX_LENGTH} characters.`);
      return;
    }
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);
    try {
      // Send only the real conversation (not the greeting) and cap the history length.
      const history = next.filter((m) => m !== GREETING).slice(-10);
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
        className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700"
        aria-label={open ? "Close chat" : "Open chat assistant"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[min(560px,75vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center gap-2 bg-brand-600 px-4 py-3 text-white">
            <Bot className="h-5 w-5" />
            <div>
              <p className="text-sm font-semibold">NT Tech Assistant</p>
              <p className="text-xs text-brand-100">AI answers from our website content</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm",
                    m.role === "user" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-800",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
              </div>
            )}
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-brand-200 px-3 py-1 text-xs text-brand-700 hover:bg-brand-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            className="flex items-center gap-2 border-t border-slate-200 p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              maxLength={MAX_LENGTH}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              aria-label="Your message"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-lg bg-brand-600 p-2 text-white disabled:opacity-50"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="px-3 pb-2 text-center text-[11px] text-slate-400">
            AI can make mistakes. For exact pricing use{" "}
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
