type PresentationItem = {
  title: string;
  file: string;
  size: string;
};

type Props = {
  item: PresentationItem;
};

const PresentationCard = ({ item }: Props) => {
  return (
    <div className="student-resource-row purple">
      <span>PDF</span>

      <div>
        <h3>{item.title}</h3>

        <p>
          {item.file} · {item.size}
        </p>
      </div>

      <button onClick={() => alert(`Prenos datoteke: ${item.file}`)}>
        Prenesi
      </button>
    </div>
  );
};

export default PresentationCard;