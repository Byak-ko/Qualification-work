import Input from "../../components/ui/Input";
import { TrashIcon, DocumentPlusIcon, StarIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { RatingItem } from "../../types/Rating";

type Props = {
  item: RatingItem;
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
    <div className="relative bg-white border-2 border-indigo-200 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-400 ease-in-out transform hover:-translate-y-2 group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white opacity-50 rounded-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-4 right-4 bg-indigo-100 text-indigo-800 font-bold rounded-full w-12 h-12 flex items-center justify-center shadow-md group-hover:bg-indigo-200 transition-colors">
        <StarIcon className="w-6 h-6 text-indigo-600 mr-1" />
        {item.score}
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-4 pb-3 border-b-2 border-dashed border-indigo-200 flex items-center">
        <span className="flex-grow">{item.name}</span>
      </h2>
      
      {item.comment && (
        <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200 flex items-start">
          <InformationCircleIcon className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">{item.comment}</p>
        </div>
      )}
      
      <div className="mb-5">
        <label className="flex items-center text-base font-medium text-gray-700 mb-2">
          <StarIcon className="w-5 h-5 mr-2 text-indigo-500" />
          Бал (0 - {item.maxScore})
        </label>
        <Input
          type="number"
          min={0}
          max={item.maxScore}
          value={item.score}
          onChange={(e) => onScoreChange(index, Number(e.target.value))}
          placeholder={`Введіть бал`}
          className="focus:ring-2 focus:ring-indigo-300 transition-all duration-300"
        />
      </div>
      <div className="mb-2">
        <label className="flex items-center text-base font-medium text-gray-700 mb-2">
          <DocumentPlusIcon className="w-5 h-5 mr-2 text-indigo-500" />
          Документи
        </label>
        <input
          type="file"
          multiple
          onChange={(e) => onFileChange(index, e.target.files)}
          className="block w-full text-base text-gray-700
            file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
            file:text-base file:font-semibold
            file:bg-indigo-100 file:text-indigo-700
            hover:file:bg-indigo-200
            focus:outline-none focus:ring-2 focus:ring-indigo-300
            transition-all duration-300 cursor-pointer"
        />
      </div>
      {item.documents?.length > 0 && (
        <ul className="mt-4 space-y-2">
          {item.documents.map((file, fileIdx) => (
            <li
              key={fileIdx}
              className="flex items-center justify-between
                text-sm bg-indigo-50 rounded-lg px-4 py-2
                hover:bg-indigo-100 transition-colors
                shadow-sm hover:shadow-md"
            >
              <span className="text-gray-700 truncate max-w-[70%]">{file.name}</span>
              <button
                onClick={() => onFileRemove(index, fileIdx)}
                className="ml-3 text-red-500 hover:text-red-700
                  transition-colors duration-300
                  hover:bg-red-100 rounded-full p-1"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}