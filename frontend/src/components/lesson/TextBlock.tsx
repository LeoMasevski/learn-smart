type Props = {
  content: string;
};

export default function TextBlock({ content }: Props) {
  return (
    <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
      {content}
    </p>
  );
}