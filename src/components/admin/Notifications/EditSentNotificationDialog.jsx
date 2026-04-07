import { Loader2, Pencil } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";

export function EditSentNotificationDialog({
  open,
  onClose,
  onSave,
  saving,
  showValidation = false,
  errors = {},
  audienceLabel,
  editType,
  setEditType,
  editTitle,
  setEditTitle,
  editEntityType,
  setEditEntityType,
  editEntityId,
  setEditEntityId,
  editMessage,
  setEditMessage,
}) {
  const getFieldError = (name) => (showValidation ? errors?.[name] : "");

  const inputClasses = (error) => `
    w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition-all duration-200
    placeholder:text-slate-400
    focus-visible:outline-none focus-visible:bg-white focus-visible:ring-4
    ${
      error
        ? "border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500/20"
        : "border-slate-200 focus-visible:border-[#f9bf3b] focus-visible:ring-[#f9bf3b]/20 hover:border-slate-300"
    }
  `;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center shadow-sm shrink-0"
                style={{
                  background: "linear-gradient(135deg, #f9bf3b 0%, #f5b012 100%)",
                }}
              >
                <Pencil className="h-6 w-6 text-[#1a1200]" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Edit sent notification
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500 mt-0.5">
                  Changes apply to this delivery only. The audience cannot be changed here.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="rounded-xl border border-slate-200 bg-slate-100/60 px-3.5 py-2.5 text-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Audience
            </span>
            <p className="mt-1 font-medium text-slate-900 break-all">{audienceLabel}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="sm:col-span-3 space-y-1.5">
              <label
                htmlFor="edit-title"
                className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
              >
                Notification Title
              </label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={inputClasses(getFieldError("title"))}
                aria-invalid={!!getFieldError("title")}
              />
              {getFieldError("title") && (
                <p className="text-xs text-red-600 font-medium pl-1">{getFieldError("title")}</p>
              )}
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label
                htmlFor="edit-type"
                className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
              >
                Type
              </label>
              <select
                id="edit-type"
                className={inputClasses(getFieldError("type"))}
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
              >
                <option value="announcement">Announcement</option>
                <option value="answer">New Answer</option>
                <option value="comment">Comment</option>
                <option value="best_answer">Best Answer</option>
                <option value="report_update">Report Update</option>
              </select>
              {getFieldError("type") && (
                <p className="text-xs text-red-600 font-medium pl-1">{getFieldError("type")}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
            <div className="space-y-1.5">
              <label
                htmlFor="edit-entityType"
                className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
              >
                Entity Type
              </label>
              <Input
                id="edit-entityType"
                value={editEntityType}
                onChange={(e) => setEditEntityType(e.target.value)}
                className={inputClasses(getFieldError("entityType"))}
                aria-invalid={!!getFieldError("entityType")}
              />
              {getFieldError("entityType") && (
                <p className="text-xs text-red-600 font-medium pl-1">
                  {getFieldError("entityType")}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="edit-entityId"
                className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
              >
                Entity ID <span className="text-slate-400 font-normal lowercase">(optional)</span>
              </label>
              <Input
                id="edit-entityId"
                value={editEntityId}
                onChange={(e) => setEditEntityId(e.target.value)}
                className={inputClasses(getFieldError("entityId"))}
                aria-invalid={!!getFieldError("entityId")}
              />
              {getFieldError("entityId") && (
                <p className="text-xs text-red-600 font-medium pl-1">{getFieldError("entityId")}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="edit-message"
              className="text-[11px] font-bold uppercase tracking-wider text-slate-500"
            >
              Message Body
            </label>
            <textarea
              id="edit-message"
              className={`min-h-[100px] resize-none ${inputClasses(getFieldError("message"))}`}
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              aria-invalid={!!getFieldError("message")}
            />
            {getFieldError("message") && (
              <p className="text-xs text-red-600 font-medium pl-1">{getFieldError("message")}</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80">
          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => onClose(false)}
              disabled={saving}
              className="rounded-xl hover:bg-slate-200/50 text-slate-600 font-semibold"
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={saving}
              className="rounded-xl text-[#1a1200] font-bold shadow-lg shadow-[#f9bf3b]/20 min-w-[140px] transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: "linear-gradient(135deg, #f9bf3b 0%, #f5b012 100%)" }}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
