import { useEffect, useMemo, useRef, useState } from "react";
import AuthMessage from "../components/auth/AuthMessage";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import { useNotificationFeed } from "../hooks/useNotificationFeed";
import { getAuthSession } from "../lib/authSession";
import { chatWithAi } from "../lib/aiApi";
import NotificationMenu from "../components/common/NotificationMenu";
import { Icon } from "../components/dashboard/DashboardIcons";

const STARTER_PROMPTS = [
  "How can I reduce my spending this month?",
  "Which budget category should I fix first?",
  "What is hurting my savings the most?",
  "Give me a simple action plan for this week.",
];

const DEFAULT_MESSAGES = [
  createMessage(
    "assistant",
    "Ask me about spending, budgets, savings, or what to improve next. I will answer from your financial data in this app.",
    "system"
  ),
];

function createMessage(role, content, source = "") {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    source,
  };
}

function getChatStorageKey(user) {
  const identity = user?.id || user?.email || "guest";
  return `ai_insights_chat_${identity}`;
}

function loadStoredMessagesByKey(storageKey) {
  if (typeof window === "undefined") {
    return DEFAULT_MESSAGES;
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];

    if (!Array.isArray(parsedValue) || parsedValue.length === 0) {
      return DEFAULT_MESSAGES;
    }

    return parsedValue;
  } catch {
    return DEFAULT_MESSAGES;
  }
}

function getSourceLabel(source) {
  if (source === "fallback") {
    return "App insight";
  }

  if (source === "system") {
    return "Context";
  }

  return "AI model";
}

