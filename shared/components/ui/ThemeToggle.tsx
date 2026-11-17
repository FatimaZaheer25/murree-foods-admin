"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { THEME_STORAGE_KEY } from "./theme";

// <html class="dark"> badle to har ThemeToggle ko pata chale (Navbar aur mobile menu dono)
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const isDark = () => document.documentElement.classList.contains("dark");
const unknownOnServer = () => null; // server ko theme ka pata nahi

// 🌙 / ☀️ button. showLabel: mobile menu ke liye "Dark mode" likha hua
export default function ThemeToggle({ showLabel = false, className = "" }: { showLabel?: boolean; className?: string }) {
  const dark = useSyncExternalStore(subscribe, isDark, unknownOnServer);

  function toggle() {
    const next = dark ? "light" : "dark";
    const root = document.documentElement;
    root.classList.toggle("dark", next === "dark");
    root.style.colorScheme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // localStorage band ho to bhi is page par badal jata hai
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={`inline-flex items-center gap-2 rounded-xl transition-colors hover:bg-cream-100 hover:text-charcoal ${
        showLabel
          ? "min-h-11 w-full justify-start px-3.5 py-3 text-base font-medium text-charcoal-600"
          : "h-10 w-10 justify-center text-charcoal-600 sm:h-11 sm:w-11"
      } ${className}`}
    >
      {/* Browser mein pata chalne tak halka ☀️ (design jaisa) */}
      {dark === null ? (
        <Sun className="h-5 w-5 opacity-40" />
      ) : dark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      {showLabel && <span>{dark ? "Light mode" : "Dark mode"}</span>}
    </button>
  );
}
