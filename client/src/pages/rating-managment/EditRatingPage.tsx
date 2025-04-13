import { useEffect, useState } from "react";
import { api } from "../../services/api/api";
import Button from "../../components/ui/Button";
import { User } from "../../types/User";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ReviewerSelector from "./ReviewerSelector";
import { useAuth } from "../../components/AuthProvider";
import RespondentSelector from "./RespondentSelector";
import RatingItemsEditor from "./RatingItemsEditor";
import DatePicker from "./DatePicker";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import { Rating, RatingItem, RatingType } from "../../types/Rating";
import {
  StarIcon,
  DocumentPlusIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  PlusCircleIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export type EditableRatingItem = Omit<RatingItem, "id" | "score" | "documents"> & {
  isDocNeed?: boolean;
  id?: number;
};

export default function EditRatingPage() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedRespondentIds, setSelectedRespondentIds] = useState<number[]>([]);
  const [items, setItems] = useState<EditableRatingItem[]>([{ name: "", maxScore: 10, comment: "", isDocNeed: false }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [departmentReviewerIds, setDepartmentReviewerIds] = useState<number[]>([]);
  const [unitReviewerIds, setUnitReviewerIds] = useState<number[]>([]);

  const { currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const usersRes = await api.get<User[]>("/users");
        setAllUsers(usersRes.data);
        return usersRes.data;
      } catch (err) {
        toast.error("Помилка при завантаженні користувачів");
      }
    };

    const fetchRatingDetails = async () => {
      try {
        const ratingRes = await api.get<Rating>(`/ratings/${id}`);
        const rating = ratingRes.data;
        console.log(rating);
        setTitle(rating.title);
        setType(rating.type);
        setSelectedRespondentIds(rating.participants.map(({ respondent }) => respondent.id));

        if (rating.endedAt) {
          setEndDate(new Date(rating.endedAt));
        }

        if (rating.departmentReviewers) {
          setDepartmentReviewerIds(rating.departmentReviewers.map((reviewer: User) => reviewer.id));
        }

        if (rating.unitReviewers) {
          setUnitReviewerIds(rating.unitReviewers.map((reviewer: User) => reviewer.id));
        }

        // Fallback if API doesn't return separate arrays
        if (!rating.departmentReviewers || !rating.unitReviewers) {
          const departmentIds: number[] = [];
          const unitIds: number[] = [];

          // Find unique departmentReviewers and unitReviewers from participants
          rating.participants.forEach(participant => {
            if (participant.departmentReviewer && !departmentIds.includes(participant.departmentReviewer.id)) {
              departmentIds.push(participant.departmentReviewer.id);
            }

            if (participant.unitReviewer && !unitIds.includes(participant.unitReviewer.id)) {
              unitIds.push(participant.unitReviewer.id);
            }
          });

          setDepartmentReviewerIds(departmentIds);
          setUnitReviewerIds(unitIds);
        }

        // Adapt items with isDocNeed field
        setItems(rating.items.map(item => ({
          id: item.id,
          name: item.name,
          maxScore: item.maxScore,
          comment: item.comment || "",
          isDocNeed: item.isDocNeed
        })));
      } catch (err) {
        toast.error("Помилка при завантаженні деталей рейтингу");
        navigate("/ratings");
      }
    };

    fetchAllUsers();
    if (id) fetchRatingDetails();
  }, [id, currentUser?.id, navigate]);

  const handleRespondentChange = (userId: number) => {
    setSelectedRespondentIds(prev =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
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
    if (!title.trim() || !type.trim()) {
      toast.error("Заповніть назву та тип рейтингу");
      return;
    }

    if (!selectedRespondentIds.length) {
      toast.error("Оберіть респондента");
      return;
    }

    if (
      items.length === 0 ||
      items.some((item) => !item.name.trim() || item.maxScore < 0)
    ) {
      toast.error("Додайте хоча б один валідний пункт рейтингу");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title,
        type,
        respondentIds: selectedRespondentIds,
        reviewerDepartmentsIds: departmentReviewerIds,
        reviewerUnitsIds: unitReviewerIds,
        items,
        endedAt: endDate
      };
      console.log("PAYLOAD", payload);
      await api.patch(`/ratings/${id}`, payload);
      toast.success("Рейтинг успішно оновлено!");
      navigate(`/ratings`);
    } catch (err) {
      toast.error("Помилка оновлення рейтингу");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-blue-100 p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-blue-700"></div>

        <div className="flex items-center justify-center mb-8 space-x-4">
          <div className="bg-yellow-100 p-3 rounded-full shadow-md">
            <StarIcon className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">
            Редагування рейтингу
          </h1>
        </div>

        <div className="space-y-8">
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="shadow-sm"
                icon={<DocumentPlusIcon className="w-5 h-5 text-blue-500" />}
              />

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Тип рейтингу
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-blue-500" />
                  </div>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as RatingType)}
                    className="border border-gray-300 py-2 px-3 rounded-lg text-gray-900 bg-white transition duration-200 focus:ring-2 focus:ring-blue-400 focus:border-blue-500 shadow-sm pl-10 w-full"
                  >
                    <option value="" disabled>Виберіть тип рейтингу</option>
                    {Object.values(RatingType).map((ratingType) => (
                      <option key={ratingType} value={ratingType}>
                        {ratingType}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full mt-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                      <CalendarIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      placeholder="Виберіть кінцеву дату"
                      minDate={new Date()}
                      label="Кінцева дата"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

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

          <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-md">
            <div className="flex items-center text-blue-800 mb-4">
              <UserGroupIcon className="w-6 h-6 mr-2" />
              <h2 className="text-xl font-bold">Респонденти</h2>
            </div>
            <RespondentSelector
              users={allUsers}
              selectedRespondentIds={selectedRespondentIds}
              onSelect={handleRespondentChange}
              onSelectMultiple={handleMultipleRespondentChange}
            />
          </div>

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
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-colors duration-300 py-3.5 text-lg rounded-xl shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="small" />
                  <span>Оновлення...</span>
                </>
              ) : (
                <>
                  <PlusCircleIcon className="h-6 w-6 transition-transform group-hover:rotate-45" />
                  <span>Оновити рейтинг</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-blue-700"></div>
      </div>
    </div>
  );
}