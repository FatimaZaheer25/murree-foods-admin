import { APP } from "./api";
import { appUrl } from "./apps";

// Purani dishes ki photo website ke public/ folder mein hai: "/images/foods/naan.jpg".
// Website khud yahi path istemal karti hai. Admin (alag app) ko yahi photo website ke address se milti hai:
// http://localhost:3000/images/foods/naan.jpg (NEXT_PUBLIC_SITE_URL)
export const isSitePhoto = (src: string) => src.startsWith("/");

export const dishImageSrc = (src: string) =>
  APP === "customer" || !isSitePhoto(src) ? src : (appUrl("customer", src) ?? src);
