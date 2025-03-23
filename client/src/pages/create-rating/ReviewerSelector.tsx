import { useState, useEffect } from "react";
import { User } from "../../types/User";

type Props = {
  allUsers: User[];
  currentUser: User;
  selectedReviewerIds: number[];
  setSelectedReviewerIds: React.Dispatch<React.SetStateAction<number[]>>;
  respondent: number;
};

export default function ReviewerSelector({
  allUsers,
  currentUser,
  selectedReviewerIds,
  setSelectedReviewerIds,
  respondent
}: Props) {
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  useEffect(() => {
    const updatedFilteredUsers = allUsers.filter(
      (user) =>
        user.id !== currentUser.id &&
        user.id !== respondent
    );
    setFilteredUsers(updatedFilteredUsers);
  }, [allUsers, currentUser.id, respondent]);

  const toggleReviewer = (id: number) => {
    setSelectedReviewerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        placeholder="Пошук рецензентів..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-3 py-2 border rounded-md shadow-sm bg-white text-gray-800"
      />

      <div className="space-y-1 max-h-64 overflow-y-auto">
        {filteredUsers
          .filter((user) =>
            `${user.firstName} ${user.lastName}`
              .toLowerCase()
              .includes(search.toLowerCase())
          )
          .map((user) => {
            const fullName = `${user.lastName} ${user.firstName}`;
            const isSelected = selectedReviewerIds.includes(user.id);

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => toggleReviewer(user.id)}
                className={`w-full text-left px-4 py-2 rounded-md border flex items-center justify-between transition-all
                  ${
                    isSelected
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-white hover:bg-gray-100 text-gray-800"
                  }
                `}
              >
                <div>
                  <div className="font-semibold">{fullName}</div>
                  {user.department?.name && (
                    <div className="text-sm text-gray-600">
                      {user.department.name}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}
