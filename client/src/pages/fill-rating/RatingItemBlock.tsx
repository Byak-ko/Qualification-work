import Input from "../../components/ui/Input";
import { TrashIcon, DocumentPlusIcon, StarIcon, InformationCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { RatingItem } from "../../types/Rating";
import { toast } from "react-toastify";

const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
const maxSize = 5 * 1024 * 1024; 

type Props = {
  item: RatingItem;
  index: number;
  onScoreChange: (index: number, score: number) => void;
  onFileChange: (index: number, files: FileList | null) => void;
  onFileRemove: (itemIndex: number, fileIndex: number) => void;
  reviewerComments?: Record<number, string>;
};

export default function RatingItemBlock({
  item,
  index,
  onScoreChange,
  onFileChange,
  onFileRemove,
  reviewerComments
}: Props) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles: FileList | null = Array.from(files).every(file => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Файл "${file.name}" має недозволений формат. Дозволені формати: JPEG, PNG, GIF, PDF`);
        return false;
      }
      
      if (file.size > maxSize) {
        toast.error(`Файл "${file.name}" занадто великий. Максимальний розмір: 5MB`);
        return false;
      }
      
      return true;
    }) ? files : null;
    
    if (validFiles) {
      onFileChange(index, validFiles);
    } else {
      e.target.value = '';
    }
  };

  const reviewerComment = reviewerComments ? reviewerComments[item.id] : null;

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

      {reviewerComment && (
        <div className="mb-4 bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start">
          <ExclamationCircleIcon className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800 mb-1">Коментар перевіряючого:</p>
            <p className="text-sm text-amber-800">{reviewerComment}</p>
          </div>
        </div>
      )}
     
      <div className="mb-5">
        <label className="flex items-center text-base font-medium text-gray-700 mb-2">
          <StarIcon className="w-5 h-5 mr-2 text-indigo-500" />
          Бал {item.maxScore > 0 ? `(0 - ${item.maxScore})` : ''}
        </label>
        <Input
          type="number"
          min={0}
          max={item.maxScore > 0 ? item.maxScore : undefined}
          value={item.score}
          onChange={(e) => onScoreChange(index, Number(e.target.value))}
          placeholder={`Введіть бал`}
          className="focus:ring-2 focus:ring-indigo-300 transition-all duration-300"
        />
      </div>
      
      {(item.isDocNeed || item.score > 0) && (
        <div className="mb-2">
          <label className="flex items-center text-base font-medium text-gray-700 mb-2">
            <DocumentPlusIcon className="w-5 h-5 mr-2 text-indigo-500" />
            Документи {item.isDocNeed && <span className="ml-1 text-red-500">*</span>}
          </label>
          <div className="text-xs text-gray-500 mb-2">
            Дозволені формати: JPEG, PNG, GIF, PDF. Максимальний розмір: 5MB
          </div>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="block w-full text-base text-gray-700
              file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
              file:text-base file:font-semibold
              file:bg-indigo-100 file:text-indigo-700
              hover:file:bg-indigo-200
              focus:outline-none focus:ring-2 focus:ring-indigo-300
              transition-all duration-300 cursor-pointer"
          />
        </div>
      )}

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

      {item.isDocNeed && item.score > 0 && item.documents.length === 0 && (
        <div className="mt-2 text-red-500 text-sm flex items-start">
          <InformationCircleIcon className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
          <span>Необхідно завантажити підтверджуючі документи</span>
        </div>
      )}
    </div>
  );
}