"use client";

// Table ke neeche: "Showing 1–20 of 45" + Previous / Next
export default function Pager({
  page,
  totalPages,
  total,
  shown,
  pageSize = 20,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  shown: number;
  pageSize?: number;
  onPage: (page: number) => void;
}) {
  if (total === 0) return null;
  const from = (page - 1) * pageSize + 1;
  const button =
    "min-h-9 rounded-lg border border-cream-300 px-3 font-semibold text-charcoal-600 hover:bg-cream-100 disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cream-100 px-5 py-3 text-sm text-charcoal-400">
      <span>
        Showing {from}–{from + shown - 1} of {total}
      </span>
      <div className="flex gap-2">
        <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className={button}>
          Previous
        </button>
        <button type="button" disabled={page >= totalPages} onClick={() => onPage(page + 1)} className={button}>
          Next
        </button>
      </div>
    </div>
  );
}
