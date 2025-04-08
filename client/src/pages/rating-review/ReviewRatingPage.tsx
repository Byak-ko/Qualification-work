import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRatingForReview, submitReview } from "../../services/api/ratings";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";
import Textarea from "../../components/ui/Textarea";
import Spinner from "../../components/ui/Spinner";
import { RatingApprovalStatus } from "../../types/Rating";
import { 
  CheckCircleIcon, 
  ArrowPathIcon, 
  DocumentTextIcon, 
  ShieldCheckIcon, 
  UserCircleIcon,
  ChevronDownIcon,
  DocumentMagnifyingGlassIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  DocumentIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

const ReviewRatingPage = () => {
  const { ratingId, respondentId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<number, string>>({});
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  useEffect(() => {
    const fetchRating = async () => {
      if (!ratingId || !respondentId) {
        setError("Необхідні параметри не вказані в URL");
        setLoading(false);
        return;
      }

      try {
        const data = await getRatingForReview(parseInt(ratingId), parseInt(respondentId));
        if (!data) {
          setError("Рейтинг не знайдено");
          return;
        }
        setRating(data);
        setError(null);
      } catch (error: any) {
        console.error("Error fetching rating:", error);
        setError(error.message || "Не вдалося завантажити рейтинг");
      } finally {
        setLoading(false);
      }
    };
    fetchRating();
  }, [ratingId, respondentId]);

  const handleAction = async (status: RatingApprovalStatus.APPROVED | RatingApprovalStatus.REVISION) => {
    if (!rating || !ratingId || !respondentId) {
      toast.error("Неможливо виконати дію: дані рейтингу недоступні");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReview(parseInt(ratingId), parseInt(respondentId), {
        ratingId: rating.id,
        status,
        comments,
      });
      toast.success(
        status === "approved"
          ? "Рейтинг успішно схвалено! 🎉"
          : "Рейтинг відправлено на доопрацювання"
      );
      navigate("/ratings");
    } catch (error: any) {
      toast.error(error.message || "Сталася помилка при оновленні статусу рейтингу");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleExpand = (itemId: number) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  const calculateScores = () => {
    if (!rating?.responses) return { totalScore: 0, maxPossibleScore: 0 };
    
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    rating.responses.forEach((response: any) => {
      totalScore += response.score;
      maxPossibleScore += response.maxScore || 0;
    });
    
    return { totalScore, maxPossibleScore };
  };

  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <PhotoIcon className="h-5 w-5 text-indigo-600" />;
    } else if (extension === 'pdf') {
      return <DocumentIcon className="h-5 w-5 text-red-600" />;
    }
    return <DocumentMagnifyingGlassIcon className="h-5 w-5 text-indigo-600" />;
  };

  const getFileName = (doc: any) => {
    if (doc.title) return doc.title;
    
    const urlParts = doc.url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/;
    return fileName.replace(uuidRegex, '');
  };

  const { totalScore } = calculateScores();
  const completedResponses = rating?.responses ? rating.responses.filter((item: any) => item.documents && item.documents.length > 0).length : 0;
  const totalResponses = rating?.responses ? rating.responses.length : 0;
  const completionPercentage = totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-indigo-50 to-white">
        <div className="text-center">
          <Spinner size="large" color="primary"/>
          <p className="mt-4 text-indigo-700 font-medium animate-pulse">Завантаження даних...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-indigo-50 to-white">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <ExclamationCircleIcon className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Помилка</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/ratings")}
            className="w-full inline-flex justify-center items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Повернутися до списку рейтингів
          </button>
        </div>
      </div>
    );
  }

  if (!rating) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-indigo-50 to-white">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-6">
            <ExclamationTriangleIcon className="h-10 w-10 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Дані недоступні</h2>
          <p className="text-gray-600 mb-6">Не вдалося завантажити інформацію про рейтинг</p>
          <button
            onClick={() => navigate("/ratings")}
            className="w-full inline-flex justify-center items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Повернутися до списку рейтингів
          </button>
        </div>
      </div>
    );
  }

  if (rating.responses?.length === 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-10">
          <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-8 py-10 text-white">
            <div className="flex items-center">
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm mr-4">
                <ShieldCheckIcon className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Перевірка рейтингу</h1>
                <p className="text-white/80 text-lg font-medium line-clamp-1">{rating.name}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-6">
            <ExclamationTriangleIcon className="h-10 w-10 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Немає відповідей для перевірки</h2>
          <p className="text-gray-600 mb-6">Цей рейтинг не містить жодних відповідей для рецензування</p>
          <button
            onClick={() => navigate("/ratings")}
            className="inline-flex justify-center items-center px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Повернутися до списку рейтингів
          </button>
        </div>
      </div>
    );
  }

  return (
      <div className="max-w-5xl mx-auto">
      
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-10 transform transition-all hover:shadow-2xl">
          <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-8 py-10 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center">
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm mr-4">
                  <ShieldCheckIcon className="h-10 w-10" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">Перевірка рейтингу</h1>
                  <p className="text-white/80 text-lg font-medium line-clamp-1">{rating.name}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">

                <div className="bg-white/15 rounded-2xl px-5 py-4 text-white backdrop-blur-sm flex items-center flex-grow">
                  <div className="mr-4">
                    <div className="text-sm text-white/80 mb-1">Балів набрано</div>
                    <div className="text-2xl font-bold">
                      {totalScore}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center mt-6 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
              <div className="bg-white/15 p-3 rounded-xl backdrop-blur-sm mr-4">
                <UserCircleIcon className="h-10 w-10" />
              </div>
              <div>
                <p className="text-sm text-white/80">Респондент</p>
                <p className="text-xl font-semibold">
                  {rating?.respondent?.firstName} {rating?.respondent?.lastName}
                </p>
              </div>
              
              <div className="ml-auto flex items-center">
                <div className="mr-4">
                  <div className="text-sm text-white/80">Заповнено</div>
                  <div className="text-xl font-semibold">{completedResponses} / {totalResponses}</div>
                </div>
                <div className="relative">
                  <svg className="w-14 h-14" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3"></circle>
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeDasharray={`${completionPercentage} 100`}
                      strokeLinecap="round"
                      transform="rotate(-90 18 18)"
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                    {completionPercentage}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Show skeleton loading when content is loading */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {rating?.responses.map((response: any, index: number) => (
              <div
                key={response.itemId}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${
                  expandedItem === response.itemId ? "ring-2 ring-indigo-500" : "hover:shadow-xl"
                }`}
              >
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => toggleExpand(response.itemId)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center">
                      <span className="flex items-center justify-center w-10 h-10 bg-indigo-100 text-indigo-700 font-bold rounded-xl mr-4">
                        {index + 1}
                      </span>
                      <h3 className="text-lg font-bold text-gray-800">{response.itemName}</h3>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-indigo-100 text-indigo-800 font-bold rounded-xl px-5 py-2 flex items-center mr-4">
                        <span className="mr-1">Бал:</span>
                        <span className="text-xl">{response.score}</span>
                        <span className="text-sm text-gray-500 ml-1">/ {response.maxScore || "?"}</span>
                      </div>
                      <button 
                        className={`text-gray-500 hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50`}
                        aria-label={expandedItem === response.itemId ? "Згорнути" : "Розгорнути"}
                      >
                        <ChevronDownIcon 
                          className={`w-5 h-5 transform transition-transform ${expandedItem === response.itemId ? 'rotate-180' : ''}`} 
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {expandedItem === response.itemId && (
                  <div className="px-6 pb-6 pt-0 border-t border-gray-100 animate-fadeIn">
                    {response.documents && response.documents.length > 0 ? (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                          <DocumentTextIcon className="h-5 w-5 mr-2 text-indigo-500" />
                          Прикріплені документи
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {response.documents.map((doc: any) => (
                            <li key={doc.id}>
                              <a 
                                href={doc.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center p-3 bg-gray-50 hover:bg-indigo-50 rounded-lg border border-gray-200 transition-colors group"
                              >
                                <div className="p-2 bg-indigo-100 rounded-md group-hover:bg-indigo-200 transition-colors mr-3">
                                  {getFileIcon(doc.url)}
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 transition-colors truncate flex-1">
                                  {getFileName(doc)}
                                </span>
                                <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">
                                  Переглянути
                                </span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-100 flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 text-amber-500 mr-2" />
                        <span className="text-sm text-amber-700">Документи не прикріплено</span>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <svg className="h-4 w-4 mr-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Коментар рецензента
                      </label>
                      <Textarea
                        placeholder="Введіть ваш коментар щодо цього пункту..."
                        value={comments[response.itemId] || ""}
                        onChange={(e) =>
                          setComments((prev) => ({
                            ...prev,
                            [response.itemId]: e.target.value,
                          }))
                        }
                        className="border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-xl shadow-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-end sticky bottom-6 mb-8">
          <button 
            onClick={() => handleAction(RatingApprovalStatus.REVISION)} 
            type="button" 
            disabled={isSubmitting}
            className={`group flex items-center ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'} text-white justify-center py-3 px-6 rounded-xl shadow-lg transition-all`}
          >
            {isSubmitting ? (
              <Spinner size="small" color="danger" />
            ) : (
              <ArrowPathIcon className="h-5 w-5 mr-2 group-hover:animate-spin" />
            )}
            {isSubmitting ? 'Обробка...' : 'Повернути на доопрацювання'}
          </button>
          <button 
            onClick={() => handleAction(RatingApprovalStatus.APPROVED)} 
            type="button"
            disabled={isSubmitting}
            className={`${isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'} 
              text-white group flex items-center justify-center py-3 px-6 rounded-xl shadow-lg transition-all`}
          >
            {isSubmitting ? (
              <Spinner size="small" color="success" />
            ) : (
              <CheckCircleIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            )}
            {isSubmitting ? 'Обробка...' : 'Схвалити'}
          </button>
        </div>
      </div>
  );
};

// Skeleton component for loading state
const SkeletonCard = () => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 animate-pulse space-y-4">
    <div className="h-6 bg-gray-200 rounded-lg w-1/2"></div>
   
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded-md w-full"></div>
      <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
    </div>
   
    <div className="pt-2 flex justify-between items-center">
      <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
      <div className="h-3 w-16 bg-gray-200 rounded-md"></div>
    </div>
  </div>
);

export default ReviewRatingPage;