import { TrashIcon, PlusIcon, DocumentDuplicateIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import Input from "../../components/ui/Input";
import { RatingItem } from "../../types/Rating";

export type Item = Omit<RatingItem, "id" | "score" | "documents">;

interface Props {
  items: Item[];
  onChange: (index: number, field: string, value: string | number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export default function RatingItemsEditor({ items, onChange, onAdd, onRemove }: Props) {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Критерії оцінювання
      </label>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-grow space-y-1">
                <Input
                  placeholder="Назва пункту"
                  icon={<DocumentDuplicateIcon className="w-5 h-5 text-blue-500" />}
                  value={item.name}
                  onChange={(e) => onChange(index, "name", e.target.value)}
                  className="w-full"
                  label="Назва критерію"
                />
              </div>
              <div className="w-28 space-y-1">
                <Input
                  type="number"
                  placeholder="Макс. бал"
                  value={item.maxScore}
                  min={1}
                  onChange={(e) => onChange(index, "maxScore", Number(e.target.value))}
                  className="w-full"
                  label="Макс. бал"
                />
              </div>
              {items.length > 1 && (
                <button
                  onClick={() => onRemove(index)}
                  className="text-red-500 hover:text-red-700 transition duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 self-end mt-6"
                  aria-label="Видалити критерій"
                >
                  <TrashIcon className="h-6 w-6" />
                </button>
              )}
            </div>
            <div className="w-full space-y-1">
              <Input
                placeholder="Пояснення за що нараховуються бали"
                icon={<ChatBubbleLeftIcon className="w-5 h-5 text-green-500" />}
                value={item.comment || ""}
                onChange={(e) => onChange(index, "comment", e.target.value)}
                className="w-full"
                label="Коментар"
              />
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={onAdd}
        className="mt-4 w-full flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 py-2 rounded-lg transition duration-200 border border-blue-100"
      >
        <PlusIcon className="h-5 w-5" />
        <span>Додати пункт</span>
      </button>
    </div>
  );
}