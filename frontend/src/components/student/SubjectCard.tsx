import { getSubjectIcon } from "../../utils/subjectIcons";

type Subject = {
  title: string;
  subtitle: string;
  progress: number;
  grade: number;
  color: string;
};

type Props = {
  subject: Subject;
  onOpen: (subject: Subject) => void;
};

const SubjectCard = ({ subject, onOpen }: Props) => {
  const SubjectIcon = getSubjectIcon(subject.title);

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
          <SubjectIcon className="w-6 h-6 text-white" strokeWidth={2.25} />
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