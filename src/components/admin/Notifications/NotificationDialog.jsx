import { useState } from "react"
import { Send as SendIcon, Loader2, Users, User as UserIcon, BellRing, FlaskConical } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Input } from "../../../components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog"

export function NotificationDialog({ 
  open, 
  onClose, 
  onSend,
  sending,
  showValidation = false,
  errors = {},
  newType, 
  setNewType, 
  newEmail, 
  setNewEmail, 
  newTitle,
  setNewTitle,
  newEntityType,
  setNewEntityType,
  newEntityId,
  setNewEntityId,
  newQuestionId = "",
  setNewQuestionId = () => {},
  newAnswerId = "",
  setNewAnswerId = () => {},
  newMessage, 
  setNewMessage,
  demoScenarios = [],
  onApplyDemoScenario,
  /** Bumped when the parent opens this dialog so the demo dropdown resets. */
  presentationDemoKey = 0,
}) {
  /** Remount `<select>` so the same scenario can be chosen again in one session. */
  const [demoPickSeq, setDemoPickSeq] = useState(0)

  const getFieldError = (name) => (showValidation ? errors?.[name] : "")
  const isBroadcast = newEmail === "all"

  const handleDemoScenarioSelect = (e) => {
    const v = e.target.value
    if (v === "" || typeof onApplyDemoScenario !== "function") return
    onApplyDemoScenario(parseInt(v, 10))
    setDemoPickSeq((k) => k + 1)
  }

  const inputClasses = (error) => `
    w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 transition-all duration-200
    placeholder:text-slate-400 
    focus-visible:outline-none focus-visible:bg-white focus-visible:ring-4
    ${error 
      ? "border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500/20" 
      : "border-slate-200 focus-visible:border-[#f9bf3b] focus-visible:ring-[#f9bf3b]/20 hover:border-slate-300"
    }
  `

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <DialogHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-12 w-12 rounded-full flex items-center justify-center shadow-sm shrink-0" style={{ background: "linear-gradient(135deg, #f9bf3b 0%, #f5b012 100%)" }}>
                  <BellRing className="h-6 w-6 text-[#1a1200]" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-xl font-bold text-slate-900">Dispatch Notification</DialogTitle>
                  <DialogDescription className="text-sm text-slate-500 mt-0.5">
                    Send a targeted alert or broadcast to the entire community.
                  </DialogDescription>
                </div>
              </div>
              {demoScenarios.length > 0 && typeof onApplyDemoScenario === "function" && (
                <div className="w-full sm:w-[min(100%,280px)] shrink-0 space-y-1.5 rounded-xl border border-amber-200/90 bg-amber-50/60 px-3 py-2.5">
                  <label htmlFor="presentation-demo-scenario" className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-900/85">
                    <FlaskConical className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    Demo <span className="font-normal normal-case text-amber-800/70">(presentation only)</span>
                  </label>
                  <select
                    id="presentation-demo-scenario"
                    key={`${presentationDemoKey}-${demoPickSeq}`}
                    defaultValue=""
                    onChange={handleDemoScenarioSelect}
                    className={`${inputClasses("")} w-full min-h-[40px] text-xs font-medium cursor-pointer`}
                  >
                    <option value="">Choose scenario to fill form…</option>
                    {demoScenarios.map((s, i) => (
                      <option key={s.id} value={String(i)} title={s.hint}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Audience Selector */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Audience</label>
            <div className="flex p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setNewEmail("all")}
                className={`flex flex-1 items-center justify-center gap-2 text-sm font-semibold py-2 rounded-lg transition-all duration-200 ${
                  isBroadcast 
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
              >
                <Users className="h-4 w-4" />
                Broadcast (All)
              </button>
              <button
                type="button"
                onClick={() => setNewEmail(isBroadcast ? "" : newEmail)}
                className={`flex flex-1 items-center justify-center gap-2 text-sm font-semibold py-2 rounded-lg transition-all duration-200 ${
                  !isBroadcast 
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50" 
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
              >
                <UserIcon className="h-4 w-4" />
                Specific User
              </button>
            </div>
          </div>

          {/* Specific User Email Input */}
          {!isBroadcast && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Target User Email</label>
              <Input
                id="email"
                type="text"
                placeholder="e.g. it22xxxxxx@my.sliit.lk"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className={inputClasses(getFieldError("email"))}
                aria-invalid={!!getFieldError("email")}
                required
              />
              {getFieldError("email") && (
                <p className="text-xs text-red-600 font-medium pl-1">{getFieldError("email")}</p>
              )}
            </div>
          )}

          {/* Title & Type Row */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            <div className="sm:col-span-3 space-y-1.5">
              <label htmlFor="title" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Notification Title</label>
              <Input
                id="title"
                type="text"
                placeholder="e.g. System Maintenance"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className={inputClasses(getFieldError("title"))}
                aria-invalid={!!getFieldError("title")}
                required
              />
              {getFieldError("title") && (
                <p className="text-xs text-red-600 font-medium pl-1">{getFieldError("title")}</p>
              )}
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="type" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Type</label>
              <select
                id="type"
                required
                className={inputClasses(getFieldError("type"))}
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
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
          
          {/* Entity Row */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
            <div className="space-y-1.5">
              <label htmlFor="entityType" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Entity Type</label>
              <Input
                id="entityType"
                placeholder="e.g. System, Post"
                value={newEntityType}
                onChange={(e) => setNewEntityType(e.target.value)}
                className={inputClasses(getFieldError("entityType"))}
                aria-invalid={!!getFieldError("entityType")}
                required
              />
              {getFieldError("entityType") && (
                <p className="text-xs text-red-600 font-medium pl-1">{getFieldError("entityType")}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="entityId" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Entity ID <span className="text-slate-400 font-normal lowercase">(optional)</span></label>
              <Input
                id="entityId"
                placeholder="Auto-generated"
                value={newEntityId}
                onChange={(e) => setNewEntityId(e.target.value)}
                className={inputClasses(getFieldError("entityId"))}
                aria-invalid={!!getFieldError("entityId")}
              />
              {getFieldError("entityId") && (
                <p className="text-xs text-red-600 font-medium pl-1">{getFieldError("entityId")}</p>
              )}
            </div>
            <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="questionId" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Question ID <span className="text-slate-400 font-normal lowercase">(optional link)</span>
                </label>
                <Input
                  id="questionId"
                  placeholder="For deep links to /questions/…"
                  value={newQuestionId}
                  onChange={(e) => setNewQuestionId(e.target.value)}
                  className={inputClasses(getFieldError("questionId"))}
                  aria-invalid={!!getFieldError("questionId")}
                />
                {getFieldError("questionId") && (
                  <p className="text-xs text-red-600 font-medium pl-1">{getFieldError("questionId")}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="answerId" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Answer ID <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <Input
                  id="answerId"
                  placeholder="Scroll target #answer-…"
                  value={newAnswerId}
                  onChange={(e) => setNewAnswerId(e.target.value)}
                  className={inputClasses(getFieldError("answerId"))}
                  aria-invalid={!!getFieldError("answerId")}
                />
                {getFieldError("answerId") && (
                  <p className="text-xs text-red-600 font-medium pl-1">{getFieldError("answerId")}</p>
                )}
              </div>
            </div>
          </div>

          {/* Message Body */}
          <div className="space-y-1.5">
            <label htmlFor="message" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Message Body</label>
            <textarea
              id="message"
              className={`min-h-[100px] resize-none ${inputClasses(getFieldError("message"))}`}
              placeholder="What do you want to tell your users?"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              aria-invalid={!!getFieldError("message")}
              required
            />
            {getFieldError("message") && (
              <p className="text-xs text-red-600 font-medium pl-1">{getFieldError("message")}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80">
          <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="order-2 sm:order-1 text-[11px] text-slate-500 text-center sm:text-left max-sm:w-full">
              {demoScenarios.length > 0
                ? "Use Demo in the header to autofill for presentations — nothing sends until you click Send."
                : "\u00a0"}
            </p>
            <div className="order-1 sm:order-2 flex w-full sm:w-auto items-center justify-end gap-2">
            <Button 
              variant="ghost" 
              onClick={() => onClose(false)} 
              disabled={sending}
              className="rounded-xl hover:bg-slate-200/50 text-slate-600 font-semibold"
            >
              Cancel
            </Button>
            <Button 
              onClick={onSend} 
              disabled={sending} 
              className="rounded-xl text-[#1a1200] font-bold shadow-lg shadow-[#f9bf3b]/20 min-w-[160px] transition-all hover:scale-[1.02] active:scale-[0.98]" 
              style={{ background: "linear-gradient(135deg, #f9bf3b 0%, #f5b012 100%)" }}
            >
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SendIcon className="mr-2 h-4 w-4" />
              )}
              {sending ? "Dispatching..." : "Send Notification"}
            </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
