import Input from "../../components/ui/Input";
import { TrashIcon, DocumentPlusIcon, StarIcon, InformationCircleIcon, ExclamationCircleIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { RatingItem } from "../../types/Rating";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";

const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
const maxSize = 5 * 1024 * 1024;

type Props = {
  item: RatingItem;
  index: number;
  onScoreChange: (index: number, score: number) => void;
  onFileChange: (index: number, files: FileList | null) => void;
  onFileRemove: (itemIndex: number, fileIndex: number) => void;
  onDocumentUrlRemove: (itemIndex: number, urlIndex: number) => void;
  reviewerComments?: Record<number, string>;
};

export default function RatingItemBlock({
  item,
  index,
  onScoreChange,
  onFileChange,
  onFileRemove,
  onDocumentUrlRemove,
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

  const getFileNameFromUrl = (url: string) => {
    try {
      const urlParts = url.split('/');
      let fileName = urlParts[urlParts.length - 1];
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/;
      fileName = fileName.replace(uuidRegex, '');
      return fileName || 'Документ';
    } catch (e) {
      return 'Документ';
    }
  };

  return (
    <div className="relative bg-white border-2 border-indigo-200 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-400 ease-in-out transform hover:-translate-y-2 group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white opacity-50 rounded-3xl pointer-events-none -z-10"></div>

      <div className="flex justify-between items-start mb-4 pb-3 border-b-2 border-dashed border-indigo-200">
        <h2 className="text-2xl font-bold text-gray-800 pr-4 flex-grow break-words overflow-wrap-break-word max-w-[75%]">
          {item.name}
        </h2>
        <div className="bg-indigo-100 text-indigo-800 font-bold rounded-full min-w-[44px] h-10 flex items-center justify-center space-x-1 shadow-md group-hover:bg-indigo-200 transition-colors flex-shrink-0 ml-2 p-1">
          <StarIcon className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span className="text-sm leading-none">{item.score}</span>
        </div>
      </div>

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

      {item.documentUrls && item.documentUrls.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2 text-green-500" />
            Завантажені раніше документи:
          </h3>
          <ul className="space-y-2">
            {item.documentUrls.map((url, idx) => (
              <li
                key={`prev-${idx}`}
                className="flex items-center justify-between
                  text-sm bg-green-50 rounded-lg px-4 py-2
                  hover:bg-green-100 transition-colors
                  shadow-sm hover:shadow-md"
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[70%]"
                >
                  {getFileNameFromUrl(url)}
                </a>
                <Button
                  variant="icon-danger"
                  size="sm"
                  icon={<TrashIcon className="w-5 h-5" />}
                  onClick={() => onDocumentUrlRemove(index, idx)}
                  className="p-1 rounded-full"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.documents?.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <DocumentPlusIcon className="w-5 h-5 mr-2 text-indigo-500" />
            Нові документи:
          </h3>
          <ul className="space-y-2">
            {item.documents.map((file, fileIdx) => (
              <li
                key={fileIdx}
                className="flex items-center justify-between
                  text-sm bg-indigo-50 rounded-lg px-4 py-2
                  hover:bg-indigo-100 transition-colors
                  shadow-sm hover:shadow-md"
              >
                <span className="text-gray-700 truncate max-w-[70%]">{file.name}</span>
                <Button
                  variant="icon-danger"
                  size="sm"
                  icon={<TrashIcon className="w-5 h-5" />}
                  onClick={() => onFileRemove(index, fileIdx)}
                  className="p-1 rounded-full"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.isDocNeed && item.score > 0 && item.documents.length === 0 && (!item.documentUrls || item.documentUrls.length === 0) && (
        <div className="mt-2 text-red-500 text-sm flex items-start">
          <InformationCircleIcon className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
          <span>Необхідно завантажити підтверджуючі документи</span>
        </div>
      )}
    </div>
  );
}