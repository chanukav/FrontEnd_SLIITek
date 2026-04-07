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
 * Confirms before removing a notification from the list (API delete).
 */
export function DeleteNotificationDialog({
  open,
  onOpenChange,
  notificationTitle,
  notificationSnippet,
  onConfirm,
  isDeleting,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] gap-4">
        <DialogHeader>
          <DialogTitle>Delete notification?</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 pt-1 text-left text-sm text-muted-foreground">
              <p className="m-0">This cannot be undone.</p>
              {notificationTitle ? (
                <p className="m-0 rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm font-semibold text-foreground">
                  {notificationTitle}
                </p>
              ) : null}
              {notificationSnippet ? (
                <p className="m-0 line-clamp-2 text-xs text-muted-foreground">{notificationSnippet}</p>
              ) : null}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
