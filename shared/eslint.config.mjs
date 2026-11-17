import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Apps wale hi qaide (eslint aur eslint-config-next root ke node_modules se aate hain)
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // Shared mein pages nahi hote (sirf apps mein): ye qaida yahan lagu nahi
  { rules: { "@next/next/no-html-link-for-pages": "off" } },
]);
