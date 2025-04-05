import { useEffect, useState } from "react";
import { api } from "../../services/api/api";
import Button from "../../components/ui/Button";
import { User } from "../../types/User";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ReviewerSelector from "./ReviewerSelector";
import { useAuth } from "../../components/AuthProvider";
import RespondentSelector from "./RespondentSelector";
import RatingItemsEditor from "./RatingItemsEditor";
import Input from "../../components/ui/Input";
import {
  StarIcon,
  DocumentPlusIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

export default function CreateRatingPage() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [selectedRespondentIds, setSelectedRespondentIds] = useState<number[]>([]);
  const [items, setItems] = useState([{ name: "", maxScore: 10, comment: "", isDocNeed: false }]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [departmentReviewerIds, setDepartmentReviewerIds] = useState<number[]>([]);
  const [unitReviewerIds, setUnitReviewerIds] = useState<number[]>([]);

  const { currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    api.get("/users").then((res) => setAllUsers(res.data));
  }, []);

  const navigate = useNavigate();
  const currentUserId = currentUser?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await api.get<User[]>("/users");
        console.log("Users: ", usersRes.data);
      } catch (err) {
        toast.error("Помилка при завантаженні користувачів");
        console.error(err);
      }
    };

    fetchData();
  }, [currentUserId]);

  const handleRespondentChange = (userId: number) => {
    if (selectedRespondentIds.includes(userId)) {
      setSelectedRespondentIds(selectedRespondentIds.filter((id) => id !== userId));
    } else {
      setSelectedRespondentIds([...selectedRespondentIds, userId]);
    }
  };

  const handleMultipleRespondentChange = (userIds: number[]) => {
    setSelectedRespondentIds(userIds);
  };

  const handleItemChange = (
    index: number,
    field: string,
    value: string | number | boolean
  ) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: 
        field === "maxScore" ? Number(value) : 
        field === "isDocNeed" ? Boolean(value) : value,
    };
    setItems(updated);
  };

  const handleAddItem = () => setItems([...items, { name: "", maxScore: 10, comment: "", isDocNeed: false }]);

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !type.trim()) {
      toast.error("Заповніть назву та тип рейтингу");
      return;
    }

    if (
      items.length === 0 ||
      items.some((item) => !item.name.trim() || item.maxScore <= 0)
    ) {
      toast.error("Додайте хоча б один валідний пункт рейтингу");
      return;
    }

    try {
      setIsSubmitting(true);
      const reviewerDepartmentsIds = departmentReviewerIds;
      const reviewerUnitsIds = unitReviewerIds;
      const payload = { name, type, respondentIds: selectedRespondentIds, reviewerDepartmentsIds, reviewerUnitsIds, items };
      console.log(payload);
      await api.post("/ratings", payload);
      toast.success("Рейтинг успішно створено!");
      navigate(`/ratings`);
    } catch (err) {
      toast.error("Помилка створення рейтингу");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-blue-100 p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-blue-700"></div>

        <div className="flex items-center justify-center mb-8 space-x-4">
          <div className="bg-yellow-100 p-3 rounded-full shadow-md">
            <StarIcon className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">
            Створити рейтинг
          </h1>
        </div>

        <div className="space-y-8">
          {/* Блок 1: Основна інформація */}
          <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-md">
            <div className="flex items-center text-blue-800 mb-4">
              <DocumentPlusIcon className="w-6 h-6 mr-2" />
              <h2 className="text-xl font-bold">Основна інформація</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Назва рейтингу"
                type="text"
                placeholder="Введіть назву рейтингу"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="shadow-sm"
                icon={<DocumentPlusIcon className="w-5 h-5 text-blue-500" />}
              />

              <Input
                label="Тип рейтингу"
                type="text"
                placeholder="Введіть тип рейтингу"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="shadow-sm"
                icon={<ClipboardDocumentListIcon className="w-5 h-5 text-blue-500" />}
              />
            </div>
          </div>

          {/* Блок 2: Критерії оцінювання */}
          <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-md">
            <div className="flex items-center text-blue-800 mb-4">
              <ClipboardDocumentListIcon className="w-6 h-6 mr-2" />
              <h2 className="text-xl font-bold">Критерії оцінювання</h2>
            </div>
            <RatingItemsEditor
              items={items}
              onChange={handleItemChange}
              onAdd={handleAddItem}
              onRemove={handleRemoveItem}
            />
          </div>

          {/* Блок 3: Респонденти */}
          <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-md">
            <div className="flex items-center text-blue-800 mb-4">
              <UserGroupIcon className="w-6 h-6 mr-2" />
              <h2 className="text-xl font-bold">Респонденти</h2>
            </div>
            <RespondentSelector
              users={allUsers}
              selectedRespondentIds={selectedRespondentIds}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelect={handleRespondentChange}
              onSelectMultiple={handleMultipleRespondentChange}
            />
          </div>

          {/* Блок 4: Рецензенти */}
          {currentUser && selectedRespondentIds.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-md">
              <div className="flex items-center text-blue-800 mb-4">
                <UserGroupIcon className="w-6 h-6 mr-2" />
                <h2 className="text-xl font-bold">Рецензенти</h2>
                <span className="text-sm text-gray-500 ml-2">
                  (максимум 1 особа з кожної кафедри та підрозділу респондентів)
                </span>
              </div>
              <ReviewerSelector
                allUsers={allUsers}
                currentUser={currentUser}
                selectedDepartmentReviewerIds={departmentReviewerIds}
                setDepartmentReviewerIds={setDepartmentReviewerIds}
                selectedUnitReviewerIds={unitReviewerIds}
                setUnitReviewerIds={setUnitReviewerIds}
                selectedRespondentIds={selectedRespondentIds}
              />
            </div>
          )}

          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-colors duration-300 py-3.5 text-lg rounded-xl shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? "Створення..." : "Створити рейтинг"}
            </Button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-blue-700"></div>
      </div>
    </div>
  );
}