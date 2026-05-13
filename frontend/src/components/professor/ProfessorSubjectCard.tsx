import type { ProfessorSubject } from "../../pages/ProfessorDashboard";

type Props = {
  subject: ProfessorSubject;
  onOpen: (subject: ProfessorSubject) => void;
};

const ProfessorSubjectCard = ({ subject, onOpen }: Props) => {
  return (
    <div
      className="professor-subject-card"
      onClick={() => onOpen(subject)}
    >
      <div
        className="professor-subject-cover"
        style={{ background: subject.color }}
      >
        <div className="professor-card-icon">📘</div>
      </div>

      <div className="professor-subject-body">
        <h3>{subject.title}</h3>

        <p>{subject.subtitle}</p>

        <div className="professor-mini-stats">
          <span>{subject.students} študentov</span>
          <span>{subject.presentations} prezentacij</span>
          <span>{subject.quizzes} kvizov</span>
        </div>

        <button>Odpri predmet</button>
      </div>
    </div>
  );
};

export default ProfessorSubjectCard;