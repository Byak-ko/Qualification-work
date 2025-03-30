import { useState, useEffect } from "react";
import { MagnifyingGlassIcon, UserIcon, CheckIcon } from "@heroicons/react/24/outline";
import { User } from "../../types/User";
import Input from "../../components/ui/Input";

type Props = {
  allUsers: User[];
  currentUser: User;
  selectedReviewerIds: number[];
  setSelectedReviewerIds: React.Dispatch<React.SetStateAction<number[]>>;
};

export default function ReviewerSelector({
  allUsers,
  currentUser,
  selectedReviewerIds,
  setSelectedReviewerIds,
}: Props) {
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    const updatedFilteredUsers = allUsers.filter(
      (user) => user.id !== currentUser.id
    );
    setFilteredUsers(updatedFilteredUsers);
  }, [allUsers, currentUser.id]);

  const toggleReviewer = (id: number) => {
    setSelectedReviewerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const displayedUsers = filteredUsers.filter((user) =>
    `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          label="Пошук рецензентів"
          type="text"
          icon={<MagnifyingGlassIcon className="w-5 h-5 text-blue-500" />}
          placeholder="Введіть ім'я або прізвище..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50 shadow-inner">
        {displayedUsers.length > 0 ? (
          displayedUsers.map((user) => {
            const fullName = `${user.lastName} ${user.firstName}`;
            const isSelected = selectedReviewerIds.includes(user.id);
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => toggleReviewer(user.id)}
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
}