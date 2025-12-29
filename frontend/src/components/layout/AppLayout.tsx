import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

export function AppLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-accent/90" />
            <div className="font-semibold tracking-tight">VibeTracker</div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-sm text-muted sm:block">{user?.email}</div>
            <Button
              variant="ghost"
              onClick={() => {
                void signOut(auth);
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}

