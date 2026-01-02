import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../lib/firebase_config";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";

export function SignupPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) nav("/");
  }, [user, nav]);

  async function signup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      nav("/");
    } catch (err: any) {
      setError(err?.message || "Signup failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 backdrop-blur">
        <div className="mb-5">
          <div className="text-lg font-semibold">Create account</div>
          <div className="mt-1 text-sm text-muted">Same tracker, multiple projects, one login.</div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-text">
            {error}
          </div>
        )}

        <form className="space-y-3" onSubmit={signup}>
          <div>
            <label className="text-sm text-muted">Name (optional)</label>
            <input
              className="mt-1 w-full rounded-lg border border-border bg-bg/40 px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-accent/40"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Urbano"
              autoComplete="name"
            />
          </div>
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
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" disabled={busy} className="w-full">
            Create account
          </Button>
        </form>

        <div className="mt-4 text-xs text-muted">
          Already have an account?{" "}
          <Link to="/login" className="underline underline-offset-4">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

