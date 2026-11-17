# MurreeFoods admin panel

The admin panel for MurreeFoods.com: orders, menu, customers, riders, hotels, payments, analytics, messages and
settings. Built with Next.js 16. It uses the shared code in `shared` and the API in `murree-foods-backend`.
The [main README](../README.md) explains how the apps fit together.

## Run it on your computer

1. Set up and start the API first (see the backend README).
2. In the main `MureeFoods` folder (not this one), run `npm install` once.
3. Copy `.env.example` to `.env.local` in this folder.
4. From the main folder, start everything (`npm run dev`) or only this app (`npm run dev:admin`).
   Open http://localhost:3001.

There is no admin sign-up. To make an admin, sign up on the website, enter the email code, then run
`npm run make-admin your-email@example.com` in the backend folder.

| Command (in this folder) | What it does |
| --- | --- |
| `npm run dev` | Development server on port 3001 |
| `npm run build` | Production build |
| `npm start` | Runs the production build on port 3001 |
| `npm run lint` | Checks the code |

## Environment variables

| Name | Local | Vercel | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api` | `/api` | Where the browser sends API calls |
| `BACKEND_URL` | `http://localhost:5000` | `https://your-backend-host` | Where `/api/*` is forwarded. No `/api`, no trailing `/` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | website address | "Back to site" link, and old dish photos (`/images/...`) |
| `NEXT_PUBLIC_ADMIN_URL` | `http://localhost:3001` | this app's address | |
| `NEXT_PUBLIC_RIDER_URL` | `http://localhost:3002` | rider panel address | Link shown when a rider logs in here by mistake |

## Pages

| Page | Path |
| --- | --- |
| Dashboard | `/` |
| Orders, Menu, Customers, Riders, Hotels | `/orders`, `/menu`, `/customers`, `/riders`, `/hotels` |
| Payments, Analytics, Messages, Settings | `/payments`, `/analytics`, `/messages`, `/settings` |
| Login, forgot and reset password | `/login`, `/forgot-password`, `/reset-password` |

Every page except the login pages needs an admin login. Panel pages check the login in the browser, so each has
`export const instant = false`. Add the same line to every new panel page.

## Orders

- **New order sound:** on every panel page, new orders are checked every 20 seconds. A new one plays a short chime,
  shows a notice at the bottom right with an **Open** button, and puts the count in the tab title. The 🔔 button at
  the top turns the sound on or off (remembered in this browser).
- **Rider first:** an order can be marked **Out for Delivery** or **Delivered** only after a rider has it (assigned
  in the order popup, or accepted by an online rider). Riders' pay and the customer's "Delivered by" depend on it.
- **Customer cancels:** a customer can cancel an order themselves while it is still **Confirmed**. Once you mark it
  **Preparing**, only you can cancel it. The popup shows "Cancelled by the customer."
- **Ratings:** after delivery the customer can give 1–5 stars and a comment. It shows in the order popup, and every
  dish in that order gets the rating in its average.
- **Emails to the customer:** order confirmed, delivered (with a "Rate your order" link) and cancelled.

## Settings → Ordering

- **Taking orders / Orders paused:** pause new orders at any time (kitchen closed, too busy). Customers see
  "Ordering is paused" on Cart and Checkout, and the API refuses new orders.
- **Opens at / Closes at:** daily hours in Pakistan time. Outside them the site says "We're closed right now. We take
  orders from 11:00 am to 11:30 pm." Late nights work (for example 18:00 to 02:00). Leave both empty for all day.
- **Minimum Order (Rs.):** the smallest food total (without fees). 0 means no minimum.

## Dish photos

In Menu → Add Dish / Edit, photos are uploaded from the computer or phone (JPG, PNG or WebP, up to 5 MB):
a main photo and up to 4 extra photos. The browser makes big photos smaller (1600px) first, then the API stores
them on Cloudinary in the `murree-foods/dishes` folder.

- The Cloudinary keys go **only** in the backend's `.env`, never in this app.
- A photo that is removed or replaced is deleted from Cloudinary when the dish is saved, if no other dish uses it.
  Photos uploaded and then cancelled are deleted at once.
- Old dishes with `/images/...` photos keep working; those photos are never deleted.

## Deploying

A Vercel project with **Root Directory** `murree-foods-admin`. The [main README](../README.md#deploying-on-vercel-when-you-merge-into-main)
has the steps for all three apps.
