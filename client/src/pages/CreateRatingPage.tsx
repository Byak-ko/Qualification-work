import { useEffect, useState } from "react";
import { api } from "../services/api/api";
import Button from "../components/ui/Button";
import { User } from "../types/User";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ReviewerSelector from "../components/ReviewerSelector";
import { useAuth } from "../components/AuthProvider";

export default function CreateRatingPage() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [respondentId, setRespondentId] = useState<number | null>(null);  // Тільки один респондент
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Назва рейтингу
          </label>
          <input
            type="text"
            placeholder="Введіть назву рейтингу"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Тип рейтингу
          </label>
          <input
            type="text"
            placeholder="Введіть тип рейтингу"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Оберіть респондента
          </label>
          <input
            type="text"
            placeholder="Пошук користувачів..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
          />
          <div className="mt-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-gray-50">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition duration-200"
                >
                  <input
                    type="radio"
                    checked={respondentId === user.id}
                    onChange={() => handleRespondentChange(user.id)}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                  <div className="font-semibold text-gray-800">{user.lastName} {user.firstName}</div>
                  {user.department?.name && (
                    <div className="text-sm text-gray-600">
                      {user.department.name}
                    </div>
                  )}
                </div>
                </label>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-2">
                Нічого не знайдено
              </p>
            )}
          </div>
        </div>

        {currentUser && respondentId && (
  <ReviewerSelector
    allUsers={allUsers}
    currentUser={currentUser}
    selectedReviewerIds={selectedReviewerIds}
    setSelectedReviewerIds={setSelectedReviewerIds}
    respondent={respondentId}
  />
)}




        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Критерії оцінювання
          </label>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
              >
                <input
                  type="text"
                  placeholder="Назва пункту"
                  value={item.name}
                  onChange={(e) => handleItemChange(index, "name", e.target.value)}
                  className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                />
                <input
                  type="number"
                  placeholder="Макс. бал"
                  value={item.maxScore}
                  min={1}
                  onChange={(e) => handleItemChange(index, "maxScore", e.target.value)}
                  className="w-24 border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                />
                {items.length > 1 && (
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-700 transition duration-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleAddItem}
            className="mt-3 text-blue-600 hover:text-blue-800 transition duration-200 flex items-center space-x-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H3a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Додати пункт</span>
          </button>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          //className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Створення..." : "Створити рейтинг"}
        </Button>
      </div>
    </div>
  );
}
