import { useState } from "react";
import { LearningTypeQuiz } from "./components/quiz/LearningTypeQuiz";
import { LearningType } from "./data/quizQuestions";
import StudentDashboard from "./pages/StudentDashboard";
import ProfessorDashboard from "./pages/ProfessorDashboard";

type Page = "quiz" | "student" | "professor";

function App() {
  const [page, setPage] = useState<Page>("quiz");

  const handleComplete = (learningType: LearningType) => {
    console.log("Določen učni tip:", learningType);
    alert(
      `Učni tip shranjen: ${learningType}\n\n(Tukaj se bo nadaljevala registracija ko bo backend ready)`
    );

    setPage("student");
  };

  return (
    <>
      <div style={{ position: "fixed", top: 12, right: 12, zIndex: 9999 }}>
        <button onClick={() => setPage("quiz")}>Kviz</button>
        <button onClick={() => setPage("student")}>Student</button>
        <button onClick={() => setPage("professor")}>Profesor</button>
      </div>

      {page === "quiz" && <LearningTypeQuiz onComplete={handleComplete} />}
      {page === "student" && <StudentDashboard />}
      {page === "professor" && <ProfessorDashboard />}
    </>
  );
}

export default App;