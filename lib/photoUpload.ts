import { APP, ApiError, api } from "@murree/shared/lib/api";

// Admin Menu ki photo: browser mein 1600px tak chhoti, phir backend ke zariye Cloudinary par.
// Backend bhi yahi qaayde dobara check karta hai (5 MB, JPG/PNG/WebP, asli photo)

const MAX_SIDE = 1600;
const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

export const PHOTO_HINT = "JPG, PNG or WebP, up to 5 MB. Big photos are made smaller (1600px) before upload.";

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

// Bari photo 1600px tak chhoti. Chhoti aur 5 MB se kam ho to waisi hi jati hai
export async function preparePhoto(file: File): Promise<Blob> {
  if (!TYPES.includes(file.type)) throw new Error("Please choose a JPG, PNG or WebP photo.");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file); // phone ki photo ka rukh (EXIF) bhi theek
  } catch {
    throw new Error("This photo could not be opened. Please choose another JPG, PNG or WebP photo.");
  }

  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= MAX_BYTES) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("This browser could not resize the photo.");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    let blob = await toBlob(canvas, file.type, 0.86);
    // Browser yeh qisam na bana sake (jaise purane Safari mein WebP) ya PNG phir bhi bari: safed peeche wala JPEG
    if (!blob || blob.type !== file.type || blob.size > MAX_BYTES) {
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      blob = await toBlob(canvas, "image/jpeg", 0.86);
    }
    if (!blob || blob.size > MAX_BYTES) throw new Error("Photo is too large. The limit is 5 MB.");
    return blob;
  } finally {
    bitmap.close();
  }
}

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// fetch upload ki progress nahi batata, is liye XMLHttpRequest. Wapas: Cloudinary ka https link
export function uploadDishPhoto(photo: Blob, onProgress: (percent: number) => void): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return Promise.reject(new Error("NEXT_PUBLIC_API_URL is not set"));

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${baseUrl}/admin/uploads/dish-photo`);
    xhr.withCredentials = true; // admin ki login cookie
    xhr.setRequestHeader("X-App", APP);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.min(100, Math.round((e.loaded / e.total) * 100)));
    };
    xhr.onload = () => {
      let data: { url?: string; message?: string } | null = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300 && data?.url) resolve(data.url);
      else reject(new ApiError(data?.message ?? "Photo upload failed. Please try again.", xhr.status));
    };
    xhr.onerror = () => reject(new ApiError("Could not reach the server. Please check your connection and try again.", 0));
    xhr.ontimeout = xhr.onerror;
    xhr.timeout = 120_000;

    const body = new FormData();
    body.append("photo", photo, `photo.${EXT[photo.type] ?? "jpg"}`);
    xhr.send(body);
  });
}

// Upload ki lekin dish mein save nahi hui: Cloudinary se hatao (backend dekhta hai ke kahin lagi to nahi).
// Na ho sake to koi baat nahi, is liye ghalti chup chaap
export const discardDishPhoto = (url: string) =>
  api("/admin/uploads/dish-photo", { method: "DELETE", body: { url } }).catch(() => {});
