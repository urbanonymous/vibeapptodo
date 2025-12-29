import { Link } from "react-router-dom";
import type { Project } from "../../types/models";
import { ProgressRing } from "../ui/ProgressRing";

function daysBetween(a: Date, b: Date) {
  const ms = Math.abs(a.getTime() - b.getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function ProjectCard({ project }: { project: Project }) {
  const updated = new Date(project.updated_at);
  const daysStale = daysBetween(new Date(), updated);
  const isStale = daysStale >= 7 && project.overall_progress < 100;

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group rounded-2xl border border-border bg-card p-4 backdrop-blur transition hover:bg-white/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="truncate font-semibold">{project.name}</div>
            {isStale ? (
              <span className="rounded-full border border-warn/40 bg-warn/10 px-2 py-0.5 text-[11px] text-text">
                stale
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-sm text-muted line-clamp-2">{project.description}</div>
        </div>

        <div className="shrink-0">
          <ProgressRing value={project.overall_progress} />
        </div>
      </div>

      <div className="mt-4 h-2 w-full rounded-full bg-white/10">
        <div
          className="h-2 rounded-full bg-accent"
          style={{ width: `${Math.min(100, Math.max(0, project.overall_progress))}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-muted">
        <div>Updated {updated.toLocaleDateString()}</div>
        {isStale ? <div>{daysStale}d idle</div> : <div>{daysStale}d ago</div>}
      </div>
    </Link>
  );
}

