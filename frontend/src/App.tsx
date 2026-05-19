import { useState } from "react";
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
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
          <p style={{ color: "#6b7280", fontSize: 14 }}>Nalagam...</p>
        </div>
      </div>
    );
  }

  // Ni prijavljen - prikaži auth stran (prijava/registracija)
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Prijavljen kot STUDENT brez learning_type - kviz
  if (profile?.role === "STUDENT" && !profile?.learning_type) {
    return <QuizWrapper />;
  }

  // Prijavljen kot PROFESSOR - profesor dashboard
  if (profile?.role === "PROFESSOR") {
    return <ProfessorDashboard />;
  }

  // Prijavljen kot STUDENT z learning_type - student dashboard
  return <StudentDashboard />;
}

function QuizWrapper() {
  const { token } = useAuth();
  const [savedType, setSavedType] = useState<LearningType | null>(null);

  const typeLabels: Record<LearningType, string> = {
    visual: "👁️ Vizualni učni tip",
    auditory: "🎧 Slušni učni tip",
    kinesthetic: "🤲 Kinestetični učni tip",
  };

  async function handleQuizComplete(learningType: LearningType) {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/learning-type`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ learningType }),
      });

      const data = await res.json();
      console.log("Response status:", res.status);
      console.log("Response data:", data);

      if (res.ok) {
        setSavedType(learningType);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        console.error("Napaka:", data);
        alert(`Napaka pri shranjevanju: ${data.message}`);
      }
    } catch (err) {
      console.error("Napaka pri shranjevanju učnega tipa:", err);
      alert("Strežnik ni dosegljiv");
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
          {typeLabels[savedType]} — shranjeno ✓
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