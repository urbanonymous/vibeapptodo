import type { StepProgress, StepTemplate } from "../../types/models";
import { Button } from "../ui/Button";
import { useMemo, useState } from "react";

export function StepCard({
  template,
  progress,
  onChange,
  onCreateReminder
}: {
  template: StepTemplate;
  progress: StepProgress;
  onChange: (next: Partial<StepProgress>) => void;
  onCreateReminder?: (args: { remindAtIso: string; message: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const statusLabel = useMemo(() => progress.status.replaceAll("_", " "), [progress.status]);
  const [remindAt, setRemindAt] = useState("");
  const [reminderMsg, setReminderMsg] = useState("");

  return (
    <div className="rounded-2xl border border-border bg-card p-4 backdrop-blur">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-muted">
              Step {template.number} · {template.phase}
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="truncate font-semibold">{template.title}</div>
              <span className="rounded-full border border-border bg-bg/40 px-2 py-0.5 text-[11px] text-muted">
                {statusLabel}
              </span>
            </div>
          </div>
          <div className="shrink-0 rounded-lg border border-border bg-bg/40 px-2 py-1 text-xs text-muted">
            {progress.progress_percent}%
          </div>
        </div>

        <div className="mt-3 h-2 w-full rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-accent"
            style={{ width: `${Math.min(100, Math.max(0, progress.progress_percent))}%` }}
          />
        </div>

        {!open ? (
          <div className="mt-2 text-sm text-muted line-clamp-2">{template.description}</div>
        ) : null}
      </button>

      {open ? (
        <>
          <div className="mt-4 text-sm text-muted whitespace-pre-line">{template.description}</div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs text-muted">Progress</div>
              <div className="text-xs text-muted">{statusLabel}</div>
            </div>
            <input
              className="w-full accent-teal-400"
              type="range"
              min={0}
              max={100}
              value={progress.progress_percent}
              onChange={(e) =>
                onChange({
                  progress_percent: Number(e.target.value),
                  status: Number(e.target.value) >= 100 ? "completed" : "in_progress"
                })
              }
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="min-w-[220px] flex-1">
              <div className="text-xs text-muted">Status</div>
              <select
                className="mt-1 w-full rounded-lg border border-border bg-bg/40 px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-accent/40"
                value={progress.status}
                onChange={(e) => onChange({ status: e.target.value as StepProgress["status"] })}
              >
                <option value="not_started">Not started</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="skipped">Skipped</option>
              </select>
            </div>
            {progress.completed_at ? (
              <div className="min-w-[220px] flex-1">
                <div className="text-xs text-muted">Completed</div>
                <div className="mt-1 rounded-lg border border-border bg-bg/40 px-3 py-2 text-sm text-text">
                  {new Date(progress.completed_at).toLocaleString()}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4">
            <div className="text-xs text-muted">Notes</div>
            <textarea
              className="mt-1 min-h-[90px] w-full resize-y rounded-lg border border-border bg-bg/40 px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-accent/40"
              value={progress.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              placeholder="What did you learn / change / decide?"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => onChange({ status: "not_started", progress_percent: 0, completed_at: undefined })}
            >
              Reset
            </Button>
            <Button
              onClick={() =>
                onChange({
                  status: "completed",
                  progress_percent: 100,
                  completed_at: new Date().toISOString()
                })
              }
            >
              Mark complete
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Collapse
            </Button>
          </div>

          {onCreateReminder ? (
            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="text-xs text-muted">Reminders</div>

              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <input
                    className="w-full rounded-lg border border-border bg-bg/40 px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-accent/40"
                    type="datetime-local"
                    value={remindAt}
                    onChange={(e) => setRemindAt(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    className="w-full rounded-lg border border-border bg-bg/40 px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-accent/40"
                    value={reminderMsg}
                    onChange={(e) => setReminderMsg(e.target.value)}
                    placeholder="Reminder message (optional)"
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (!remindAt) return;
                    const iso = new Date(remindAt).toISOString();
                    onCreateReminder({ remindAtIso: iso, message: reminderMsg || `Step ${template.number}: ${template.title}` });
                    setRemindAt("");
                    setReminderMsg("");
                  }}
                >
                  + Add reminder
                </Button>
                <div className="text-xs text-muted">Uses browser notifications when enabled.</div>
              </div>

              {(progress.reminders || []).length ? (
                <div className="mt-3 space-y-1">
                  {[...progress.reminders]
                    .sort((a, b) => (a.remind_at < b.remind_at ? -1 : 1))
                    .slice(0, 6)
                    .map((r) => (
                      <div
                        key={r.id}
                        className="rounded-lg border border-border bg-bg/30 px-3 py-2 text-sm text-text"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium">{new Date(r.remind_at).toLocaleString()}</div>
                          <div className="text-[11px] text-muted">{r.sent ? "sent" : "pending"}</div>
                        </div>
                        <div className="mt-1 text-xs text-muted">{r.message}</div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="mt-2 text-xs text-muted">No reminders set for this step.</div>
              )}
            </div>
          ) : null}

          {(template.resources?.length || template.external_links?.length) ? (
            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="text-xs text-muted">Resources</div>
              <div className="mt-2 space-y-1">
                {(template.resources || []).slice(0, 8).map((r) => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-lg border border-border bg-bg/30 px-3 py-2 text-sm text-text hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-medium">{r.title}</div>
                      <div className="text-[11px] text-muted">{r.type}</div>
                    </div>
                    {r.description ? <div className="mt-1 text-xs text-muted">{r.description}</div> : null}
                  </a>
                ))}
              </div>

              {(template.external_links || []).length ? (
                <>
                  <div className="mt-4 text-xs text-muted">External links</div>
                  <div className="mt-2 space-y-1">
                    {(template.external_links || []).slice(0, 8).map((r) => (
                      <a
                        key={r.id}
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-lg border border-border bg-bg/30 px-3 py-2 text-sm text-text hover:bg-white/10"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium">{r.title}</div>
                          <div className="text-[11px] text-muted">{r.type}</div>
                        </div>
                        {r.description ? <div className="mt-1 text-xs text-muted">{r.description}</div> : null}
                      </a>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

