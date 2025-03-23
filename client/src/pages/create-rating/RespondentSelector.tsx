import { User } from "../../types/User";
import Input from "../../components/ui/Input";

interface Props {
  users: User[];
  respondentId: number | null;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onSelect: (userId: number) => void;
}

export default function RespondentSelector({
  users,
  respondentId,
  onSearchChange,
  searchQuery,
  onSelect,
}: Props) {
  return (
    <div>
      <Input
        label="Оберіть респондента"
        type="text"
        placeholder="Пошук користувачів..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="mt-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
        {users.length > 0 ? (
          users.map((user) => (
            <label
              key={user.id}
              className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              <input
                type="radio"
                checked={respondentId === user.id}
                onChange={() => onSelect(user.id)}
                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <div className="font-semibold text-gray-800">
                  {user.lastName} {user.firstName}
                </div>
                {user.department?.name && (
                  <div className="text-sm text-gray-600">{user.department.name}</div>
                )}
              </div>
            </label>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-2">Нічого не знайдено</p>
        )}
      </div>
    </div>
  );
}
