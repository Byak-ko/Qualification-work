import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../services/api/api';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import RatingItemBlock from './RatingItemBlock';
import RatingPreviewModal from './RatingPreviewModal';
import { DocumentMagnifyingGlassIcon, DocumentCheckIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { Rating } from '../../types/Rating';

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
    const isValidFiles = rating.items.every((item) => item.documents.length > 0 || item.score === 0);

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

  const uploadDocument = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/ratings/documents/upload', formData);
    return res.data.url;
  };
  

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
  
    try {
      const uploadedDocs: Record<number, string[]> = {};
  
      for (const item of rating.items) {
        const urls: string[] = [];
        for (const file of item.documents) {
          const url = await uploadDocument(file);
          urls.push(url);
        }
        uploadedDocs[item.id] = urls;
      }
      console.log("UPLOADED docs",uploadedDocs);
  
      await api.post(`/ratings/${id}/respondent-fill`, {
        items: rating.items.map((item) => ({
          id: item.id,
          score: item.score,
          documents: uploadedDocs[item.id] || [],
        })),
      });
      console.log("SUBMITTED",  rating.items.map((item) => ({
        id: item.id,
        score: item.score,
        documents: uploadedDocs[item.id] || [],
      })),);
  
      toast.success('Рейтинг успішно заповнено');
      navigate('/ratings');
    } catch (err) {
      toast.error('Помилка при відправленні');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !rating) return <Spinner />;

  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white min-h-screen py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Card */}
        <div className="bg-white shadow-lg rounded-2xl mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white flex items-center">
                <DocumentCheckIcon className="w-8 h-8 mr-3" />
                Заповнення рейтингу
              </h1>
              
              {/* Improved completion counter */}
              <div className="bg-white/20 rounded-xl px-4 py-2 text-white backdrop-blur-sm flex items-center">
                <div className="mr-3">
                  <div className="text-xs text-white/80 mb-1">Заповнено</div>
                  <div className="text-lg font-bold">
                    {rating.items.filter(item => item.documents.length > 0).length} / {rating.items.length}
                  </div>
                </div>
                <svg className="w-10 h-10" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"></circle>
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="16" 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="2"
                    strokeDasharray={`${Math.round((rating.items.filter(item => item.documents.length > 0).length / rating.items.length) * 100)} 100`}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  ></circle>
                </svg>
              </div>
            </div>
            <p className="text-white/80 mt-2 text-lg font-medium">{rating.name}</p>
          </div>
        </div>
  
        {/* Main Content - Simple Grid Layout */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
  
        {/* Action Buttons with Improved Info Block */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-400 rounded-lg px-4 py-3 text-indigo-800 flex items-start">
            <InformationCircleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Перед надсиланням:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Заповніть бали для кожного критерію</li>
                <li>Прикріпіть необхідні підтверджуючі документи</li>
              </ul>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handlePreview}
              disabled={submitting}
              className="bg-indigo-600 text-white hover:bg-indigo-700
                       transition-colors duration-300
                       flex items-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DocumentMagnifyingGlassIcon className="w-5 h-5" />
              Попередній перегляд
            </Button>
          </div>
        </div>
  
        {/* Preview Modal */}
        {showPreview && rating && (
          <RatingPreviewModal
            items={rating.items}
            submitting={submitting}
            onClose={() => setShowPreview(false)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
};