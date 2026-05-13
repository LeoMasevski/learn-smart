type Subject = {
  title: string;
  subtitle: string;
  progress: number;
  grade: number;
  color: string;
  icon: string;
};

type Props = {
  subject: Subject;
  onOpen: (subject: Subject) => void;
};

const SubjectCard = ({ subject, onOpen }: Props) => {
  return (
    <div
      className="student-subject-card"
      onClick={() => onOpen(subject)}
    >
      <div
        className="student-subject-top"
        style={{ background: subject.color }}
      >
        <span className="student-card-icon">
          {subject.icon}
        </span>

        <span className="student-card-percent">
          {subject.progress}%
        </span>
      </div>

      <div className="student-subject-body">
        <h3>{subject.title}</h3>

        <p>{subject.subtitle}</p>

        <div className="student-progress-wrapper">
          <div
            className="student-progress-bar"
            style={{ width: `${subject.progress}%` }}
          />
        </div>

        <div className="student-card-bottom">
          <strong>Ocena {subject.grade}</strong>
        </div>

        <button>Odpri predmet</button>
      </div>
    </div>
  );
};

export default SubjectCard;