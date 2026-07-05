import { useState } from "react";
import { api, getApiErrorMessage } from "./api/api";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LearningTypeQuiz } from "./components/quiz/LearningTypeQuiz";
import { LearningType } from "./data/quizQuestions";
import StudentDashboard from "./pages/StudentDashboard";
import ProfessorDashboard from "./pages/ProfessorDashboard";
import AuthPage from "./pages/AuthPage";

function AppRouter() {
  const { isAuthenticated, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f8fc" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>LS</div>
          <p style={{ color: "#6b7280", fontSize: 14 }}>Nalagam...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  if (profile?.role === "STUDENT" && !profile?.learning_type) {
    return <QuizWrapper />;
  }

  if (profile?.role === "PROFESSOR") {
    return <ProfessorDashboard />;
  }

  return <StudentDashboard />;
}

function QuizWrapper() {
  const { refreshProfile } = useAuth();
  const [savedType, setSavedType] = useState<LearningType | null>(null);
  const [error, setError] = useState("");

  const typeLabels: Record<LearningType, string> = {
    visual: "Vizualni učni profil",
    auditory: "Slušni učni profil",
    kinesthetic: "Kinestetični učni profil",
  };

  async function handleQuizComplete(learningType: LearningType) {
    try {
      setError("");
      await api.patch("/users/learning-type", { learningType });
      setSavedType(learningType);
      await refreshProfile();
    } catch (err) {
      setError(getApiErrorMessage(err, "Streznik ni dosegljiv"));
    }
  }

  return (
    <>
      {savedType && (
        <div style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 9999,
          background: "#6C4EE8",
          color: "white",
          padding: "10px 18px",
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          boxShadow: "0 4px 16px rgba(108,78,232,0.35)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          {typeLabels[savedType]} shranjeno
        </div>
      )}
      {error && (
        <div style={{
          position: "fixed",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9999,
          background: "#fef2f2",
          color: "#b91c1c",
          padding: "10px 18px",
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 600,
          border: "1px solid #fecaca",
        }}>
          {error}
        </div>
      )}
      <LearningTypeQuiz onComplete={handleQuizComplete} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
