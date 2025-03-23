import Input from "../../components/ui/Input";
import DeleteIcon from "../../components/ui/icons/DeleteIcon";

type Props = {
  item: {
    id: number;
    name: string;
    score: number;
    maxScore: number;
    documents: File[];
  };
  index: number;
  onScoreChange: (index: number, score: number) => void;
  onFileChange: (index: number, files: FileList | null) => void;
  onFileRemove: (itemIndex: number, fileIndex: number) => void;
};

export default function RatingItemBlock({
  item,
  index,
  onScoreChange,
  onFileChange,
  onFileRemove
}: Props) {
  return (
    <div className="bg-white border border-indigo-100 rounded-2xl p-6 shadow-md hover:shadow-lg transition duration-300 relative overflow-hidden">
      <div className="absolute inset-0 rounded-2xl pointer-events-none border border-indigo-300 opacity-10"></div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 border-dashed border-gray-300">
        {item.name}
      </h2>

      <div className="mb-5">
        <label className="block text-base font-medium text-gray-700 mb-2">
          Бал (0 - {item.maxScore})
        </label>
        <Input
          type="number"
          min={0}
          max={item.maxScore}
          value={item.score}
          onChange={(e) => onScoreChange(index, Number(e.target.value))}
          placeholder={`Введіть бал`}
        />
      </div>

      <div className="mb-2">
        <label className="block text-base font-medium text-gray-700 mb-2">
          Документи
        </label>
        <input
          type="file"
          multiple
          onChange={(e) => onFileChange(index, e.target.files)}
          className="block w-full text-base text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-base file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition"
        />
      </div>

      {item.documents?.length > 0 && (
        <ul className="mt-2 space-y-1">
          {item.documents.map((file, fileIdx) => (
            <li
              key={fileIdx}
              className="flex items-center justify-between text-sm bg-gray-100 rounded-md px-3 py-1"
            >
              <span className="text-gray-700 truncate">{file.name}</span>
              <button
                onClick={() => onFileRemove(index, fileIdx)}
                className="ml-3 text-red-500 hover:text-red-700 text-xs font-medium transition"
              >
                <DeleteIcon />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
