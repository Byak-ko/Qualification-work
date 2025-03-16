import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api/api";
import { Rating, RatingItem} from "../types/Rating";
import Spinner from "../components/ui/Spinner";
import Button from "../components/ui/Button";
import toast from "react-toastify";

const RatingApprovalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState<Rating | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadRating(id);
    }
  }, [id]);

  const loadRating = async (ratingId: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/ratings/${ratingId}`);
      setRating(response.data);
    } catch (err) {
      toast.error("Не вдалося завантажити рейтинг");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (status: "approved" | "rejected") => {
    if (!rating) return;
    setSubmitting(true);
    try {
      await api.post(`/ratings/${rating.id}/approve`, {
        status,
        comments: comment,
      });
      toast.success("Рейтинг успішно оновлено");
      navigate("/ratings");
    } catch (err) {
      toast.error("Помилка при оновленні рейтингу");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !rating) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Перевірка рейтингу</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <p><strong>Назва:</strong> {rating.name}</p>
        <p><strong>Тип:</strong> {rating.type}</p>
        <p><strong>Автор:</strong> {rating.author.firstName} {rating.author.lastName}</p>
        <p><strong>Респондент:</strong> {rating.respondent.firstName} {rating.respondent.lastName}</p>
        <p><strong>Статус:</strong> {rating.status}</p>
        <p><strong>Загальний бал:</strong> {rating.totalScore}</p>
      </div>

      <div className="space-y-4">
        {rating.items.map((item: RatingItem) => (
          <div key={item.id} className="bg-gray-100 dark:bg-gray-700 rounded p-4">
            <h3 className="text-lg font-medium">{item.name}</h3>
            <p><strong>Оцінка:</strong> {item.score} / {item.maxScore}</p>

            {item.documents && item.documents.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">Документи:</p>
                <ul className="list-disc list-inside">
                  {item.documents.map((doc) => (
                    <li key={doc.id}>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        {doc.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium mb-1">
          Коментар:
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 border rounded resize-y min-h-[100px]"
        />
      </div>

      <div className="mt-4 flex gap-4">
        <Button onClick={() => handleSubmit("approved")} disabled={submitting}>
          ✅ Затвердити
        </Button>
        <Button
          onClick={() => handleSubmit("rejected")}
          disabled={submitting}
          className="bg-red-600 hover:bg-red-700"
        >
          ❌ Відхилити
        </Button>
      </div>
    </div>
  );
};

export default RatingApprovalPage;
