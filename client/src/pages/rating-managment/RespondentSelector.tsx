import { useState, useEffect, useRef } from "react";
import { User, Position } from "../../types/User";
import Input from "../../components/ui/Input";
import { MagnifyingGlassIcon, UserIcon, CheckIcon, BuildingOfficeIcon, HomeIcon } from "@heroicons/react/24/outline";
import { getFilteredUsers } from "../../services/api/userService";

type Props = {
  selectedRespondentIds: number[];
  onSelect: (userId: number) => void;
  onSelectMultiple: (userIds: number[]) => void;
};

export default function RespondentSelector({
  selectedRespondentIds,
  onSelect,
  onSelectMultiple,
}: Props) {
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [nameSearch, setNameSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [unitSearch, setUnitSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollPosition = useRef(0);
  const isUpdating = useRef(false);

  const checkboxRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const unitCheckboxRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const saveScrollPosition = () => {
    if (!isUpdating.current) {
      scrollPosition.current = window.scrollY;
      isUpdating.current = true;
    }
  };

  const restoreScrollPosition = () => {
    if (isUpdating.current) {
      window.scrollTo(0, scrollPosition.current);
      isUpdating.current = false;
    }
  };

  useEffect(() => {
    const fetchFilteredUsers = async () => {
      saveScrollPosition();
      setIsLoading(true);
      try {
        const filters: { name?: string; departmentName?: string; unitName?: string } = {};
        if (nameSearch) filters.name = nameSearch;
        if (departmentSearch) filters.departmentName = departmentSearch;
        if (unitSearch) filters.unitName = unitSearch;

        const data = await getFilteredUsers(filters);
        const nonAdminUsers = data.filter((user: User) => user.position !== Position.ADMIN);
        setFilteredUsers(nonAdminUsers);
        
        const uniqueDepartments = Array.from(
          new Set(nonAdminUsers.map((user: User) => user.department?.name).filter(Boolean))
        ) as string[];
        const uniqueUnits = Array.from(
          new Set(nonAdminUsers.map((user: User) => user.department?.unit?.name).filter(Boolean))
        ) as string[];
        
        setDepartments(uniqueDepartments);
        setUnits(uniqueUnits);
        
        updateSelectedDepartmentsAndUnits(nonAdminUsers, selectedRespondentIds);
      } catch (error) {
        console.error("Error fetching filtered users:", error);
        setFilteredUsers([]);
      } finally {
        setIsLoading(false);
        setTimeout(restoreScrollPosition, 0);
      }
    };

    fetchFilteredUsers();
  }, [nameSearch, departmentSearch, unitSearch]);
  
  useEffect(() => {
    if (filteredUsers.length > 0) {
      saveScrollPosition();
      updateSelectedDepartmentsAndUnits(filteredUsers, selectedRespondentIds);
      setTimeout(restoreScrollPosition, 0);
    }
  }, [selectedRespondentIds, filteredUsers]);

  useEffect(() => {
    departments.forEach((dept) => {
      const checkbox = checkboxRefs.current[dept];
      if (checkbox) {
        const stats = getDepartmentStats(dept);
        checkbox.indeterminate = stats.selected > 0 && stats.selected < stats.total;
      }
    });

    units.forEach((unit) => {
      const checkbox = unitCheckboxRefs.current[unit];
      if (checkbox) {
        const stats = getUnitStats(unit);
        checkbox.indeterminate = stats.selected > 0 && stats.selected < stats.total;
      }
    });
  }, [departments, units, selectedRespondentIds, filteredUsers]);

  const updateSelectedDepartmentsAndUnits = (users: User[], selectedIds: number[]) => {
    const fullySelectedDepartments = departments.filter((dept) => {
      const deptUsers = users.filter((user) => user.department?.name === dept);
      return deptUsers.every((user) => selectedIds.includes(user.id));
    });

    const fullySelectedUnits = units.filter((unit) => {
      const unitUsers = users.filter((user) => user.department?.unit?.name === unit);
      return unitUsers.every((user) => selectedIds.includes(user.id));
    });

    setSelectedDepartments(fullySelectedDepartments);
    setSelectedUnits(fullySelectedUnits);
  };

  const handleDepartmentSelect = (departmentName: string) => {
    saveScrollPosition();
    
    const departmentUsers = filteredUsers
      .filter((user) => user.department?.name === departmentName)
      .map((user) => user.id);

    if (selectedDepartments.includes(departmentName)) {
      setSelectedDepartments(selectedDepartments.filter((d) => d !== departmentName));
      const updatedIds = selectedRespondentIds.filter((id) => !departmentUsers.includes(id));
      onSelectMultiple(updatedIds);
    } else {
      setSelectedDepartments([...selectedDepartments, departmentName]);
      const newIds = departmentUsers.filter((id) => !selectedRespondentIds.includes(id));
      onSelectMultiple([...selectedRespondentIds, ...newIds]);
    }

    const checkbox = checkboxRefs.current[departmentName];
    if (checkbox) {
      checkbox.indeterminate = false;
    }
    
    setTimeout(restoreScrollPosition, 0);
  };

  const handleUnitSelect = (unitName: string) => {
    saveScrollPosition();
    
    const unitUsers = filteredUsers
      .filter((user) => user.department?.unit?.name === unitName)
      .map((user) => user.id);

    if (selectedUnits.includes(unitName)) {
      setSelectedUnits(selectedUnits.filter((u) => u !== unitName));
      const updatedIds = selectedRespondentIds.filter((id) => !unitUsers.includes(id));
      onSelectMultiple(updatedIds);
    } else {
      setSelectedUnits([...selectedUnits, unitName]);
      const newIds = unitUsers.filter((id) => !selectedRespondentIds.includes(id));
      onSelectMultiple([...selectedRespondentIds, ...newIds]);
    }

    const checkbox = unitCheckboxRefs.current[unitName];
    if (checkbox) {
      checkbox.indeterminate = false;
    }
    
    setTimeout(restoreScrollPosition, 0);
  };

  const handleUserSelect = (userId: number) => {
    saveScrollPosition();
    
    onSelect(userId);
    
    const user = filteredUsers.find((u) => u.id === userId);
    if (user?.department?.name) {
      const dept = user.department.name;
      const deptUsers = filteredUsers.filter((u) => u.department?.name === dept);
      const newSelectedIds = selectedRespondentIds.includes(userId)
        ? selectedRespondentIds.filter((id) => id !== userId)
        : [...selectedRespondentIds, userId];
      const selectedInDept = deptUsers.filter((u) => newSelectedIds.includes(u.id)).length;

      const deptCheckbox = checkboxRefs.current[dept];
      if (deptCheckbox) {
        deptCheckbox.indeterminate = selectedInDept > 0 && selectedInDept < deptUsers.length;
        deptCheckbox.checked = selectedInDept === deptUsers.length;
      }

      if (user.department?.unit?.name) {
        const unit = user.department.unit.name;
        const unitUsers = filteredUsers.filter((u) => u.department?.unit?.name === unit);
        const selectedInUnit = unitUsers.filter((u) => newSelectedIds.includes(u.id)).length;

        const unitCheckbox = unitCheckboxRefs.current[unit];
        if (unitCheckbox) {
          unitCheckbox.indeterminate = selectedInUnit > 0 && selectedInUnit < unitUsers.length;
          unitCheckbox.checked = selectedInUnit === unitUsers.length;
        }
      }
    }
    
    setTimeout(restoreScrollPosition, 0);
  };

  const getDepartmentStats = (departmentName: string) => {
    const departmentUsers = filteredUsers.filter((user) => user.department?.name === departmentName);
    const selectedUsers = departmentUsers.filter((user) => selectedRespondentIds.includes(user.id));

    return {
      total: departmentUsers.length,
      selected: selectedUsers.length,
    };
  };

  const getUnitStats = (unitName: string) => {
    const unitUsers = filteredUsers.filter((user) => user.department?.unit?.name === unitName);
    const selectedUsers = unitUsers.filter((user) => selectedRespondentIds.includes(user.id));

    return {
      total: unitUsers.length,
      selected: selectedUsers.length,
    };
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="relative">
          <Input
            label="Пошук за підрозділом"
            icon={<HomeIcon className="w-5 h-5 text-blue-500" />}
            type="text"
            placeholder="Назва підрозділу..."
            value={unitSearch}
            onChange={(e) => setUnitSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {units.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <HomeIcon className="w-5 h-5 mr-2 text-purple-600" />
                  <h3 className="text-lg font-medium">Підрозділи</h3>
                </div>
                <div className="text-sm text-gray-500">
                  Обрано: {selectedRespondentIds.length} / {filteredUsers.length}
                </div>
              </div>

              {units.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border border-gray-300 rounded-lg p-3 bg-purple-50 shadow-inner max-h-64 overflow-y-auto">
                  {units.map((unit) => {
                    const isSelected = selectedUnits.includes(unit);
                    const stats = getUnitStats(unit);
                    const isIndeterminate = stats.selected > 0 && stats.selected < stats.total;

                    return (
                      <div
                        key={unit}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-all
                          ${isSelected ? "bg-purple-100 border-purple-300" : isIndeterminate ? "bg-purple-50 border-purple-200" : "bg-white border-transparent"}
                          border hover:border-purple-200`}
                        onClick={() => handleUnitSelect(unit)}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            ref={(el) => {unitCheckboxRefs.current[unit] = el}}
                            onChange={() => {}}
                            className="text-purple-600 rounded mr-2"
                            aria-label={`Вибрати підрозділ ${unit}`}
                          />
                          <label className="text-gray-700 font-semibold">{unit}</label>
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
                  <HomeIcon className="w-10 h-10 text-gray-300" />
                  <p className="text-sm text-gray-500">Підрозділів не знайдено</p>
                </div>
              )}
            </div>
          )}

          {departments.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="w-5 h-5 mr-2 text-blue-600" />
                  <h3 className="text-lg font-medium">Кафедри</h3>
                </div>
                <div className="text-sm text-gray-500">
                  Обрано: {selectedRespondentIds.length} / {filteredUsers.length}
                </div>
              </div>

              {departments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border border-gray-300 rounded-lg p-3 bg-blue-50 shadow-inner max-h-64 overflow-y-auto">
                  {departments.map((department) => {
                    const isSelected = selectedDepartments.includes(department);
                    const stats = getDepartmentStats(department);
                    const isIndeterminate = stats.selected > 0 && stats.selected < stats.total;

                    return (
                      <div
                        key={department}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-all
                          ${isSelected ? "bg-blue-100 border-blue-300" : isIndeterminate ? "bg-blue-50 border-blue-200" : "bg-white border-transparent"}
                          border hover:border-blue-200`}
                        onClick={() => handleDepartmentSelect(department)}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            ref={(el) => {checkboxRefs.current[department] = el}}
                            onChange={() => {}}
                            className="text-blue-600 rounded mr-2"
                            aria-label={`Вибрати кафедру ${department}`}
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
                              {user.department.name} {user.department.unit?.name ? `(${user.department.unit.name})` : ""}
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
                {[...new Set(selectedRespondentIds)].map((id) => {
                  const user = filteredUsers.find((u) => u.id === id);
                  if (!user) return null;
                  return (
                    <div key={`selected-user-${id}`} className="flex items-center text-sm">
                      <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                      <span className="font-medium">{user.lastName} {user.firstName}</span>
                      <span className="text-gray-500 ml-2">
                        - {user.department?.name} {user.department?.unit?.name ? `(${user.department.unit.name})` : ""}
                      </span>
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