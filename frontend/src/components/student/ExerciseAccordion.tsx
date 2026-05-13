type Exercise = {
  id: number;
  title: string;
  text: string;
  label: string;
  task: string;
};

type Props = {
  exercises: Exercise[];
  openedExercise: number | null;
  setOpenedExercise: (id: number | null) => void;
};

const ExerciseAccordion = ({
  exercises,
  openedExercise,
  setOpenedExercise,
}: Props) => {
  return (
    <div className="student-exercise-list">
      {exercises.map((exercise) => (
        <div className="student-exercise-item" key={exercise.id}>
          <button
            className="student-exercise-header"
            onClick={() =>
              setOpenedExercise(
                openedExercise === exercise.id ? null : exercise.id
              )
            }
          >
            {exercise.title}

            <span>
              {openedExercise === exercise.id ? "⌄" : "+"}
            </span>
          </button>

          {openedExercise === exercise.id && (
            <div className="student-exercise-body">
              <p>{exercise.text}</p>

              <div className="student-exercise-task">
                <strong>{exercise.label}</strong>

                <p>{exercise.task}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ExerciseAccordion;