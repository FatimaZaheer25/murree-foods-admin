"use client";

import { useState } from "react";
import { ApiError, type AppName } from "../../lib/api";

export const errorMessage = (error: unknown) =>
  error instanceof ApiError ? error.message : "Something went wrong. Please try again.";

// Har form ka loading aur backend error, ek jagah.
// errorApp: account doosri app ka nikla (form WrongAppLink se us app ka link dikhata hai)
export function useSubmit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorApp, setErrorApp] = useState<AppName>();

  async function run(action: () => Promise<void>) {
    setLoading(true);
    setError("");
    setErrorApp(undefined);
    try {
      await action();
    } catch (e) {
      setError(errorMessage(e));
      if (e instanceof ApiError) setErrorApp(e.correctApp);
    } finally {
      setLoading(false); // Back se wapas aane par button phansa na rahe
    }
  }

  return { loading, error, errorApp, run };
}
