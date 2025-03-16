import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from "../services/api/api"
import Button from "../components/ui/Button"
import Spinner from '../components/ui/Spinner';
import Modal from "../components/ConfirmModal";


type RatingItem = {
  id: number;
  name: string;
  maxScore: number;
  score: number;
  documents: File[];
};

type Rating = {
  id: number;
  name: string;
  type: string;
  status: string;
  items: RatingItem[];
};

export default function FillRatingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState<Rating | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    api.get(`/ratings/${id}`)
      .then(res => {
        const data = res.data;
        const itemsWithState = data.items.map((item: any) => ({
          ...item,
          score: 0,
          documents: []
        }));
        setRating({ ...data, items: itemsWithState });
      })
      .catch(() => toast.error("Не вдалося завантажити рейтинг"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleScoreChange = (index: number, value: number) => {
    setRating(prev => {
      if (!prev) return prev;
      const items = [...prev.items];
      items[index].score = value;
      return { ...prev, items };
    });
  };

  const handleFileChange = (index: number, files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setRating(prev => {
      if (!prev) return prev;
      const items = [...prev.items];
      items[index].documents = fileArray;
      return { ...prev, items };
    });
  };

  const handlePreview = () => {
    if (!rating) return;
    const isValid = rating.items.every(item =>
      item.score >= 0 && item.score <= item.maxScore
    );
    if (!isValid) {
      toast.error("Перевірте правильність введених балів");
      return;
    }
    setShowPreview(true);
  };

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);

    try {
      const uploadedDocs: Record<number, string[]> = {};

      // Upload documents for each item
      for (const item of rating.items) {
        const docUrls: string[] = [];
        for (const file of item.documents) {
          const formData = new FormData();
          formData.append("file", file);
          const res = await api.post("/documents/upload", formData);
          docUrls.push(res.data.url);
        }
        uploadedDocs[item.id] = docUrls;
      }

      // Submit filled rating
      await api.post(`/ratings/${id}/fill`, {
        items: rating.items.map(item => ({
          id: item.id,
          score: item.score,
          documents: uploadedDocs[item.id] || []
        }))
      });

      toast.success("Рейтинг успішно заповнено");
      navigate("/ratings");
    } catch (error) {
      toast.error("Помилка при відправленні рейтингу");
    } finally {
      setSubmitting(false);
      setShowPreview(false);
    }
  };

  if (loading || !rating) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">{rating.name}</h1>

      {rating.items.map((item, index) => (
        <div key={item.id} className="border p-4 rounded-md mb-4">
          <h2 className="font-medium">{item.name}</h2>
          <label className="block mt-2">
            Бал (0 - {item.maxScore}):
            <input
              type="number"
              min={0}
              max={item.maxScore}
              value={item.score}
              onChange={e => handleScoreChange(index, Number(e.target.value))}
              className="input mt-1"
            />
          </label>

          <label className="block mt-2">
            Документи:
            <input
              type="file"
              multiple
              onChange={e => handleFileChange(index, e.target.files)}
              className="mt-1"
            />
          </label>
        </div>
      ))}

      <div className="flex gap-4 justify-end mt-6">
        <Button onClick={handlePreview} disabled={submitting}>
          Попередній перегляд
        </Button>
      </div>

      <Modal open={showPreview} onClose={() => setShowPreview(false)} title="Попередній перегляд">
        <div>
          <p className="mb-2 text-gray-700">Перевірте введені дані:</p>
          {rating.items.map(item => (
            <div key={item.id} className="mb-3">
              <strong>{item.name}</strong>
              <p>Бал: {item.score} / {item.maxScore}</p>
              <p>Документи: {item.documents.map(f => f.name).join(", ") || "немає"}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => setShowPreview(false)} type="button">
            Назад
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Відправка..." : "Надіслати"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
