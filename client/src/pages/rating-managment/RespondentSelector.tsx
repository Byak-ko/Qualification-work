import { useState, useEffect } from "react";
import { User } from "../../types/User";
import Input from "../../components/ui/Input";
import { MagnifyingGlassIcon, UserIcon, CheckIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";

type Props = {
  users: User[];
  selectedRespondentIds: number[];
  onSelect: (userId: number) => void;
  onSelectMultiple: (userIds: number[]) => void;
};

export default function RespondentSelector({
  users,
  selectedRespondentIds,
  onSelect,
  onSelectMultiple,
}: Props) {
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

  const [nameSearch, setNameSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");

  useEffect(() => {
    const uniqueDepartments = Array.from(
      new Set(users.map((user) => user.department?.name).filter(Boolean))
    );
    setDepartments(uniqueDepartments);
  }, [users]);

  useEffect(() => {
    const filtered = users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName} ${user.lastName} ${user.firstName}`.toLowerCase();
      const deptName = user.department?.name?.toLowerCase() || "";
      
      const nameMatches = nameSearch === "" || fullName.includes(nameSearch.toLowerCase());
      const deptMatches = departmentSearch === "" || deptName.includes(departmentSearch.toLowerCase());
      
      return nameMatches && deptMatches;
    });
    
    setFilteredUsers(filtered);
  }, [users, nameSearch, departmentSearch]);

  const handleDepartmentSelect = (departmentName: string) => {
    const departmentUsers = users
      .filter((user) => user.department?.name === departmentName)
      .map((user) => user.id);

    if (selectedDepartments.includes(departmentName)) {
      setSelectedDepartments(selectedDepartments.filter((d) => d !== departmentName));

      const updatedIds = [...selectedRespondentIds];
      departmentUsers.forEach(id => {
        const index = updatedIds.indexOf(id);
        if (index !== -1) {
          updatedIds.splice(index, 1);
        }
      });

      onSelectMultiple(updatedIds);
    } else {
      setSelectedDepartments([...selectedDepartments, departmentName]);

      const newIds = departmentUsers.filter(id => !selectedRespondentIds.includes(id));
      onSelectMultiple([...selectedRespondentIds, ...newIds]);
    }
  };

  const handleUserSelect = (userId: number) => {
    onSelect(userId);
  };

  const getDepartmentStats = (departmentName: string) => {
    const departmentUsers = users.filter(user => user.department?.name === departmentName);
    const selectedUsers = departmentUsers.filter(user => selectedRespondentIds.includes(user.id));

    return {
      total: departmentUsers.length,
      selected: selectedUsers.length
    };
  };

  const filteredDepartments = departments.filter(dept => {
    if (!dept) return false;
    if (departmentSearch === "") return true;
    return dept.toLowerCase().includes(departmentSearch.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Input
            label="Пошук за іменем"
            icon={<UserIcon className="w-5 h-5 text-blue-500" />}
            type="text"
            placeholder="Ім'я або прізвище..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="relative">
          <Input
            label="Пошук за кафедрою"
            icon={<BuildingOfficeIcon className="w-5 h-5 text-blue-500" />}
            type="text"
            placeholder="Назва кафедри..."
            value={departmentSearch}
            onChange={(e) => setDepartmentSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {departments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BuildingOfficeIcon className="w-5 h-5 mr-2 text-blue-600" />
              <h3 className="text-lg font-medium">Кафедри</h3>
            </div>
            <div className="text-sm text-gray-500">
              Обрано: {selectedRespondentIds.length} / {users.length}
            </div>
          </div>

          {filteredDepartments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border border-gray-300 rounded-lg p-3 bg-blue-50 shadow-inner max-h-64 overflow-y-auto">
              {filteredDepartments.map((department) => {
                const isSelected = selectedDepartments.includes(department);
                const stats = getDepartmentStats(department);

                return (
                  <div
                    key={department}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-all
                      ${isSelected ? "bg-blue-100 border-blue-300" : "bg-white border-transparent"}
                      border hover:border-blue-200`}
                    onClick={() => handleDepartmentSelect(department)}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => { }}
                        className="text-blue-600 rounded mr-2"
                      />
                      <label className="text-gray-700 font-semibold">{department}</label>
                    </div>
                    <span className="text-sm text-gray-500">
                      {stats.selected} / {stats.total}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 space-y-2 border border-gray-300 rounded-lg bg-gray-50">
              <BuildingOfficeIcon className="w-10 h-10 text-gray-300" />
              <p className="text-sm text-gray-500">Кафедр не знайдено</p>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <UserIcon className="w-5 h-5 mr-2 text-green-600" />
            <h3 className="text-lg font-medium">Користувачі</h3>
          </div>
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
                  onClick={() => handleUserSelect(user.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center justify-between transition-all group
                    ${isSelected
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-white hover:bg-gray-100 text-gray-800 border border-transparent hover:border-gray-200"
                    } focus:outline-none focus:ring-2 focus:ring-blue-300
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <UserIcon className={`w-6 h-6 ${isSelected ? "text-white" : "text-gray-400"}`} />
                    <div>
                      <div className="font-semibold">{fullName}</div>
                      {user.department?.name && (
                        <div className={`text-sm ${isSelected ? "text-blue-200" : "text-gray-500"}`}>
                          {user.department.name}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && <CheckIcon className="w-6 h-6 text-white" />}
                </button>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-4 space-y-2">
              <MagnifyingGlassIcon className="w-10 h-10 text-gray-300" />
              <p className="text-sm text-gray-500">Користувачів не знайдено</p>
            </div>
          )}
        </div>
      </div>

      {selectedRespondentIds.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium mb-2">Обрані респонденти ({selectedRespondentIds.length}):</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {[...new Set(selectedRespondentIds)].map(id => {
              const user = users.find(u => u.id === id);
              if (!user) return null;
              return (
                <div key={`selected-user-${id}`} className="flex items-center text-sm">
                  <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                  <span className="font-medium">{user.lastName} {user.firstName}</span>
                  <span className="text-gray-500 ml-2">- {user.department?.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}