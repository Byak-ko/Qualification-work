import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api } from '../../services/api/api';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import RatingItemBlock from './RatingItemBlock';
import RatingPreviewModal from './RatingPreviewModal';
import { DocumentMagnifyingGlassIcon, DocumentCheckIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { Rating } from '../../types/Rating';
import { RatingParticipantStatus, ReviewLevel } from '../../types/Rating';

export default function RespondentRatingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get('id');

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      navigate('/ratings');
    }
  }, [id, navigate]);

  const [rating, setRating] = useState<Rating | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [reviewerComments, setReviewerComments] = useState<Record<number, string> | null>(null);

  useEffect(() => {
    api
      .get(`/ratings/${id}/respondent`)
      .then((res) => {
        const data = res.data;
        const itemsWithDefaults = data.items.map((item: any) => ({
          ...item,
          score: item.score || 0,
          documents: [],
          documentUrls: item.documentUrls || [],
          isDocNeed: item.isDocNeed || false,
        }));
        setRating({ ...data, items: itemsWithDefaults });
        
        if (data.participantStatus === RatingParticipantStatus.REVISION) {
          fetchReviewerComments(data.participantId);
        }
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.message 
          || error.message 
          || 'Не вдалося завантажити рейтинг';
        toast.error(errorMessage);

        if (error.response?.status === 403) {
          navigate('/ratings');
        }
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const fetchReviewerComments = async (participantId: number) => {
    try {
      const res = await api.get(`/ratings/participants/${participantId}/approvals`);
      const approvals = res.data;
      const reviewerLevels = [
        ReviewLevel.DEPARTMENT,
        ReviewLevel.UNIT,
        ReviewLevel.AUTHOR
      ];

      const highestReviewerApproval = reviewerLevels
        .map(level => approvals.find((a: any) => 
          a.reviewLevel === level && 
          a.comments && 
          Object.keys(a.comments).length > 0
        ))
        .find(approval => approval !== undefined);

      setReviewerComments(highestReviewerApproval?.comments || null);
    } catch (error) {
      console.error('Помилка завантаження коментарів:', error);
    }
  };

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
      const updatedFiles = [...updatedItems[itemIndex].documents];
      updatedFiles.splice(fileIndex, 1);
      updatedItems[itemIndex].documents = updatedFiles;
      return { ...prev, items: updatedItems };
    });
  };

  const handleDocumentUrlRemove = (itemIndex: number, urlIndex: number) => {
    setRating((prev) => {
      if (!prev) return prev;
      const updatedItems = [...prev.items];
      
      if (!updatedItems[itemIndex].documentUrls) {
        return prev;
      }
      
      const updatedUrls = [...updatedItems[itemIndex].documentUrls];
      updatedUrls.splice(urlIndex, 1);
      updatedItems[itemIndex].documentUrls = updatedUrls;
      return { ...prev, items: updatedItems };
    });
  };

  const handlePreview = () => {
    if (!rating) return;

    const missingDocs = rating.items.filter(item => {
      return (
        item.isDocNeed && 
        item.score > 0 && 
        (!item.documents || item.documents.length === 0) && 
        (!item.documentUrls || item.documentUrls.length === 0)
      );
    });

    if (missingDocs.length > 0) {
      toast.error(
        `Необхідно завантажити документи для наступних критеріїв: ${missingDocs
          .map(item => item.name)
          .join(', ')}`
      );
      return;
    }

    const invalidScores = rating.items.filter(item => {
      return item.score < 0 || (item.maxScore > 0 && item.score > item.maxScore);
    });

    if (invalidScores.length > 0) {
      toast.error(
        `Некоректні бали для наступних критеріїв: ${invalidScores
          .map(item => item.name)
          .join(', ')}`
      );
      return;
    }

    setShowPreview(true);
  };

  const uploadDocument = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/documents/upload', formData);
    return res.data.url;
  };

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);

    try {
      const itemsToSubmit = [];

      for (const item of rating.items) {
        const documentUrls = [...(item.documentUrls || [])];

        for (const file of item.documents) {
          try {
            const url = await uploadDocument(file);
            documentUrls.push(url);
          } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error);
            toast.error(`Помилка завантаження файлу ${file.name}`);
            setSubmitting(false);
            return;
          }
        }

        itemsToSubmit.push({
          id: item.id,
          score: item.score || 0,
          documents: documentUrls,
        });
      }

      await api.post(`/ratings/${id}/respondent-fill`, {
        items: itemsToSubmit,
      });

      toast.success('Рейтинг успішно збережено!');
      navigate('/ratings');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Помилка при відправленні';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const getCompletedItemsCount = () => {
    if (!rating) return 0;
    
    return rating.items.filter(item => {
      if (item.isDocNeed) {
        return (
          item.score > 0 && 
          ((item.documents && item.documents.length > 0) || 
           (item.documentUrls && item.documentUrls.length > 0))
        );
      }
      
      return item.score > 0;
    }).length;
  };

  if (loading || !rating) return <Spinner size='medium' />;

  const completedItemsCount = getCompletedItemsCount();
  const totalItemsCount = rating.items.length;
  const completionPercentage = Math.round((completedItemsCount / totalItemsCount) * 100);

  const isRevisionMode = rating.participantStatus === RatingParticipantStatus.REVISION;

  return (
    <div className="min-h-screen py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white flex items-center">
                <DocumentCheckIcon className="w-8 h-8 mr-3" />
                {isRevisionMode ? 'Коригування рейтингу' : 'Заповнення рейтингу'}
              </h1>
              <div className="bg-white/20 rounded-xl px-4 py-2 text-white backdrop-blur-sm flex items-center">
                <div className="mr-3">
                  <div className="text-xs text-white/80 mb-1">Заповнено</div>
                  <div className="text-lg font-bold">
                    {completedItemsCount} / {totalItemsCount}
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
                    strokeDasharray={`${completionPercentage} 100`}
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  ></circle>
                </svg>
              </div>
            </div>
            <p className="text-white/80 mt-2 text-lg font-medium">{rating.title}</p>
            {isRevisionMode && (
              <div className="mt-3 bg-white/10 px-4 py-3 rounded-lg backdrop-blur-sm">
                <p className="text-white font-medium">Рейтинг потребує коригування. Перегляньте коментарі перевіряючого.</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white shadow-lg rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {rating.items.map((item, index) => (
              <RatingItemBlock
                key={item.id}
                item={item}
                index={index}
                onScoreChange={handleScoreChange}
                onFileChange={handleFileChange}
                onFileRemove={handleFileRemove}
                onDocumentUrlRemove={handleDocumentUrlRemove}
                reviewerComments={reviewerComments || undefined}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="bg-indigo-50 border-l-4 border-indigo-400 rounded-lg px-4 py-3 text-indigo-800 flex items-start">
            <InformationCircleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Перед надсиланням:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Заповніть бали для кожного критерію</li>
                <li>Прикріпіть необхідні підтверджуючі документи</li>
                <li>Критерії з позначкою <span className="text-red-500">*</span> вимагають документів</li>
                <li>Дозволені формати файлів: JPEG, PNG, GIF, PDF</li>
                <li>Максимальний розмір файлу: 5MB</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="primary"
              size="md"
              icon={<DocumentMagnifyingGlassIcon className="w-5 h-5" />}
              disabled={submitting}
              onClick={handlePreview}
            >
              Попередній перегляд
            </Button>
          </div>
        </div>
        {showPreview && rating && (
          <RatingPreviewModal
            items={rating.items}
            submitting={submitting}
            onClose={() => setShowPreview(false)}
            onSubmit={handleSubmit}
            isOpen={showPreview}
          />
        )}
      </div>
    </div>
  );
}