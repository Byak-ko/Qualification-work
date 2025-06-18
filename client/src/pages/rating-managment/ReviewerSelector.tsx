import { useState, useEffect } from "react";
import { MagnifyingGlassIcon, UserIcon, CheckIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { Position, User } from "../../types/User";
import Input from "../../components/ui/Input";
import { getFilteredUsers } from "../../services/api/userService";

type Props = {
  allUsers: User[];
  currentUser: User;
  selectedDepartmentReviewerIds: number[];
  setDepartmentReviewerIds: React.Dispatch<React.SetStateAction<number[]>>;
  selectedUnitReviewerIds: number[];
  setUnitReviewerIds: React.Dispatch<React.SetStateAction<number[]>>;
  selectedRespondentIds: number[];
};

export default function ReviewerSelector({
  allUsers,
  currentUser,
  selectedDepartmentReviewerIds,
  setDepartmentReviewerIds,
  selectedUnitReviewerIds,
  setUnitReviewerIds,
  selectedRespondentIds,
}: Props) {
  const [nameSearch, setNameSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [unitSearch, setUnitSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [eligibleDepartments, setEligibleDepartments] = useState<Set<string>>(new Set());
  const [eligibleUnits, setEligibleUnits] = useState<Set<string>>(new Set());

  const [selectedDepartmentMap, setSelectedDepartmentMap] = useState<Map<string, number>>(new Map());
  const [selectedUnitMap, setSelectedUnitMap] = useState<Map<string, number>>(new Map());

  const [departmentUsers, setDepartmentUsers] = useState<User[]>([]);
  const [unitUsers, setUnitUsers] = useState<User[]>([]);

  const [prevRespondentIds, setPrevRespondentIds] = useState<number[]>([]);

  useEffect(() => {
    if (prevRespondentIds.length === 0 && selectedRespondentIds.length > 0) {
      setPrevRespondentIds(selectedRespondentIds);
      return;
    }

    const removedIds = prevRespondentIds.filter(id => !selectedRespondentIds.includes(id));

    if (removedIds.length > 0) {
      const removedDepartments = new Set<string>();
      const removedUnits = new Set<string>();

      removedIds.forEach(id => {
        const removedUser = allUsers.find(user => user.id === id);
        if (removedUser) {
          if (removedUser.department?.name) {
            removedDepartments.add(removedUser.department.name);
          }
          if (removedUser.department?.unit.name) {
            removedUnits.add(removedUser.department.unit.name);
          }
        }
      });

      const currentDepartments = new Set<string>();
      const currentUnits = new Set<string>();

      selectedRespondentIds.forEach(id => {
        const user = allUsers.find(user => user.id === id);
        if (user) {
          if (user.department?.name) {
            currentDepartments.add(user.department.name);
          }
          if (user.department?.unit.name) {
            currentUnits.add(user.department.unit.name);
          }
        }
      });

      if (removedDepartments.size > 0) {
        setDepartmentReviewerIds(prevIds => {
          const newIds = prevIds.filter(id => {
            const reviewer = allUsers.find(user => user.id === id);
            return reviewer && reviewer.department?.name && currentDepartments.has(reviewer.department.name);
          });
          return prevIds.length === newIds.length && prevIds.every(id => newIds.includes(id))
            ? prevIds
            : newIds;
        });
      }

      if (removedUnits.size > 0) {
        setUnitReviewerIds(prevIds => {
          const newIds = prevIds.filter(id => {
            const reviewer = allUsers.find(user => user.id === id);
            return reviewer && reviewer.department?.unit.name && currentUnits.has(reviewer.department.unit.name);
          });
          return prevIds.length === newIds.length && prevIds.every(id => newIds.includes(id))
            ? prevIds
            : newIds;
        });
      }
    }

    if (prevRespondentIds.length !== selectedRespondentIds.length ||
      prevRespondentIds.some((id, index) => id !== selectedRespondentIds[index])) {
      setPrevRespondentIds(selectedRespondentIds);
    }
  }, [selectedRespondentIds, prevRespondentIds, allUsers]);

  useEffect(() => {
    setEligibleDepartments(new Set());
    setEligibleUnits(new Set());

    if (selectedRespondentIds.length === 0) return;

    const departments = new Set<string>();
    const units = new Set<string>();

    selectedRespondentIds.forEach(id => {
      const respondent = allUsers.find(user => user.id === id);
      if (respondent) {
        if (respondent.department?.name) {
          departments.add(respondent.department.name);
        }
        if (respondent.department?.unit.name) {
          units.add(respondent.department.unit.name);
        }
      }
    });

    setEligibleDepartments(departments);
    setEligibleUnits(units);
  }, [selectedRespondentIds, allUsers]);

  useEffect(() => {
    const fetchFilteredUsers = async () => {
      if (selectedRespondentIds.length === 0) return;

      setIsLoading(true);
      try {
        const filters: { name?: string; departmentName?: string; unitName?: string } = {};

        if (nameSearch) filters.name = nameSearch;
        if (departmentSearch) filters.departmentName = departmentSearch;
        if (unitSearch) filters.unitName = unitSearch;

        const data = await getFilteredUsers(filters);
        const usersExcludingCurrentAndAdmins = data.filter((user: User) => {
          return (
            user.id !== currentUser.id &&
            user.position !== Position.ADMIN
          );
        });

        const deptUsers: User[] = [];
        const unitUsersList: User[] = [];

        usersExcludingCurrentAndAdmins.forEach((user: User) => {
          let addToDepartments = false;
          let addToUnits = false;

          if (user.department?.name && eligibleDepartments.has(user.department.name)) {
            addToDepartments = true;
          }

          if (user.department?.unit.name && eligibleUnits.has(user.department.unit.name)) {
            addToUnits = true;
          }

          if (addToDepartments) {
            deptUsers.push(user);
          }

          if (addToUnits) {
            unitUsersList.push(user);
          }
        });

        setDepartmentUsers(deptUsers);
        setUnitUsers(unitUsersList);
      } catch (error) {
        console.error("Помилка при отриманні користувачів:", error);
        setDepartmentUsers([]);
        setUnitUsers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredUsers();
  }, [nameSearch, departmentSearch, unitSearch, eligibleDepartments, eligibleUnits, currentUser.id, selectedRespondentIds]);

  useEffect(() => {
    const deptMap = new Map<string, number>();
    const unitMap = new Map<string, number>();

    selectedDepartmentReviewerIds.forEach(id => {
      const reviewer = allUsers.find(user => user.id === id);
      if (reviewer?.department?.name && eligibleDepartments.has(reviewer.department.name)) {
        deptMap.set(reviewer.department.name, reviewer.id);
      }
    });

    selectedUnitReviewerIds.forEach(id => {
      const reviewer = allUsers.find(user => user.id === id);
      if (reviewer?.department?.unit.name && eligibleUnits.has(reviewer.department.unit.name)) {
        unitMap.set(reviewer.department.unit.name, reviewer.id);
      }
    });

    setSelectedDepartmentMap(deptMap);
    setSelectedUnitMap(unitMap);
  }, [selectedDepartmentReviewerIds, selectedUnitReviewerIds, allUsers, eligibleDepartments, eligibleUnits]);

  const toggleDepartmentReviewer = (user: User) => {
    const isDepartmentSelected = selectedDepartmentReviewerIds.includes(user.id);

    if (isDepartmentSelected) {
      setDepartmentReviewerIds(prev => prev.filter(id => id !== user.id));
    } else {
      const departmentName = user.department?.name;
      if (departmentName && !selectedDepartmentMap.has(departmentName)) {
        setDepartmentReviewerIds(prev => [...prev, user.id]);
      }
    }
  };

  const toggleUnitReviewer = (user: User) => {
    const isUnitSelected = selectedUnitReviewerIds.includes(user.id);

    if (isUnitSelected) {
      setUnitReviewerIds(prev => prev.filter(id => id !== user.id));
    } else {
      const unitName = user.department?.unit.name;
      if (unitName && !selectedUnitMap.has(unitName)) {
        setUnitReviewerIds(prev => [...prev, user.id]);
      }
    }
  };

  const canSelectDepartmentUser = (user: User) => {
    if (selectedUnitReviewerIds.includes(user.id)) {
      return false;
    }

    if (selectedDepartmentReviewerIds.includes(user.id)) {
      return true;
    }

    const departmentName = user.department?.name;
    if (!departmentName || !eligibleDepartments.has(departmentName)) {
      return false;
    }

    return !selectedDepartmentMap.has(departmentName);
  };

  const canSelectUnitUser = (user: User) => {
    if (selectedUnitReviewerIds.includes(user.id)) {
      return true;
    }

    if (selectedDepartmentReviewerIds.includes(user.id)) {
      return false;
    }

    const unitName = user.department?.unit.name;
    if (!unitName || !eligibleUnits.has(unitName)) {
      return false;
    }

    return !selectedUnitMap.has(unitName);
  };

  const renderDepartmentUserList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (departmentUsers.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-4 space-y-2">
          <MagnifyingGlassIcon className="w-10 h-10 text-gray-300" />
          <p className="text-sm text-gray-500">Нічого не знайдено</p>
        </div>
      );
    }

    return departmentUsers.map((user) => {
      const fullName = `${user.lastName} ${user.firstName}`;
      const isSelected = selectedDepartmentReviewerIds.includes(user.id);
      const isSelectable = canSelectDepartmentUser(user);
      const isDisabled = !isSelectable && !isSelected;
      const departmentName = user.department?.name;

      return (
        <button
          key={`dept-${user.id}`}
          type="button"
          onClick={() => !isDisabled && toggleDepartmentReviewer(user)}
          disabled={isDisabled}
          className={`w-full text-left px-4 py-2 rounded-lg flex items-center justify-between transition-all
            ${isSelected
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : isDisabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                : "bg-white hover:bg-gray-100 text-gray-800 border border-transparent hover:border-gray-200"
            } focus:outline-none focus:ring-2 focus:ring-blue-300
          `}
        >
          <div className="flex items-center space-x-3">
            <UserIcon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
            <div>
              <div className="font-semibold">{fullName}</div>
              <div className="flex flex-col text-sm">
                <span className={`${isSelected ? 'text-blue-200' : 'text-gray-500'} flex items-center`}>
                  Кафедра: {departmentName}
                  {!isSelected && departmentName && selectedDepartmentMap.has(departmentName) && (
                    <span className="ml-1 text-yellow-500 text-xs">(вже обрано рецензента)</span>
                  )}
                </span>
                {!isSelected && selectedUnitReviewerIds.includes(user.id) && (
                  <span className="text-red-500 text-xs">Вже обрано як рецензента підрозділу</span>
                )}
              </div>
            </div>
          </div>
          {isSelected && (
            <CheckIcon className="w-6 h-6 text-white" />
          )}
        </button>
      );
    });
  };

  const renderUnitUserList = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      );
    }

    if (unitUsers.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-4 space-y-2">
          <MagnifyingGlassIcon className="w-10 h-10 text-gray-300" />
          <p className="text-sm text-gray-500">Нічого не знайдено</p>
        </div>
      );
    }

    return unitUsers.map((user) => {
      const fullName = `${user.lastName} ${user.firstName}`;
      const isSelected = selectedUnitReviewerIds.includes(user.id);
      const isSelectable = canSelectUnitUser(user);
      const isDisabled = !isSelectable && !isSelected;
      const unitName = user.department?.unit.name;

      return (
        <button
          key={`unit-${user.id}`}
          type="button"
          onClick={() => !isDisabled && toggleUnitReviewer(user)}
          disabled={isDisabled}
          className={`w-full text-left px-4 py-2 rounded-lg flex items-center justify-between transition-all
            ${isSelected
              ? "bg-green-500 text-white hover:bg-green-600"
              : isDisabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                : "bg-white hover:bg-gray-100 text-gray-800 border border-transparent hover:border-gray-200"
            } focus:outline-none focus:ring-2 focus:ring-green-300
          `}
        >
          <div className="flex items-center space-x-3">
            <UserIcon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
            <div>
              <div className="font-semibold">{fullName}</div>
              <div className="flex flex-col text-sm">
                <span className={`${isSelected ? 'text-green-200' : 'text-gray-500'} flex items-center`}>
                  Підрозділ: {unitName}
                  {!isSelected && unitName && selectedUnitMap.has(unitName) && (
                    <span className="ml-1 text-yellow-500 text-xs">(вже обрано рецензента)</span>
                  )}
                </span>
                {!isSelected && selectedDepartmentReviewerIds.includes(user.id) && (
                  <span className="text-red-500 text-xs">Вже обрано як рецензента кафедри</span>
                )}
              </div>
            </div>
          </div>
          {isSelected && (
            <CheckIcon className="w-6 h-6 text-white" />
          )}
        </button>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="relative">
          <Input
            label="Пошук за іменем"
            icon={<UserIcon className="w-5 h-5 text-blue-500" />}
            type="text"
            placeholder="Ім'я або прізвище..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="pl-10"
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
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Input
            label="Пошук за підрозділом"
            icon={<BuildingOfficeIcon className="w-5 h-5 text-green-500" />}
            type="text"
            placeholder="Назва підрозділу..."
            value={unitSearch}
            onChange={(e) => setUnitSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {selectedRespondentIds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 space-y-3 text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
          <BuildingOfficeIcon className="w-16 h-16 text-gray-300" />
          <p>Для вибору рецензентів спочатку оберіть респондентів</p>
        </div>
      ) : (
        <>
          {eligibleDepartments.size > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="w-5 h-5 mr-2 text-blue-600" />
                  <h3 className="text-lg font-medium">Рецензенти від кафедр</h3>
                </div>
                <div className="text-sm text-gray-500">
                  Обрано: {selectedDepartmentReviewerIds.length} / {eligibleDepartments.size}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="font-medium">Доступні кафедри:</div>
                <div className="flex flex-wrap gap-1">
                  {Array.from(eligibleDepartments).map(dept => (
                    <span key={dept} className="px-2 py-0.5 bg-blue-100 rounded-full text-blue-700 flex items-center">
                      <BuildingOfficeIcon className="w-3 h-3 mr-1" />
                      {dept}
                      {selectedDepartmentMap.has(dept) && <CheckIcon className="w-3 h-3 ml-1 text-green-600" />}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50 shadow-inner">
                {renderDepartmentUserList()}
              </div>
            </div>
          )}
          {eligibleUnits.size > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="w-5 h-5 mr-2 text-green-600" />
                  <h3 className="text-lg font-medium">Рецензенти від підрозділів</h3>
                </div>
                <div className="text-sm text-gray-500">
                  Обрано: {selectedUnitReviewerIds.length} / {eligibleUnits.size}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg border border-green-100">
                <div className="font-medium">Доступні підрозділи:</div>
                <div className="flex flex-wrap gap-1">
                  {Array.from(eligibleUnits).map(unit => (
                    <span key={unit} className="px-2 py-0.5 bg-green-100 rounded-full text-green-700 flex items-center">
                      <BuildingOfficeIcon className="w-3 h-3 mr-1" />
                      {unit}
                      {selectedUnitMap.has(unit) && <CheckIcon className="w-3 h-3 ml-1 text-green-600" />}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50 shadow-inner">
                {renderUnitUserList()}
              </div>
            </div>
          )}
          {(selectedDepartmentReviewerIds.length > 0 || selectedUnitReviewerIds.length > 0) && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium mb-2">Обрані рецензенти:</h4>
              <div className="space-y-1">
                {selectedDepartmentReviewerIds.map(id => {
                  const user = allUsers.find(u => u.id === id);
                  if (!user) return null;
                  return (
                    <div key={`summary-dept-${id}`} className="flex items-center text-sm">
                      <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                      <span className="font-medium">{user.lastName} {user.firstName}</span>
                      <span className="text-gray-500 ml-2">- {user.department?.name} (кафедра)</span>
                    </div>
                  );
                })}
                {selectedUnitReviewerIds.map(id => {
                  const user = allUsers.find(u => u.id === id);
                  if (!user) return null;
                  return (
                    <div key={`summary-unit-${id}`} className="flex items-center text-sm">
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                      <span className="font-medium">{user.lastName} {user.firstName}</span>
                      <span className="text-gray-500 ml-2">- {user.department?.unit.name} (підрозділ)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}