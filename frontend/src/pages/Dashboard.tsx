import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "../components/layout/AppLayout";
import { Button } from "../components/ui/Button";
import { ProjectCard } from "../components/dashboard/ProjectCard";
import { useAuth } from "../hooks/useAuth";
import { apiFetch } from "../lib/api";
import { useProjectStore } from "../store/projectStore";
import type { Project } from "../types/models";

export function DashboardPage() {
  const { user } = useAuth();
  const { projects, setProjects } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifStatus, setNotifStatus] = useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );

  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
  }, [projects]);

  const staleCount = useMemo(() => {
    const now = Date.now();
    return projects.filter((p) => {
      const days = Math.floor(Math.abs(now - new Date(p.updated_at).getTime()) / (1000 * 60 * 60 * 24));
      return days >= 7 && p.overall_progress < 100;
    }).length;
  }, [projects]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<Project[]>("/api/projects", { user });
        if (mounted) setProjects(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load projects");
      } finally {
        setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [user, setProjects]);

  async function enableNotifications() {
    if (typeof Notification === "undefined") {
      setNotifStatus("unsupported");
      return;
    }
    const p = await Notification.requestPermission();
    setNotifStatus(p);
  }

  async function createProject() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const created = await apiFetch<Project>("/api/projects", {
        method: "POST",
        user,
        body: {
          name: `New Project`,
          description: "Track steps from MVP to PMF."
        }
      });
      setProjects([created, ...projects]);
    } catch (e: any) {
      setError(e?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout title="Projects">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-muted">Multi-project dashboard (phase-based, not kanban).</div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => void enableNotifications()}>
            {notifStatus === "granted" ? "Reminders enabled" : notifStatus === "unsupported" ? "No notifications" : "Enable reminders"}
          </Button>
          <Button onClick={() => void createProject()} disabled={loading}>
            + New Project
          </Button>
        </div>
      </div>

      {staleCount > 0 ? (
        <div className="mb-4 rounded-lg border border-warn/40 bg-warn/10 px-3 py-2 text-sm text-text">
          {staleCount} project{staleCount === 1 ? "" : "s"} look stale (no progress in 7+ days). Pick one and ship the next tiny change.
        </div>
      ) : null}

      {error && (
        <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-text">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}

        {!loading && sorted.length === 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted backdrop-blur sm:col-span-2 lg:col-span-3">
            No projects yet. Create one to start tracking the 33 steps.
          </div>
        )}
      </div>
    </AppLayout>
  );
}

