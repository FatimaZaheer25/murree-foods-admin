"use client";

import { useEffect, useState } from "react";
import { ApiError } from "../../lib/api";
import { errorMessage } from "./useSubmit";

const COOLDOWN = 60; // backend bhi 1 minute se pehle naya code nahi bhejta

// "Resend code", page khulte hi 60 second ka timer (code abhi bheja gaya hai)
export default function ResendCode({ resend }: { resend: () => Promise<{ message: string }> }) {
  const [left, setLeft] = useState(COOLDOWN);
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState<{ error: boolean; text: string } | null>(null);

  useEffect(() => {
    if (left === 0) return;
    const timer = setTimeout(() => setLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [left]);

  async function click() {
    setSending(true);
    setNote(null);
    try {
      const { message } = await resend();
      setNote({ error: false, text: message });
      setLeft(COOLDOWN);
    } catch (e) {
      setNote({ error: true, text: errorMessage(e) });
      if (e instanceof ApiError && e.status === 429) setLeft(COOLDOWN);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-5 text-center text-sm text-charcoal-400">
      Didn&apos;t get the code?{" "}
      <button
        type="button"
        onClick={click}
        disabled={left > 0 || sending}
        className="font-semibold text-forest-700 hover:underline disabled:pointer-events-none disabled:text-charcoal-400"
      >
        {left > 0 ? `Resend in ${left}s` : sending ? "Sending…" : "Resend code"}
      </button>
      {note && (
        <p role={note.error ? "alert" : "status"} className={`mt-2 text-xs font-medium ${note.error ? "text-red-600" : "text-forest-700"}`}>
          {note.text}
        </p>
      )}
    </div>
  );
}
