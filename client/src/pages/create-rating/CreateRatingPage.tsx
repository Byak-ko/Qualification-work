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

export default function CreateRatingPage() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [respondentId, setRespondentId] = useState<number | null>(null);
  const [items, setItems] = useState([{ name: "", maxScore: 10 }]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedReviewerIds, setSelectedReviewerIds] = useState<number[]>([]);

  const { currentUser: currentUser } = useAuth();
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
        setUsers(usersRes.data.filter((user) => user.id !== currentUserId));
      } catch (err) {
        toast.error("Помилка при завантаженні користувачів");
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleRespondentChange = (userId: number) => {
    setRespondentId(userId);
    setSelectedReviewerIds([]);
  };

  const handleItemChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: field === "maxScore" ? Number(value) : value,
    };
    setItems(updated);
  };

  const handleAddItem = () => setItems([...items, { name: "", maxScore: 10 }]);

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim() || !type.trim()) {
      toast.error("Заповніть назву та тип рейтингу");
      return;
    }

    if (!respondentId) {
      toast.error("Оберіть респондента");
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
      const reviewerIds = selectedReviewerIds
      const payload = { name, type, respondentId, reviewerIds, items };
      const res = await api.post("/ratings", payload);
      toast.success("Рейтинг успішно створено!");
      navigate(`/ratings/${res.data.rating.id}/fill`);
    } catch (err) {
      toast.error("Помилка створення рейтингу");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-xl">
  <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
    Створити рейтинг
  </h1>

  <div className="space-y-6">
    <Input
      label="Назва рейтингу"
      type="text"
      placeholder="Введіть назву рейтингу"
      value={name}
      onChange={(e) => setName(e.target.value)}
    />

    <Input
      label="Тип рейтингу"
      type="text"
      placeholder="Введіть тип рейтингу"
      value={type}
      onChange={(e) => setType(e.target.value)}
    />

    <RespondentSelector
      users={filteredUsers}
      respondentId={respondentId}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onSelect={handleRespondentChange}
    />

    {currentUser && respondentId && (
      <ReviewerSelector
        allUsers={allUsers}
        currentUser={currentUser}
        selectedReviewerIds={selectedReviewerIds}
        setSelectedReviewerIds={setSelectedReviewerIds}
        respondent={respondentId}
      />
    )}

    <RatingItemsEditor
      items={items}
      onChange={handleItemChange}
      onAdd={handleAddItem}
      onRemove={handleRemoveItem}
    />

    <Button
      onClick={handleSubmit}
      disabled={isSubmitting}
    >
      {isSubmitting ? "Створення..." : "Створити рейтинг"}
    </Button>
  </div>
</div>
  );
}
