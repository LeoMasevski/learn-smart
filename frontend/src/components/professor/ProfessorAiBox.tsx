import { Sparkles } from "lucide-react";

type Props = {
  onGenerate: () => void;
};

const ProfessorAiBox = ({ onGenerate }: Props) => {
  return (
    <div className="professor-ai-box">
      <span className="inline-flex items-center gap-2">
        <Sparkles className="w-4 h-4" strokeWidth={2.25} />
        AI pomočnik
      </span>
      <h3>Generiranje učne vsebine</h3>
      <button onClick={onGenerate}>Generiraj vsebino</button>
    </div>
  );
};

export default ProfessorAiBox;
