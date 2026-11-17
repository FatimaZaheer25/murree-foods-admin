"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { inputClass } from "./fields";

// Password ke andar daayein taraf 👁 button (dikhao / chhupao). Rider app bhi yahi button lagati hai
export function PasswordToggle({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? "Hide password" : "Show password"}
      aria-pressed={visible}
      className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-charcoal-400 hover:bg-cream-100"
    >
      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

// Website aur Admin ke forms ka password field (Login, Sign Up, Reset)
export default function PasswordInput({
  error,
  ...props
}: { error?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative block">
      <input
        {...props}
        type={visible ? "text" : "password"}
        aria-invalid={!!error}
        className={`${inputClass(error)} pr-11`}
      />
      <PasswordToggle visible={visible} onToggle={() => setVisible(!visible)} />
    </span>
  );
}
