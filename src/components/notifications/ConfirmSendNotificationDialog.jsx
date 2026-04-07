import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

/**
 * Confirms before dispatching an admin/mod notification to the queue.
 */
export function ConfirmSendNotificationDialog({
  open,
  onOpenChange,
  audienceLabel,
  notificationType,
  title,
  messageSnippet,
  onConfirm,
  isSending,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] gap-4">
        <DialogHeader>
          <DialogTitle>Send this notification?</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 pt-1 text-left text-sm text-muted-foreground">
              <p className="m-0">
                This will queue the notification for delivery. Recipients may see it in their inbox and
                real-time alerts.
              </p>
              <dl className="m-0 space-y-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-xs text-foreground">
                <div className="flex gap-2">
                  <dt className="shrink-0 font-semibold text-muted-foreground">To</dt>
                  <dd className="m-0 min-w-0 font-medium break-all">{audienceLabel}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="shrink-0 font-semibold text-muted-foreground">Type</dt>
                  <dd className="m-0 capitalize">{notificationType?.replace(/_/g, " ") || "—"}</dd>
                </div>
                {title ? (
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-semibold text-muted-foreground">Title</dt>
                    <dd className="m-0 min-w-0 font-semibold">{title}</dd>
                  </div>
                ) : null}
              </dl>
              {messageSnippet ? (
                <p className="m-0 line-clamp-3 rounded-md border border-border/60 bg-background px-2.5 py-2 text-xs text-muted-foreground">
                  {messageSnippet}
                </p>
              ) : null}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#f9bf3b] text-[#1a1200] hover:bg-[#e0a92f] font-semibold shadow-sm"
            onClick={onConfirm}
            disabled={isSending}
          >
            {isSending ? "Sending…" : "Send notification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
