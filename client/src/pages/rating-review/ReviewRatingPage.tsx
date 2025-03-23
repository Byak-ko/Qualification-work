import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRatingById, submitReview } from "../../services/api/ratings";
import { toast } from "react-toastify"
import Button from "../../components/ui/Button";
import Textarea from "../../components/ui/Textarea";
import Spinner from "../../components/ui/Spinner"; 

const ReviewRatingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Record<number, string>>({});
  const [generalComment, setGeneralComment] = useState("");

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const data = await getRatingById(parseInt(id!));
        setRating(data);
      } catch (error) {
        toast.error("Не вдалося завантажити рейтинг");
      } finally {
        setLoading(false);
      }
    };
    fetchRating();
  }, [id]);

  const handleAction = async (status: "approved" | "revision") => {
    try {
      await submitReview(parseInt(id!), {
        ratingId: rating.id,
        status,
        comments,
      });
      toast.success(
        status === "approved"
          ? "Рейтинг успішно схвалено!"
          : "Рейтинг відправлено на доопрацювання"
      );
      navigate("/ratings");
    } catch (error) {
      toast.error("Сталася помилка при оновленні статусу рейтингу");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white bg-gray-800 shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4 text-indigo-600">
        Перевірка рейтингу
      </h1>

      {rating?.items.map((item: any) => (
        <div
          key={item.id}
          className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700"
        >
          <div className="mb-2">
            <span className="font-medium">{item.criteria}</span>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Оцінка респондента: <strong>{item.score}</strong>
          </div>
          <Textarea
            label="Коментар рецензента"
            value={comments[item.id] || ""}
            onChange={(e) =>
              setComments((prev) => ({
                ...prev,
                [item.id]: e.target.value,
              }))
            }
          />
        </div>
      ))}

      <div className="mb-6">
        <Textarea
          label="Загальний коментар (необов’язково)"
          value={generalComment}
          onChange={(e) => setGeneralComment(e.target.value)}
        />
      </div>

      <div className="flex gap-4 justify-end">
        <Button onClick={() => handleAction("revision")} type="button" className="bg-yellow-500 hover:bg-yellow-600">
          Повернути на доопрацювання
        </Button>
        <Button onClick={() => handleAction("approved")} type="button">
          Схвалити
        </Button>
      </div>
    </div>
  );
};

export default ReviewRatingPage;
