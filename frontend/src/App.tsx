import { LearningTypeQuiz } from './components/quiz/LearningTypeQuiz';
import { LearningType } from './data/quizQuestions';

function App() {
  const handleComplete = (learningType: LearningType) => {
    // tu pride še api
    console.log('Določen učni tip:', learningType);
    alert(`Učni tip shranjen: ${learningType}\n\n(Tukaj se bo nadaljevala registracija ko bo backend ready)`);
  };

  return <LearningTypeQuiz onComplete={handleComplete} />;
}

export default App;
