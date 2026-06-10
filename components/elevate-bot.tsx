"use client";

import { FormEvent, useEffect, useState } from "react";
import { Bot, Loader2, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

const starterMessages: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Hi, I'm Elevate Bot. Tell me what kind of business you run and I'll help map the best automation or website system for you."
  }
];

function formatMessage(content: string) {
  return content
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^\s*\d+\.\s*/gm, "")
    .trim();
}

export function ElevateBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const existing = window.sessionStorage.getItem("elevate_session_id");
    const next = existing || crypto.randomUUID();
    window.sessionStorage.setItem("elevate_session_id", next);
    setSessionId(next);
  }, []);

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, sessionId })
      });
      const data = (await response.json()) as { message?: string };
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data.message ??
            "I can help with AI automation, websites, CRM setup, and lead capture. What should we improve first?"
        }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. You can still use the contact form and the Elevate team will follow up."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <div
        className={cn(
          "glass w-[calc(100vw-2.5rem)] max-w-[390px] overflow-hidden rounded-2xl transition-all duration-300",
          open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-400 text-slate-950">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Elevate Bot</p>
              <p className="text-xs text-white/50">Lead qualification assistant</p>
            </div>
          </div>
          <button
            aria-label="Close chat"
            className="rounded-md p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
            onClick={() => setOpen(false)}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex max-h-[430px] min-h-[330px] flex-col gap-3 overflow-y-auto px-4 py-4">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                "max-w-[86%] rounded-xl px-3 py-2 text-sm leading-6",
                message.role === "assistant"
                  ? "self-start border border-white/10 bg-white/10 text-white/80"
                  : "self-end bg-sky-400 text-slate-950"
              )}
            >
              {formatMessage(message.content)}
            </div>
          ))}
          {loading ? (
            <div className="flex max-w-[86%] items-center gap-2 self-start rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white/70">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking
            </div>
          ) : null}
        </div>

        <form className="border-t border-white/10 p-3" onSubmit={submitMessage}>
          <div className="flex gap-2">
            <input
              aria-label="Message Elevate Bot"
              className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-sky-300/40 placeholder:text-white/40 focus:ring-2"
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about automations..."
              value={input}
            />
            <Button aria-label="Send message" size="icon" type="submit">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </form>
      </div>

      <button
        aria-label="Open Elevate Bot"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-400 text-slate-950 shadow-glow transition hover:scale-105"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>
    </div>
  );
}
