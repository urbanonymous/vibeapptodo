import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { AuthGate } from "./components/auth/AuthGate";
import { LoginPage } from "./pages/Login";
import { SignupPage } from "./pages/Signup";
import { DashboardPage } from "./pages/Dashboard";
import { ProjectPage } from "./pages/Project";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/"
          element={
            <AuthGate>
              <DashboardPage />
            </AuthGate>
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            <AuthGate>
              <ProjectPage />
            </AuthGate>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

