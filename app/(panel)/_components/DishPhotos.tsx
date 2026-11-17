"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { dishImageSrc } from "@murree/shared/lib/images";
import { PHOTO_HINT, discardDishPhoto, preparePhoto, uploadDishPhoto } from "@/lib/photoUpload";

const errorClass = "mt-1.5 block text-xs font-medium text-red-600";
const ACCEPT = "image/jpeg,image/png,image/webp";

type UploadEvents = {
  onUploaded: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
};

// Ek photo chuno -> chhoti karo -> upload (progress ke saath). Form band ho jaye aur upload baad mein pura ho
// to woh photo kahin save nahi hogi: foran Cloudinary se hata do
function useUpload({ onUploaded, onBusyChange }: UploadEvents) {
  const inputRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(true);
  const [preview, setPreview] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [preparing, setPreparing] = useState(false); // bari photo chhoti ho rahi hai
  const [error, setError] = useState("");

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function start(file: File) {
    setError("");
    onBusyChange(true);
    let localUrl = "";
    try {
      setProgress(0);
      setPreparing(true);
      const photo = await preparePhoto(file);
      localUrl = URL.createObjectURL(photo);
      if (mounted.current) {
        setPreview(localUrl);
        setPreparing(false);
      }
      const url = await uploadDishPhoto(photo, (percent) => mounted.current && setProgress(percent));
      if (mounted.current) onUploaded(url);
      else void discardDishPhoto(url);
    } catch (e) {
      if (mounted.current) setError(e instanceof Error ? e.message : "Photo upload failed. Please try again.");
    } finally {
      if (localUrl) URL.revokeObjectURL(localUrl);
      if (mounted.current) {
        setPreview("");
        setProgress(null);
        setPreparing(false);
      }
      onBusyChange(false);
    }
  }

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={ACCEPT}
      hidden
      onChange={(e) => {
        const file = e.target.files?.[0];
        e.target.value = ""; // wahi photo dobara chunein to bhi chale
        if (file) void start(file);
      }}
    />
  );

  return { input, open: () => inputRef.current?.click(), preview, progress, preparing, error, uploading: progress !== null };
}

// Photo ke upar progress (andhera parda + % + patti)
function Progress({ percent, preparing }: { percent: number; preparing: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-charcoal/55 text-white">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-xs font-semibold">
        {preparing ? "Preparing photo…" : percent < 100 ? `Uploading ${percent}%` : "Saving…"}
      </span>
      <div
        role="progressbar"
        aria-label="Upload progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="absolute inset-x-0 bottom-0 h-1 bg-white/30"
      >
        <div className="h-full bg-white transition-[width]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function Thumb({ src }: { src: string }) {
  // Sirf dekhne ke liye (admin): next/image nahi
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className="h-full w-full object-cover" />;
}

// ================= MAIN PHOTO =================
export function MainPhoto({
  url,
  error,
  onChange,
  onBusyChange,
}: {
  url: string;
  error?: string;
  onChange: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const upload = useUpload({ onUploaded: onChange, onBusyChange });
  const shown = upload.preview || (url ? dishImageSrc(url) : "");
  const message = upload.error || error;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={upload.open}
          disabled={upload.uploading}
          aria-label={url ? "Replace main photo" : "Upload main photo"}
          data-invalid={!!message}
          aria-describedby={message ? "main-photo-error" : undefined}
          className={`relative h-28 w-40 shrink-0 overflow-hidden rounded-xl border bg-cream-100 sm:h-32 sm:w-48 ${
            message ? "border-red-400" : shown ? "border-cream-300" : "border-dashed border-cream-300 hover:border-forest-600"
          }`}
        >
          {shown ? (
            <Thumb src={shown} />
          ) : (
            <span className="flex h-full flex-col items-center justify-center gap-1.5 text-charcoal-400">
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs font-semibold">Add photo</span>
            </span>
          )}
          {upload.progress !== null && <Progress percent={upload.progress} preparing={upload.preparing} />}
        </button>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={upload.open}
              disabled={upload.uploading}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-cream-300 px-3 text-sm font-semibold text-forest-700 hover:bg-cream-100 disabled:pointer-events-none disabled:opacity-60"
            >
              <Upload className="h-3.5 w-3.5" />
              {url ? "Replace photo" : "Upload photo"}
            </button>
            {url && !upload.uploading && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-charcoal-400">{PHOTO_HINT}</p>
        </div>
      </div>
      {message && (
        <span id="main-photo-error" className={errorClass}>
          {message}
        </span>
      )}
      {upload.input}
    </div>
  );
}

// ================= EXTRA PHOTOS =================
export function ExtraPhotos({
  photos,
  max,
  errors,
  onAdd,
  onRemove,
  onBusyChange,
}: {
  photos: string[];
  max: number;
  errors: string[];
  onAdd: (url: string) => void;
  onRemove: (index: number) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const upload = useUpload({ onUploaded: onAdd, onBusyChange });
  const messages = [...errors, upload.error].filter(Boolean);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {photos.map((photo, i) => (
          <div
            key={`${i}-${photo}`}
            className={`relative aspect-[4/3] overflow-hidden rounded-xl border bg-cream-100 ${errors[i] ? "border-red-400" : "border-cream-300"}`}
          >
            <Thumb src={dishImageSrc(photo)} />
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label={`Remove extra photo ${i + 1}`}
              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-soft hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Upload ho rahi photo: apni jagah par preview + progress */}
        {upload.uploading && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-cream-300 bg-cream-100">
            {upload.preview && <Thumb src={upload.preview} />}
            <Progress percent={upload.progress ?? 0} preparing={upload.preparing} />
          </div>
        )}

        {!upload.uploading && photos.length < max && (
          <button
            type="button"
            onClick={upload.open}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-cream-300 text-forest-700 hover:border-forest-600 hover:bg-cream-50"
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs font-semibold">
              Add extra photo ({photos.length}/{max})
            </span>
          </button>
        )}
      </div>
      {messages.map((message, i) => (
        <span key={i} className={errorClass}>
          {message}
        </span>
      ))}
      {upload.input}
    </div>
  );
}
