"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your Resumo Assistant. How can I assist you with resume optimization, job requirements, or interview prep today?",
    },
  ]);

  async function send(text?: string) {
    const value = (text ?? input).trim();
    if (!value || loading) return;
    setMessages((m) => [...m, { role: "user", content: value }]);
    setInput("");
    setLoading(true);
    try {
      const r = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: value }),
        }
      );
      const d = await r.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", content: d.reply ?? "I couldn't process that response." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "Unable to reach the Resumo API server. Please ensure the backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!open)
    return (
      <button
        aria-label="Open Resumo Assistant"
        onClick={() => setOpen(true)}
        className="btn-indigo-glow fixed bottom-6 right-6 z-50 rounded-full p-4 text-white shadow-2xl transition hover:scale-105 active:scale-95"
      >
        <MessageCircle size={22} />
      </button>
    );

  return (
    <div className="card-glow fixed bottom-6 right-6 z-50 flex h-[540px] w-[370px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-2xl backdrop-blur-2xl">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-muted)]/80 p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold text-sm">
            R
          </div>
          <div>
            <b className="text-sm text-[var(--text-primary)] block font-semibold">Resumo Assistant</b>
            <p className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> AI Ready
            </p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition"
        >
          <X size={18} />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
              m.role === "user"
                ? "ml-auto bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium shadow-md"
                : "bg-[var(--bg-muted)] border border-[var(--border)] text-[var(--text-secondary)]"
            }`}
          >
            {m.content}
          </div>
        ))}
        {messages.length === 1 && (
          <div className="grid gap-2 pt-2">
            {[
              "How do I boost my resume ATS score?",
              "What keywords are best for software roles?",
              "Help me prepare for technical questions",
            ].map((x) => (
              <button
                key={x}
                onClick={() => send(x)}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-2.5 text-left text-xs text-[var(--text-secondary)] transition hover:border-indigo-500/40 hover:text-indigo-400 hover:bg-[var(--bg-muted)]"
              >
                {x}
              </button>
            ))}
          </div>
        )}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] p-2">
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-500/30 border-t-indigo-500" />
            <span>Thinking…</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2 border-t border-[var(--border)] bg-[var(--bg-muted)]/50 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="btn-indigo-glow rounded-xl p-2.5 text-white transition disabled:opacity-40"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
