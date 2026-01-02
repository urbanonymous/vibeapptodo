import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase_config";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";

export function LoginPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) nav("/");
  }, [user, nav]);

  async function loginEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      nav("/");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function loginGoogle() {
    setError(null);
    setBusy(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      nav("/");
    } catch (err: any) {
      setError(err?.message || "Google login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 backdrop-blur">
        <div className="mb-5">
          <div className="text-lg font-semibold">Sign in</div>
          <div className="mt-1 text-sm text-muted">
            Track progress from idea → MVP → demo → loop → monetize → scale.
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-text">
            {error}
          </div>
        )}

        <form className="space-y-3" onSubmit={loginEmail}>
          <div>
            <label className="text-sm text-muted">Email</label>
            <input
              className="mt-1 w-full rounded-lg border border-border bg-bg/40 px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-accent/40"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-sm text-muted">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-border bg-bg/40 px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-accent/40"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" disabled={busy} className="w-full">
            Continue
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <div className="text-xs text-muted">or</div>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <Button variant="ghost" disabled={busy} className="w-full" onClick={loginGoogle}>
          Continue with Google
        </Button>

        <div className="mt-4 text-xs text-muted">
          New here?{" "}
          <Link to="/signup" className="underline underline-offset-4">
            Create an account
          </Link>
          <div className="mt-2">
            <Link to="/" className="underline underline-offset-4">
              Go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

