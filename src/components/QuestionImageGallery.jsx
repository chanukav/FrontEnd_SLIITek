import { useEffect, useMemo, useState } from "react";

const buildSrc = (img, fallbackOrigin = "") => {
  const u = (img?.viewUrl || img?.url || "").trim();
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (!fallbackOrigin) return u;
  if (u.startsWith("/")) return `${fallbackOrigin}${u}`;
  return `${fallbackOrigin}/${u}`;
};

export function QuestionImageGallery({
  images = [],
  origin = "",
  maxPreview = 4,
  onRemoveUrl, // optional: (url) => void
  canRemove = false,
  className = "",
}) {
  const normalized = useMemo(
    () =>
      (images || [])
        .map((img) => ({
          key: `${img?.blobName || ""}-${img?.url || ""}`,
          url: img?.url || "",
          src: buildSrc(img, origin),
        }))
        .filter((x) => !!x.src),
    [images, origin]
  );

  const [openIndex, setOpenIndex] = useState(-1);
  const open = (i) => setOpenIndex(i);
  const close = () => setOpenIndex(-1);
  const next = () => setOpenIndex((i) => (i + 1) % normalized.length);
  const prev = () => setOpenIndex((i) => (i - 1 + normalized.length) % normalized.length);

  useEffect(() => {
    if (openIndex < 0) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex, normalized.length]);

  if (!normalized.length) return null;

  const preview = normalized.slice(0, Math.max(1, maxPreview));
  const extra = Math.max(0, normalized.length - preview.length);

  const gridClass =
    preview.length === 1
      ? "grid-cols-1"
      : preview.length === 2
        ? "grid-cols-2"
        : "grid-cols-2";

  return (
    <>
      <div
        className={[
          "grid gap-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-50",
          gridClass,
          className.trim() ? className : "mt-4",
        ].join(" ")}
      >
        {preview.map((img, idx) => {
          const isLastWithExtra = extra > 0 && idx === preview.length - 1;
          return (
            <div key={img.key} className="relative">
              <button
                type="button"
                className="block w-full h-full"
                onClick={() => open(idx)}
                title="Click to view"
              >
                <img
                  src={img.src}
                  alt=""
                  className={[
                    "w-full object-cover",
                    preview.length === 1 ? "max-h-[420px]" : "h-44 sm:h-52 md:h-60",
                  ].join(" ")}
                />
                {isLastWithExtra && (
                  <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                    <span className="text-white text-3xl font-extrabold">+{extra}</span>
                  </div>
                )}
              </button>

              {canRemove && onRemoveUrl && (
                <button
                  type="button"
                  className="absolute top-2 right-2 rounded-md bg-red-600/90 px-2 py-1 text-xs font-semibold text-white hover:bg-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveUrl(img.url);
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>

      {openIndex >= 0 && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4"
          onClick={close}
          role="presentation"
        >
          <button
            type="button"
            className="absolute top-4 right-4 rounded-md bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/20"
            onClick={close}
          >
            Close
          </button>
          {normalized.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 px-3 py-2 text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label="Next"
              >
                ›
              </button>
            </>
          )}
          <img
            src={normalized[openIndex]?.src}
            alt="Preview"
            className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

