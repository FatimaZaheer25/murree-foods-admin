# @murree/shared

Code used by all three MurreeFoods apps: the website, the admin panel and the rider panel.
It is plain TypeScript with no build step. Each app compiles it itself (`transpilePackages` in its `next.config.ts`).

| Folder | What is in it |
| --- | --- |
| `lib/` | `api.ts` (every API call, sends the `X-App` header), `auth.ts`, `apps.ts` (addresses of the three apps), `imageHosts.ts`, `images.ts` |
| `components/auth/` | Login, forgot and reset password forms, the password field with the show/hide button, and the login state (`AuthContext`, `RequireAuth`) |
| `components/ui/` | Logo, panel layout, page headings, stat cards, pager, dark mode toggle |
| `styles/` | Colours and theme (`theme.css`, imported by each app's `globals.css`) and fonts |
| `types/`, `data/`, `assets/` | Shared types, form checks, and the logo |

## Using it in an app

Import the file you need by its path:

```ts
import { api } from "@murree/shared/lib/api";
import LoginForm from "@murree/shared/components/auth/LoginForm";
```

Inside `shared` itself, use relative imports (`../../lib/api`), not `@murree/shared/...` or `@/...`.

`process.env.NEXT_PUBLIC_MF_APP` tells the shared code which app it is running in (`customer`, `admin` or `rider`).
Each app sets it in its own `next.config.ts`.

A change here affects all three apps, so check all three (`npm run lint` and a build) after changing it.
