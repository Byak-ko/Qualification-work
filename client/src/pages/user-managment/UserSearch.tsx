import { MagnifyingGlassIcon, AcademicCapIcon, BuildingOfficeIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

interface UserSearchProps {
  search: {
    name?: string;
    departmentName?: string;
    unitName?: string;
  };
  onChange: (search: { name?: string; departmentName?: string; unitName?: string }) => void;
  onClear: () => void;
}

export default function UserSearch({ search, onChange, onClear }: UserSearchProps) {
  const handleInputChange = (field: keyof typeof search, value: string) => {
    onChange({ ...search, [field]: value || undefined });
  };

  const isFilterActive = search.name || search.departmentName || search.unitName;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Input
            icon={<MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />}
            type="text"
            placeholder="Пошук за ім'ям..."
            value={search.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 w-full"
            aria-label="Пошук за ім'ям користувача"
          />
        </div>

        <div>
          <Input
            icon={<AcademicCapIcon className="w-5 h-5 text-gray-400" />}
            type="text"
            placeholder="Пошук за кафедрою..."
            value={search.departmentName || ""}
            onChange={(e) => handleInputChange("departmentName", e.target.value)}
            className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 w-full"
            aria-label="Пошук за назвою кафедри"
          />
        </div>

        <div>
          <Input
            icon={<BuildingOfficeIcon className="w-5 h-5 text-gray-400" />}
            type="text"
            placeholder="Пошук за підрозділом..."
            value={search.unitName || ""}
            onChange={(e) => handleInputChange("unitName", e.target.value)}
            className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 w-full"
            aria-label="Пошук за назвою підрозділу"
          />
        </div>
      </div>

      {isFilterActive && (
        <Button
          variant="secondary"
          size="sm"
          icon={<XMarkIcon className="w-5 h-5" />}
          className="text-blue-600 hover:text-blue-800 bg-transparent border-none text-sm"
          onClick={onClear}
          aria-label="Очистити фільтри"
        >
          Очистити фільтри
        </Button>
      )}
    </div>
  );
}