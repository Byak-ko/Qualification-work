import Button from "../../components/ui/Button";

type Props = {
  items: {
    id: number;
    name: string;
    score: number;
    maxScore: number;
    documents: File[];
  }[];
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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative animate-fade-in">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Попередній перегляд</h2>
        <p className="mb-6 text-gray-600 text-base">Перевірте введені дані перед надсиланням:</p>

        <div className="space-y-5 max-h-96 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.id} className="border rounded-lg px-4 py-3 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
              <p className="text-gray-700 mt-1">
                Бал: <span className="font-medium">{item.score}</span> / {item.maxScore}
              </p>
              <p className="text-gray-700 mt-1">
                Документи:{" "}
                <span className="text-gray-600">
                  {item.documents.length > 0
                    ? item.documents.map((f) => f.name).join(", ")
                    : "немає"}
                </span>
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={onClose} type="button">
            Назад
          </Button>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? "Надсилання..." : "Надіслати"}
          </Button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-gray-400 hover:text-gray-600 text-2xl font-bold"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
