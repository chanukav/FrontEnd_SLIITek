import { useCallback, useId, useRef, useState } from "react";

const ACCEPT_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

function filterImageFiles(fileList) {
  return Array.from(fileList).filter((f) => {
    const t = (f.type || "").toLowerCase();
    if (ACCEPT_TYPES.has(t)) return true;
    return /\.(jpe?g|png|gif|webp)$/i.test(f.name);
  });
}

/**
 * @param {object} props
 * @param {File[]} [props.files]
 * @param {(files: File[]) => void} [props.onFilesChange] — form mode: merges into selected list (max total = maxFiles)
 * @param {(files: File[]) => void | Promise<void>} [props.onFilesReady] — immediate mode: e.g. upload now (batch sliced to maxFiles)
 * @param {number} [props.maxFiles]
 * @param {boolean} [props.disabled]
 * @param {string} [props.label]
 * @param {string} [props.hint]
 * @param {string} [props.className] — extra classes on outer wrapper
 */
export function ImageDropZone({
  files = [],
  onFilesChange,
  onFilesReady,
  maxFiles = 8,
  disabled = false,
  label = "Screenshots & images",
  hint = "Drag & drop images here, or click to browse · JPEG, PNG, GIF, WebP · max 5MB each",
  className = "",
}) {
  const reactId = useId();
  const inputId = `image-drop-${reactId.replace(/:/g, "")}`;
  const [active, setActive] = useState(false);
  const dragDepth = useRef(0);

  const addFiles = useCallback(
    (incoming) => {
      if (disabled) return;
      const allowed = filterImageFiles(incoming);
      if (!allowed.length) return;

      if (onFilesReady) {
        onFilesReady(allowed.slice(0, maxFiles));
        return;
      }
      if (onFilesChange) {
        onFilesChange([...files, ...allowed].slice(0, maxFiles));
      }
    },
    [disabled, files, maxFiles, onFilesChange, onFilesReady]
  );

  const onDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragDepth.current += 1;
    setActive(true);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setActive(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = 0;
    setActive(false);
    addFiles(e.dataTransfer.files);
  };

  const onInputChange = (e) => {
    addFiles(e.target.files || []);
    e.target.value = "";
  };

  const showCount = typeof onFilesChange === "function" && files.length > 0;

  return (
    <div className={className}>
      <p className="block text-sm font-medium text-slate-700 mb-1">{label}</p>
      <div
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={[
          "rounded-lg border-2 border-dashed p-6 text-center transition-colors",
          disabled ? "opacity-50 cursor-not-allowed bg-slate-100" : "cursor-pointer",
          active && !disabled
            ? "border-amber-400 bg-amber-50/70"
            : "border-slate-300 bg-slate-50/90 hover:border-slate-400 hover:bg-slate-50",
        ].join(" ")}
      >
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          className="sr-only"
          disabled={disabled}
          onChange={onInputChange}
        />
        <label
          htmlFor={inputId}
          className={
            disabled ? "pointer-events-none text-slate-500" : "cursor-pointer text-slate-600"
          }
        >
          <span className="text-sm block">{hint}</span>
          {showCount && (
            <span className="text-xs text-slate-500 mt-2 block">
              {files.length} file{files.length === 1 ? "" : "s"} selected
            </span>
          )}
        </label>
      </div>
    </div>
  );
}