export default function AIInsightsPage() {
  const { user } = getAuthSession();
  const userChatKey = getChatStorageKey(user);
  const messagesEndRef = useRef(null);
  const {
    notifications,
    unreadCount,
    onOpenNotifications,
    onDismissNotification,
  } = useNotificationFeed();
  const [messages, setMessages] = useState(() => loadStoredMessagesByKey(userChatKey));
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("neutral");
  const [aiMode, setAiMode] = useState("unknown");
  const [isAiConfigured, setIsAiConfigured] = useState(null);
  const [fallbackReason, setFallbackReason] = useState("");
  const [providerLabel, setProviderLabel] = useState("Gemini");
  const conversationCount = messages.filter((item) => item.role === "user").length;
  const statusLabel =
    aiMode !== "fallback" && aiMode !== "unknown" ? `${providerLabel} Live` : "Live Context";

  useEffect(() => {
    setMessages(loadStoredMessagesByKey(userChatKey));
  }, [userChatKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(userChatKey, JSON.stringify(messages));
  }, [messages, userChatKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSubmitting]);

  const conversation = useMemo(
    () =>
      messages
        .filter((item) => item.role === "user" || item.role === "assistant")
        .map(({ role, content }) => ({ role, content })),
    [messages]
  );

  async function handleAskAi(nextQuestion) {
    const question = String(nextQuestion || input).trim();

    if (!question || isSubmitting) {
      return;
    }

    const userMessage = createMessage("user", question);
    const nextConversation = [...conversation, { role: "user", content: question }];

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsSubmitting(true);
    setTone("neutral");
    setMessage("");

    try {
      const result = await chatWithAi(nextConversation);
      const aiText = result.data?.message || "I could not generate a reply just now.";
      const source = result.data?.source || "fallback";
      const configured = Boolean(result.data?.configured);
      const nextFallbackReason = result.data?.fallbackReason || "";
      const nextProviderLabel = result.data?.providerLabel || "Gemini";

      setAiMode(source);
      setIsAiConfigured(configured);
      setFallbackReason(nextFallbackReason);
      setProviderLabel(nextProviderLabel);

      setMessages((prev) => [
        ...prev,
        createMessage("assistant", aiText, source),
      ]);
    } catch (error) {
      setTone("error");
      setMessage(error.response?.message || error.message || "Unable to reach AI insights right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    handleAskAi();
  }

  function handleInputKeyDown(event) {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    handleAskAi();
  }

  function handleNewChat() {
    setMessages(DEFAULT_MESSAGES);
    setInput("");
    setTone("neutral");
    setMessage("");
    setFallbackReason("");
    setAiMode("unknown");
    setIsAiConfigured(null);
    setProviderLabel("Gemini");
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef2f5] text-[#1f2d38]">
      <div className="pointer-events-none fixed -top-28 right-[-110px] h-[520px] w-[520px] rounded-full bg-[#b7d4ff]/40 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-210px] left-[70px] h-[460px] w-[460px] rounded-full bg-[#b8c8ff]/40 blur-3xl" />

      <DashboardSidebar user={user} activeItem="AI Insights" />

      <main className="relative z-0 lg:pl-[248px]">
        <div className="mx-auto max-w-[1320px] px-4 py-6 md:px-8 lg:py-8">
          <header className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-[-0.04em] text-[#1f2d38] md:text-5xl">
                AI Insights Chat
              </h1>
              <p className="mt-2 text-base font-semibold text-[#7a8794]">
                Ask about spending, budgets, savings, and next actions based on your live finance data.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationMenu
                items={notifications}
                unreadCount={unreadCount}
                onOpen={onOpenNotifications}
                onDismiss={onDismissNotification}
                buttonClassName="grid h-12 w-12 place-items-center rounded-full bg-white/88 text-[#667684] shadow-[0_14px_35px_rgba(35,66,85,0.06)] transition hover:-translate-y-0.5 hover:text-[#0d9488]"
              />
              <div className="rounded-full bg-white/88 px-4 py-2 text-sm font-black text-[#0d9488] shadow-[0_14px_35px_rgba(35,66,85,0.06)]">
                {aiMode !== "fallback" && aiMode !== "unknown" ? `${providerLabel} Live` : "Live Context"}
              </div>
              <button
                type="button"
                onClick={handleNewChat}
                className="rounded-full bg-white/88 px-4 py-2 text-sm font-black text-[#63717c] shadow-[0_14px_35px_rgba(35,66,85,0.06)] transition hover:-translate-y-0.5 hover:text-[#0d9488]"
              >
                New Chat
              </button>
            </div>
          </header>

          <AuthMessage tone={tone} message={message} />

          {isAiConfigured === false ? (
            <div className="mt-4 rounded-lg border border-[#ffe4b8] bg-[#fff7e8] px-4 py-3 text-sm font-semibold text-[#8a6418]">
              {providerLabel} is not configured yet, so this chat is still using app-side fallback insights. Add the matching API key in `Backend/.env` to enable real model responses.
            </div>
          ) : null}

          {isAiConfigured === true && aiMode === "fallback" && fallbackReason ? (
            <div className="mt-4 rounded-lg border border-[#ffd3d3] bg-[#fff3f3] px-4 py-3 text-sm font-semibold text-[#a34a4a]">
              {providerLabel} is configured, but this reply fell back to app insight mode.
              <span className="block mt-1 text-xs font-bold text-[#b25c5c]">
                Reason: {fallbackReason}
              </span>
            </div>
          ) : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_320px]">
            <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_24px_58px_rgba(35,66,85,0.065)]">
              <div className="relative overflow-hidden border-b border-[#edf2f5] bg-[radial-gradient(circle_at_top_left,_rgba(142,215,233,0.18),_transparent_44%),linear-gradient(135deg,_rgba(239,248,251,0.95),_rgba(255,255,255,0.92))] px-5 py-5">
                <div className="pointer-events-none absolute -right-8 top-0 h-24 w-24 rounded-full bg-[#8fd8cd]/25 blur-2xl" />
                <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#0d9488] shadow-[0_10px_24px_rgba(19,151,127,0.12)]">
                      Insight Copilot
                    </div>
                    <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-[#22313b]">
                      Ask for a diagnosis, not just an answer.
                    </h2>
                    <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-[#70808c]">
                      This chat reads from your transactions, budgets, and recent reports so you can explain decisions with real numbers during the demo.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white/82 px-4 py-3 shadow-[0_14px_30px_rgba(35,66,85,0.08)]">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8c98a4]">
                        Status
                      </p>
                      <p className="mt-2 text-sm font-black text-[#22313b]">{statusLabel}</p>
                    </div>
                    <div className="rounded-2xl bg-white/82 px-4 py-3 shadow-[0_14px_30px_rgba(35,66,85,0.08)]">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8c98a4]">
                        Questions asked
                      </p>
                      <p className="mt-2 text-sm font-black text-[#22313b]">{conversationCount}</p>
                    </div>
                    <div className="rounded-2xl bg-white/82 px-4 py-3 shadow-[0_14px_30px_rgba(35,66,85,0.08)]">
                      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#8c98a4]">
                        Best use
                      </p>
                      <p className="mt-2 text-sm font-black text-[#22313b]">Budget fixes</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="max-h-[62vh] space-y-4 overflow-y-auto px-5 py-5 pr-4">
                {messages.map((item) => {
                  const isUser = item.role === "user";

                  return (
                    <div
                      key={item.id}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                          isUser
                            ? "bg-[#13977f] text-white"
                            : "bg-[#f6fafb] text-[#25313b]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm font-semibold leading-6">
                          {item.content}
                        </p>
                        {!isUser && item.source ? (
                          <p className="mt-2 text-[11px] font-black uppercase tracking-[0.08em] text-[#8d99a5]">
                            {getSourceLabel(item.source)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}

                {isSubmitting ? (
                  <div className="flex justify-start">
                    <div className="rounded-2xl bg-[#f6fafb] px-4 py-3 text-sm font-semibold text-[#63717c] shadow-sm">
                      <div className="flex items-center gap-2">
                        <span>Thinking</span>
                        <span className="flex items-center gap-1">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0d9488]" />
                          <span
                            className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0d9488]"
                            style={{ animationDelay: "120ms" }}
                          />
                          <span
                            className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0d9488]"
                            style={{ animationDelay: "240ms" }}
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                ) : null}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSubmit} className="border-t border-[#edf2f5] bg-white px-5 py-5">
                <div className="flex gap-3">
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Ask AI about your spending, savings, or budget priorities..."
                    className="min-h-[104px] flex-1 resize-none rounded-lg border border-[#e6edf1] bg-[#f8fbfc] px-4 py-3 text-sm font-semibold text-[#25313b] outline-none transition placeholder:text-[#a5afb8] focus:border-[#8fd8cd] focus:bg-white"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !input.trim()}
                    className="h-fit rounded-lg bg-[#13977f] px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_rgba(19,151,127,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0e806f] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Send
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-[11px] font-bold text-[#91a0ab]">
                  <p>Press Enter to send. Use Shift + Enter for a new line.</p>
                  <p>{statusLabel}</p>
                </div>
              </form>
            </div>

            <aside className="space-y-6">
              <section className="rounded-lg bg-white p-5 shadow-[0_20px_45px_rgba(35,66,85,0.06)]">
                <div className="flex items-center gap-2">
                  <Icon name="ai" className="h-5 w-5 text-[#13977f]" />
                  <h2 className="text-lg font-black tracking-[-0.02em] text-[#25313b]">Starter Prompts</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {STARTER_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleAskAi(prompt)}
                      disabled={isSubmitting}
                      className="w-full rounded-lg bg-[#f3f7f9] px-4 py-3 text-left text-sm font-bold text-[#4d5b66] transition hover:bg-[#e8f4f1] hover:text-[#0f8e7e] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </section>

              <section className="rounded-lg bg-white p-5 shadow-[0_20px_45px_rgba(35,66,85,0.06)]">
                <h2 className="text-lg font-black tracking-[-0.02em] text-[#25313b]">Best Questions</h2>
                <div className="mt-4 space-y-3">
                  {[
                    "Which category is dragging my savings down?",
                    "What should I cut first to stay under budget?",
                    "Summarize my month in three key insights.",
                  ].map((tip) => (
                    <div key={tip} className="rounded-lg bg-[#f6fafb] px-4 py-3 text-sm font-bold text-[#4d5b66]">
                      {tip}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg bg-gradient-to-br from-[#0a8d86] via-[#1b7c98] to-[#2e5f8f] p-5 text-white shadow-[0_28px_58px_rgba(22,111,128,0.28)]">
                <h2 className="text-lg font-black tracking-[-0.02em]">How This Works</h2>
                <p className="mt-3 text-sm font-medium leading-6 text-white/88">
                  Replies are grounded in your transactions, budgets, reports, and recent financial activity.
                </p>
                <p className="mt-3 text-sm font-medium leading-6 text-white/88">
                  If `GEMINI_API_KEY` is configured, the assistant uses a real Gemini model. Otherwise it falls back to app-side financial guidance so the chat still works.
                </p>
              </section>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}
