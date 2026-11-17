"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Bell, BellOff, X } from "lucide-react";

// Naya order aaye to: chhoti si ghanti (awaaz), neeche paigham, aur tab ke title mein ginti.
// Admin: naye orders. Rider: Online ho to jo orders rider ka intezar kar rahe hain.

export type OrderAlertSource = {
  load: () => Promise<string[]>; // abhi wale order numbers
  href: string; // paigham par click: yahan
  label: string; // "New order" / "New order waiting"
};

const POLL_MS = 20_000;
const SOUND_KEY = "mf-order-sound";

// Awaaz: do narm sur (koi file nahi). Browser kabhi rok de to chup chaap
function chime() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    [880, 1175].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const at = ctx.currentTime + i * 0.18;
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.25, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(at);
      osc.stop(at + 0.4);
    });
    setTimeout(() => ctx.close(), 1000);
  } catch {}
}

const readSound = () => {
  try {
    return localStorage.getItem(SOUND_KEY) !== "off";
  } catch {
    return true;
  }
};

export default function NewOrderAlerts({ source }: { source?: OrderAlertSource }) {
  const [sound, setSound] = useState(true);
  const [fresh, setFresh] = useState<string[]>([]); // abhi dikhane wale naye orders
  const [chimes, setChimes] = useState(0);
  const soundRef = useRef(true);

  // Pasand (awaaz on/off) is browser mein yaad
  useEffect(() => {
    const saved = readSound();
    soundRef.current = saved;
    setSound(saved); // eslint-disable-line react-hooks/set-state-in-effect -- localStorage sirf mount ke baad
  }, []);

  const load = source?.load;
  useEffect(() => {
    if (!load) return;
    let seen: Set<string> | null = null; // pehli dafa: jo pehle se hain un par ghanti nahi
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () =>
      load()
        .then((ids) => {
          if (stopped) return;
          if (seen) {
            const added = ids.filter((id) => !seen!.has(id));
            if (added.length) {
              if (soundRef.current) chime();
              setChimes((n) => n + 1);
              setFresh((prev) => [...new Set([...added, ...prev])].slice(0, 5));
            }
          }
          seen = new Set(ids);
        })
        .catch(() => {})
        .finally(() => {
          if (!stopped) timer = setTimeout(tick, POLL_MS);
        });
    tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [load]);

  // Tab ke title mein ginti: "(2) Admin — MurreeFoods.com"
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\)\s*/, "");
    document.title = fresh.length ? `(${fresh.length}) ${base}` : base;
  }, [fresh.length]);

  if (!source) return null;

  const toggle = () => {
    const next = !sound;
    setSound(next);
    soundRef.current = next;
    try {
      localStorage.setItem(SOUND_KEY, next ? "on" : "off");
    } catch {}
    if (next) chime(); // sunwa do ke kaisi awaaz hai
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={sound}
        aria-label={sound ? "New order sound is on. Turn off" : "New order sound is off. Turn on"}
        title={sound ? "New order sound: on" : "New order sound: off"}
        data-chimes={chimes}
        className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-charcoal-600 hover:bg-cream-100"
      >
        {sound ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
      </button>

      {/* Header mein backdrop-blur hai: wahan "fixed" header ke andar hi reh jata. Is liye seedha <body> mein */}
      {fresh.length > 0 &&
        createPortal(
        <div
          role="status"
          className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border border-cream-200 bg-white px-4 py-3 shadow-lift"
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
          </span>
          <p className="text-sm text-charcoal">
            <span className="font-semibold">{fresh.length > 1 ? `${fresh.length} new orders` : source.label}</span>{" "}
            <span className="text-charcoal-400">{fresh.join(", ")}</span>
          </p>
          <Link
            href={source.href}
            onClick={() => setFresh([])}
            className="shrink-0 rounded-lg bg-forest-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-forest-700"
          >
            Open
          </Link>
          <button
            type="button"
            onClick={() => setFresh([])}
            aria-label="Dismiss"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-charcoal-400 hover:bg-cream-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>,
          document.body
        )}
    </>
  );
}
