type Props = {
  onGenerate: () => void;
};

const ProfessorAiBox = ({ onGenerate }: Props) => {
  return (
    <div className="professor-ai-box">
      <span>✨ AI pomočnik</span>
      <h3>Generiranje učne vsebine</h3>
      <button onClick={onGenerate}>Generiraj vsebino</button>
    </div>
  );
};

export default ProfessorAiBox;