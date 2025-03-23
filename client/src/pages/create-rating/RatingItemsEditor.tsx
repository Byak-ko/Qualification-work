import { TrashIcon } from "@heroicons/react/24/outline";
import Input from "../../components/ui/Input";

interface Item {
  name: string;
  maxScore: number;
}

interface Props {
  items: Item[];
  onChange: (index: number, field: string, value: string | number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export default function RatingItemsEditor({ items, onChange, onAdd, onRemove }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Критерії оцінювання
      </label>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
          >
            <Input
              placeholder="Назва пункту"
              value={item.name}
              onChange={(e) => onChange(index, "name", e.target.value)}
            />
            <Input
              type="number"
              placeholder="Макс. бал"
              value={item.maxScore}
              min={1}
              onChange={(e) => onChange(index, "maxScore", e.target.value)}
              className="w-24"
              fullWidth={false}
            />
            {items.length > 1 && (
              <button
                onClick={() => onRemove(index)}
                className="text-red-500 hover:text-red-700 transition duration-200"
              >
                <TrashIcon />
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={onAdd}
        className="mt-3 text-blue-600 hover:text-blue-800 transition duration-200 flex items-center space-x-1"
      >
        <span>Додати пункт</span>
      </button>
    </div>
  );
}
