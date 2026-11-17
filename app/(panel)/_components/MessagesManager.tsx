"use client";

import { useEffect, useState } from "react";
import { CircleCheck, Mail, Reply, RotateCcw } from "lucide-react";
import { ApiError } from "@murree/shared/lib/api";
import { listMessages, setMessageResolved } from "@/lib/admin";
import type { ContactMessage, MessagesPage } from "@murree/shared/types";
import Pager from "@murree/shared/components/ui/Pager";
import { formatTime } from "./orderFormat";

type Tab = "new" | "resolved" | "all";

const TABS: { key: Tab; label: string }[] = [
  { key: "new", label: "New" },
  { key: "resolved", label: "Resolved" },
  { key: "all", label: "All" },
];

const REFRESH_MS = 60 * 1000; // naye paigham khud aa jayein

const primary =
  "inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-forest-800 px-3 text-sm font-semibold text-white hover:bg-forest-700 disabled:opacity-60";
const secondary =
  "inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-charcoal-600 hover:bg-cream-100 disabled:opacity-60";

const errorText = (e: unknown) => (e instanceof ApiError ? e.message : "Something went wrong. Please try again.");

// Help & Contact form ke paigham. Jawab email se (Reply), phir "Mark as resolved"
export default function MessagesManager() {
  const [tab, setTab] = useState<Tab>("new");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<MessagesPage | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const load = () =>
      listMessages({ status: tab, page }).then(
        (fresh) => {
          if (stopped) return;
          if (fresh.messages.length === 0 && page > fresh.totalPages) return setPage(fresh.totalPages);
          setData(fresh);
          setError("");
          timer = setTimeout(load, REFRESH_MS);
        },
        (e) => {
          if (stopped) return;
          setError(errorText(e));
          timer = setTimeout(load, REFRESH_MS);
        }
      );
    load();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [tab, page, reloadKey]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Resolve ke baad paigham doosre tab mein chala jata hai: list aur ginti dobara
  async function toggle(message: ContactMessage) {
    setBusy(message.id);
    setError("");
    try {
      const result = await setMessageResolved(message.id, message.status === "new");
      setNotice(`${message.name}: ${result.message}`);
      setReloadKey((key) => key + 1);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy("");
    }
  }

  const messages = data?.messages ?? [];
  const emptyText = tab === "new" ? "No new messages." : tab === "resolved" ? "No resolved messages." : "No messages yet.";

  return (
    <div className="space-y-4">
      <div role="tablist" aria-label="Message status" className="flex flex-wrap gap-1.5">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => {
              setTab(key);
              setPage(1);
            }}
            className={`min-h-9 rounded-lg px-3 text-sm font-semibold transition ${
              tab === key ? "bg-forest-800 text-white" : "text-charcoal-600 hover:bg-cream-100"
            }`}
          >
            {label}
            {data && <span className="ml-1 text-xs opacity-70"> {data.counts[key]}</span>}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {notice}
        </p>
      )}

      {messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-cream-300 bg-white p-10 text-center text-sm text-charcoal-400">
          {!data && !error ? "Loading messages…" : emptyText}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-cream-200 bg-white shadow-soft">
          <ul className="divide-y divide-cream-100">
            {messages.map((message) => {
              const subject = `Re: your message to MurreeFoods${message.orderNumber ? ` (${message.orderNumber})` : ""}`;
              return (
                <li key={message.id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {message.name}
                        {message.registered && (
                          <span className="ml-2 rounded-full bg-cream-100 px-2 py-0.5 text-[10px] font-bold uppercase text-charcoal-400">
                            Account
                          </span>
                        )}
                      </p>
                      <p className="flex min-w-0 items-center gap-1.5 text-sm text-charcoal-400">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{message.email}</span>
                      </p>
                    </div>
                    <div className="text-right text-xs text-charcoal-400">
                      <p>{formatTime(message.createdAt)}</p>
                      {message.orderNumber && <p className="mt-0.5 font-semibold text-charcoal-600">Order {message.orderNumber}</p>}
                    </div>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-charcoal-600">{message.message}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <a href={`mailto:${message.email}?subject=${encodeURIComponent(subject)}`} className={secondary}>
                      <Reply className="h-4 w-4" />
                      Reply by email
                    </a>
                    {message.status === "new" ? (
                      <button type="button" disabled={busy === message.id} onClick={() => toggle(message)} className={primary}>
                        <CircleCheck className="h-4 w-4" />
                        Mark as resolved
                      </button>
                    ) : (
                      <>
                        <span className="text-xs font-semibold text-emerald-700">
                          Resolved{message.resolvedBy && ` by ${message.resolvedBy}`}
                          {message.resolvedAt && ` · ${formatTime(message.resolvedAt)}`}
                        </span>
                        <button type="button" disabled={busy === message.id} onClick={() => toggle(message)} className={secondary}>
                          <RotateCcw className="h-4 w-4" />
                          Move back to New
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {data && (
            <Pager
              page={data.page}
              totalPages={data.totalPages}
              total={data.counts[tab]}
              shown={messages.length}
              onPage={setPage}
            />
          )}
        </div>
      )}
    </div>
  );
}
