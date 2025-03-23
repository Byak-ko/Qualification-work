import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../services/api/api';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import RatingItemBlock from './RatingItemBlock';
import RatingPreviewModal from './RatingPreviewModal';

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
  items: RatingItem[];
};

export default function RespondentRatingPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rating, setRating] = useState<Rating | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    api
      .get(`/ratings/${id}/respondent`)
      .then((res) => {
        const data = res.data;
        const itemsWithDefaults = data.items.map((item: any) => ({
          ...item,
          score: 0,
          documents: [],
        }));
        setRating({ ...data, items: itemsWithDefaults });
      })
      .catch(() => toast.error('Не вдалося завантажити рейтинг'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleScoreChange = (index: number, score: number) => {
    setRating((prev) => {
      if (!prev) return prev;
      const updatedItems = [...prev.items];
      updatedItems[index].score = score;
      return { ...prev, items: updatedItems };
    });
  };

  const handleFileChange = (index: number, files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);

    setRating((prev) => {
      if (!prev) return prev;
      const updatedItems = [...prev.items];

      const existingFiles = updatedItems[index].documents || [];
      const existingFileNames = new Set(existingFiles.map((file) => file.name));
      const filteredFiles = newFiles.filter((file) => !existingFileNames.has(file.name));

      updatedItems[index].documents = [...existingFiles, ...filteredFiles];
      return { ...prev, items: updatedItems };
    });
  };

  const handleFileRemove = (itemIndex: number, fileIndex: number) => {
    setRating((prev) => {
      if (!prev) return prev;
      const updatedItems = [...prev.items];
      updatedItems[itemIndex].documents = updatedItems[itemIndex].documents.filter(
        (_, i) => i !== fileIndex
      );
      return { ...prev, items: updatedItems };
    });
  };

  const handlePreview = () => {
    if (!rating) return;

    const isValidScores = rating.items.every(
      (item) => item.score >= 0 && item.score <= item.maxScore
    );
    const isValidFiles = rating.items.every((item) => item.documents.length > 0);

    if (!isValidScores) {
      toast.error('Перевірте правильність введених балів');
      return;
    }

    if (!isValidFiles) {
      toast.error('Перевірте, чи всі документи завантажені');
      return;
    }

    setShowPreview(true);
  };

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    try {
      const uploadedDocs: Record<number, string[]> = {};

      for (const item of rating.items) {
        const urls: string[] = [];
        for (const file of item.documents) {
          const formData = new FormData();
          formData.append('file', file);
          const res = await api.post('/documents/upload', formData);
          urls.push(res.data.url);
        }
        uploadedDocs[item.id] = urls;
      }

      await api.post(`/ratings/${id}/respondent-fill`, {
        items: rating.items.map((item) => ({
          id: item.id,
          score: item.score,
          documents: uploadedDocs[item.id] || [],
        })),
      });

      toast.success('Рейтинг успішно заповнено');
      navigate('/ratings');
    } catch (err) {
      toast.error('Помилка при відправленні');
    } finally {
      setSubmitting(false);
      setShowPreview(false);
    }
  };

  if (loading || !rating) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-extrabold mb-10 text-center text-gray-900">
        Заповнення рейтингу: <span className="text-indigo-600">{rating.name}</span>
      </h1>

      <div className="space-y-8">
        {rating.items.map((item, index) => (
          <RatingItemBlock
            key={item.id}
            item={item}
            index={index}
            onScoreChange={handleScoreChange}
            onFileChange={handleFileChange}
            onFileRemove={handleFileRemove}
          />
        ))}
      </div>

      <div className="flex justify-end mt-10">
        <Button onClick={handlePreview} disabled={submitting}>
          Попередній перегляд
        </Button>
      </div>

      {showPreview && rating && (
        <RatingPreviewModal
          items={rating.items}
          submitting={submitting}
          onClose={() => setShowPreview(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
