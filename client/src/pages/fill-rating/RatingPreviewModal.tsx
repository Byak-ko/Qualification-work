import Button from "../../components/ui/Button";
import { XMarkIcon, DocumentCheckIcon, StarIcon, ExclamationTriangleIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { RatingItem } from "../../types/Rating";

type Props = {
  items: RatingItem[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export default function RatingPreviewModal({
  items,
  submitting,
  onClose,
  onSubmit
}: Props) {
  const getFileNameFromUrl = (url: string) => {
    try {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1];
    } catch (e) {
      return 'Документ';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in relative">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 pb-8">
          <div className="flex items-center">
            <DocumentCheckIcon className="w-8 h-8 mr-3" />
            <h2 className="text-2xl font-bold flex-grow">Попередній перегляд</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors rounded-full p-1 hover:bg-white/20"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="text-white/80 mt-2">Перевірте введені дані перед надсиланням:</p>
        </div>
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
          {items.map((item) => {
            const hasAnyDocuments = 
              (item.documents && item.documents.length > 0) || 
              (item.documentUrls && item.documentUrls.length > 0);
            
            const isDocumentsMissing = item.isDocNeed && item.score > 0 && !hasAnyDocuments;
            
            return (
              <div
                key={item.id}
                className="bg-indigo-50 border-2 border-indigo-100 rounded-xl p-4
                          hover:bg-indigo-100 transition-colors group"
              >
                <div className="flex items-center mb-2">
                  <StarIcon className="w-6 h-6 text-indigo-500 mr-2" />
                  <h3 className="text-lg font-bold text-gray-800 flex-grow">{item.name}</h3>
                  <div className="bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full text-sm font-semibold">
                    {item.score}
                  </div>
                </div>
              
                {item.documentUrls && item.documentUrls.length > 0 && (
                  <div className="mt-2">
                    <p className="text-gray-600 flex items-center">
                      <DocumentTextIcon className="w-5 h-5 mr-2 text-green-500" />
                      Завантажені раніше документи:{" "}
                      <span className="ml-2 text-gray-700 font-medium">
                        {item.documentUrls.map(url => getFileNameFromUrl(url)).join(", ")}
                      </span>
                    </p>
                  </div>
                )}
                
                {item.documents && item.documents.length > 0 && (
                  <div className="mt-2">
                    <p className="text-gray-600 flex items-center">
                      <DocumentCheckIcon className="w-5 h-5 mr-2 text-indigo-500" />
                      Нові документи:{" "}
                      <span className="ml-2 text-gray-700 font-medium">
                        {item.documents.map(file => file.name).join(", ")}
                      </span>
                    </p>
                  </div>
                )}
                
                {!hasAnyDocuments && (
                  <div className="mt-2">
                    <p className="text-gray-600 flex items-center">
                      <DocumentCheckIcon className="w-5 h-5 mr-2 text-indigo-500" />
                      Документи: <span className="ml-2 text-gray-700 font-medium">немає</span>
                    </p>
                  </div>
                )}
                
                {isDocumentsMissing && (
                  <div className="mt-2">
                    <p className="text-red-500 flex items-center">
                      <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                      Потрібні документи
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end gap-3">
          <Button
            onClick={onSubmit}
            disabled={submitting}
            className="bg-indigo-600 text-white hover:bg-indigo-700
                      disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Надсилання..." : "Надіслати"}
          </Button>
          <Button
            onClick={onClose}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Назад
          </Button>
        </div>
      </div>
    </div>
  );
}