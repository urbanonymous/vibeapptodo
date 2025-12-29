import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Spinner } from "../ui/Spinner";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

