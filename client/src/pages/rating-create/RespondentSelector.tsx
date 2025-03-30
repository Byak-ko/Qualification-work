import { useState, useEffect } from "react";
import { User } from "../../types/User";
import Input from "../../components/ui/Input";
import { MagnifyingGlassIcon, UserIcon, CheckIcon } from '@heroicons/react/24/outline';

type Props = {
  users: User[];
  selectedRespondentIds: number[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelect: (userId: number) => void;
};

export default function RespondentSelector({
  users,
  selectedRespondentIds,
  searchQuery,
  onSearchChange,
  onSelect,
}: Props) {
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    const filtered = users.filter((user) =>
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchQuery]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          label="Оберіть респондентів"
          icon={<MagnifyingGlassIcon className="w-5 h-5 text-blue-500" />}
          type="text"
          placeholder="Введіть ім'я або прізвище..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50 shadow-inner">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => {
            const fullName = `${user.lastName} ${user.firstName}`;
            const isSelected = selectedRespondentIds.includes(user.id);
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => onSelect(user.id)}
                className={`w-full text-left px-4 py-2 rounded-lg flex items-center justify-between transition-all group
                  ${isSelected 
                    ? "bg-blue-500 text-white hover:bg-blue-600" 
                    : "bg-white hover:bg-gray-100 text-gray-800 border border-transparent hover:border-gray-200"
                  } focus:outline-none focus:ring-2 focus:ring-blue-300
                `}
              >
                <div className="flex items-center space-x-3">
                  <UserIcon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                  <div>
                    <div className="font-semibold">{fullName}</div>
                    {user.department?.name && (
                      <div className={`text-sm ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>
                        {user.department.name}
                      </div>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <CheckIcon className="w-6 h-6 text-white" />
                )}
              </button>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <MagnifyingGlassIcon className="w-10 h-10 text-gray-300" />
            <p className="text-sm text-gray-500">Нічого не знайдено</p>
          </div>
        )}
      </div>
    </div>
  );
};