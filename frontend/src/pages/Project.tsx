import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout";
import { StepCard } from "../components/steps/StepCard";
import { ProgressRing } from "../components/ui/ProgressRing";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";
import type { Project, StepProgress, StepTemplate } from "../types/models";

type ProjectDetailResponse = {
  project: Project;
  steps: StepTemplate[];
  progress: StepProgress[];
};

export function ProjectPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProjectDetailResponse | null>(null);

  const progressByStep = useMemo(() => {
    const map = new Map<number, StepProgress>();
    for (const p of data?.progress || []) map.set(p.step_number, p);
    return map;
  }, [data]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user || !projectId) return;
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch<ProjectDetailResponse>(`/api/projects/${projectId}`, { user });
        if (mounted) setData(res);
      } catch (e: any) {
        setError(e?.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [user, projectId]);

  async function updateStep(stepNumber: number, patch: Partial<StepProgress>) {
    if (!user || !projectId) return;
    const existing = progressByStep.get(stepNumber);
    if (!existing || !data) return;

    const optimistic: StepProgress = { ...existing, ...patch };
    setData({
      ...data,
      progress: data.progress.map((p) => (p.step_number === stepNumber ? optimistic : p))
    });

    try {
      const updated = await apiFetch<StepProgress>(`/api/projects/${projectId}/steps/${stepNumber}`, {
        method: "PUT",
        user,
        body: patch
      });
      setData((prev) => {
        if (!prev) return prev;
        return { ...prev, progress: prev.progress.map((p) => (p.step_number === stepNumber ? updated : p)) };
      });
    } catch (e: any) {
      setError(e?.message || "Failed to update step");
    }
  }

  async function createReminder(stepNumber: number, remindAtIso: string, message: string) {
    if (!user || !projectId) return;
    setError(null);
    try {
      const created = await apiFetch<{
        id: string;
        project_id: string;
        step_number: number;
        remind_at: string;
        message: string;
        sent: boolean;
      }>(`/api/reminders?project_id=${encodeURIComponent(projectId)}&step_number=${encodeURIComponent(String(stepNumber))}`, {
        method: "POST",
        user,
        body: { remind_at: remindAtIso, message }
      });

      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          progress: prev.progress.map((p) => {
            if (p.step_number !== stepNumber) return p;
            return {
              ...p,
              reminders: [
                ...(p.reminders || []),
                { id: created.id, remind_at: created.remind_at, message: created.message, sent: created.sent }
              ]
            };
          })
        };
      });
    } catch (e: any) {
      setError(e?.message || "Failed to create reminder");
    }
  }

  const title = data?.project?.name || "Project";

  return (
    <AppLayout title={title}>
      {error && (
        <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-text">
          {error}
        </div>
      )}

      {loading && <div className="text-sm text-muted">Loading...</div>}

      {!loading && data && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-4 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm text-muted">Overall progress</div>
                <div className="mt-1 text-sm text-muted line-clamp-2">{data.project.description}</div>
              </div>
              <div className="shrink-0">
                <ProgressRing value={data.project.overall_progress} size={56} stroke={6} />
              </div>
            </div>
          </div>

          {groupByPhase(data.steps).map(([phase, steps]) => (
            <div key={phase}>
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-semibold">{phase}</div>
                <div className="text-xs text-muted">{phaseProgress(steps, progressByStep)}%</div>
              </div>
              <div className="mb-4 h-2 w-full rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-accent"
                  style={{ width: `${phaseProgress(steps, progressByStep)}%` }}
                />
              </div>
              <div className="space-y-4">
                {steps.map((t) => {
                  const p =
                    progressByStep.get(t.number) ||
                    ({
                      step_number: t.number,
                      status: "not_started",
                      progress_percent: 0,
                      notes: "",
                      reminders: []
                    } as StepProgress);
                  return (
                    <StepCard
                      key={t.number}
                      template={t}
                      progress={p}
                      onChange={(n) => void updateStep(t.number, n)}
                      onCreateReminder={({ remindAtIso, message }) => void createReminder(t.number, remindAtIso, message)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}

function groupByPhase(steps: StepTemplate[]): Array<[string, StepTemplate[]]> {
  const order = ["Phase 1: MVP Launch", "Phase 2: Demo & Hooks", "Phase 3: Feedback Loop", "Phase 4: Monetization", "Phase 5: Scale & PMF"];
  const map = new Map<string, StepTemplate[]>();
  for (const s of steps) map.set(s.phase, [...(map.get(s.phase) || []), s]);
  return order
    .filter((p) => map.has(p))
    .map((p) => [p, map.get(p)!] as [string, StepTemplate[]]);
}

function phaseProgress(steps: StepTemplate[], progressByStep: Map<number, StepProgress>) {
  if (steps.length === 0) return 0;
  const sum = steps.reduce((acc, s) => acc + (progressByStep.get(s.number)?.progress_percent ?? 0), 0);
  return Math.round(sum / steps.length);
}

