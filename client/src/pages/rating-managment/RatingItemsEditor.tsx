import { TrashIcon, PlusIcon, DocumentDuplicateIcon, ChatBubbleLeftIcon, DocumentIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import Input from "../../components/ui/Input";
import { RatingItem } from "../../types/Rating";

export type Item = Omit<RatingItem, "id" | "score" | "documents"> & {
  isDocNeed?: boolean;
};

interface Props {
  items: Item[];
  onChange: (index: number, field: string, value: string | number | boolean) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export default function RatingItemsEditor({ items, onChange, onAdd, onRemove }: Props) {
  const [expandedItems, setExpandedItems] = useState<boolean[]>(items.map(() => true));

  const toggleItem = (index: number) => {
    setExpandedItems((prev) => {
      const newExpanded = [...prev];
      newExpanded[index] = !newExpanded[index];
      return newExpanded;
    });
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Критерії оцінювання
      </label>
      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-all"
            role="region"
            aria-labelledby={`item-header-${index}`}
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleItem(index)}
              id={`item-header-${index}`}
            >
              <h3 className="text-base font-medium text-gray-900">
                {item.name || `Критерій ${index + 1}`}
              </h3>
              <ChevronDownIcon
                className={`h-5 w-5 text-gray-500 transform transition-transform ${expandedItems[index] ? "rotate-180" : ""}`}
              />
            </div>

            {expandedItems[index] && (
              <div className="mt-3 space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <Input
                      placeholder="Назва пункту (макс. 100 символів)"
                      icon={<DocumentDuplicateIcon className="w-5 h-5 text-blue-500" />}
                      value={item.name}
                      onChange={(e) => onChange(index, "name", e.target.value.slice(0, 100))}
                      className="w-full"
                      label="Назва критерію"
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-1">
                    <Input
                      type="number"
                      placeholder="Макс. бал"
                      value={item.maxScore}
                      min={1}
                      max={100}
                      onChange={(e) => onChange(index, "maxScore", Number(e.target.value))}
                      className="w-full"
                      label="Макс. бал"
                    />
                  </div>
                </div>

                <div className="space-y-1 relative">
                  <label className="block text-sm font-medium text-gray-700">
                    Коментар
                  </label>
                  <div className="relative">
                    <TextareaAutosize
                      placeholder="Пояснення за що нараховуються бали (макс. 500 символів)"
                      value={item.comment || ""}
                      onChange={(e) => onChange(index, "comment", e.target.value.slice(0, 500))}
                      className="w-full p-3 pl-10 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 resize-none min-h-[80px] text-sm"
                      maxLength={500}
                    />
                    <ChatBubbleLeftIcon className="w-5 h-5 text-green-500 absolute left-3 top-3" />
                  </div>
                  <p className="text-xs text-gray-500 text-right">
                    {item.comment?.length || 0}/500
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`isDocNeed-${index}`}
                    checked={item.isDocNeed || false}
                    onChange={(e) => onChange(index, "isDocNeed", e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label="Потрібно прикріпити документ"
                  />
                  <label
                    htmlFor={`isDocNeed-${index}`}
                    className="ml-2 block text-sm text-gray-700 flex items-center"
                  >
                    <DocumentIcon className="w-5 h-5 text-blue-500 mr-1" />
                    Потрібно прикріпити документ
                  </label>
                </div>

                {items.length > 1 && (
                  <button
                    onClick={() => onRemove(index)}
                    className="text-red-500 hover:text-red-700 transition duration-200 flex items-center gap-1 text-sm mt-2"
                    aria-label="Видалити критерій"
                  >
                    <TrashIcon className="h-5 w-5" />
                    Видалити
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onAdd}
        className="mt-4 w-full flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 py-2 rounded-lg transition duration-200 border border-blue-100"
        aria-label="Додати новий критерій"
      >
        <PlusIcon className="h-5 w-5" />
        <span>Додати пункт</span>
      </button>
    </div>
  );
}