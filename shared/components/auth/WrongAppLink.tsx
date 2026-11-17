import type { AppName } from "../../lib/api";
import { APP_LINKS, appUrl } from "../../lib/apps";

// Account doosri app ka hai: error message ke neeche us app ke login ka link
export default function WrongAppLink({ app }: { app?: AppName }) {
  const href = app && appUrl(app, "/login");
  if (!app || !href) return null;

  return (
    <a href={href} className="mt-1 block font-semibold underline underline-offset-2">
      Go to the {APP_LINKS[app].label} →
    </a>
  );
}
