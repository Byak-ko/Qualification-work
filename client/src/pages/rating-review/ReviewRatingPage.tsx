import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRatingForReview, submitReview } from "../../services/api/ratings";
import { toast } from "react-toastify";
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
  ExclamationTriangleIcon,
  PhotoIcon,
  DocumentIcon,
  ExclamationCircleIcon,
  ClipboardDocumentCheckIcon,
  PencilIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import SkeletonCard from "../../components/ui/Skeleton";

const ReviewRatingPage = () => {
  const { ratingId, respondentId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<number, string>>({});
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchRating = async () => {
      if (!ratingId || !respondentId) {
        setError("Необхідні параметри не вказані в URL");
        setLoading(false);
        return;
      }

      try {
        const data = await getRatingForReview(parseInt(ratingId), parseInt(respondentId));
        console.log(data);
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

  const handleAction = async (status: RatingApprovalStatus.APPROVED | RatingApprovalStatus.PENDING) => {
    if (!rating || !ratingId || !respondentId) {
      toast.error("Неможливо виконати дію: дані рейтингу недоступні");
      return;
    }

    if (status === RatingApprovalStatus.PENDING) {
      const hasAnyComment = Object.values(comments).some(comment => comment.trim().length > 0);
      
      if (!hasAnyComment) {
        toast.error("Для повернення на доопрацювання необхідно додати хоча б один коментар");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await submitReview(parseInt(ratingId), parseInt(respondentId), {
        ratingId: rating.id,
        status,
        comments,
      });
      
      const message = status === RatingApprovalStatus.APPROVED
        ? "Рейтинг успішно схвалено! 🎉"
        : "Рейтинг відправлено на доопрацювання";
      
      toast.success(message, {
        icon: status === RatingApprovalStatus.APPROVED ? CheckCircleIcon : PencilIcon
      });
      
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

  const getFileIcon = (url: string) => {
    if (!url) return <DocumentIcon className="h-5 w-5 text-gray-500" />;
    
    const extension = url.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <PhotoIcon className="h-5 w-5 text-blue-500" />;
      case 'pdf':
        return <DocumentTextIcon className="h-5 w-5 text-red-500" />;
      default:
        return <DocumentIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileName = (doc: any) => {
    if (!doc || !doc.url) return "Документ";
    try {
      const url = doc.url;
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // Remove any UUID prefix if present (format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx-filename)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/;
      return fileName.replace(uuidRegex, '');
    } catch (e) {
      return "Документ";
    }
  };

  const formatScore = (score: number | string) => {
    // Convert to number and format with up to 2 decimal places when needed
    const num = typeof score === 'string' ? parseFloat(score) : score;
    return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
  };

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
    <div className="max-w-5xl mx-auto pb-20">
      {/* Інформаційна панель рейтингу */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-10 transform transition-all hover:shadow-2xl">
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 px-8 py-10 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center">
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm mr-4 shadow-lg">
                <ShieldCheckIcon className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">{rating.name}</h1>
                <p className="text-white/80 text-lg font-medium">Перевірка рейтингу</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center mt-6 p-4 bg-white/10 rounded-2xl backdrop-blur-sm shadow-lg">
            <div className="bg-white/15 p-3 rounded-xl backdrop-blur-sm mr-4">
              <UserCircleIcon className="h-10 w-10" />
            </div>
            <div>
              <p className="text-sm text-white/80">Респондент</p>
              <p className="text-xl font-semibold">
                {rating?.respondent?.firstName} {rating?.respondent?.lastName}
              </p>
            </div>
            
            <div className="ml-auto flex items-center bg-white/15 px-4 py-2 rounded-xl shadow-inner">
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

      {/* Картка з рейтингом */}
      <div className="bg-white p-6 rounded-3xl shadow-xl mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center border-b border-gray-100 pb-4">
          <ClipboardDocumentCheckIcon className="h-6 w-6 mr-2 text-indigo-600" />
          Форма перевірки
        </h2>

        {/* Show skeleton loading when content is loading */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {rating?.responses.map((response: any, index: number) => {
              // Parse scores as floats to support decimal values
              const score = parseFloat(response.score) || 0;
              const maxScore = parseFloat(response.maxScore) || 0;
              const hasMaxScore = maxScore > 0;
              const scorePercentage = hasMaxScore ? (score / maxScore) * 100 : 0;
              
              // Determine score background color based on percentage
              let scoreClass = "bg-indigo-100 text-indigo-800";
              if (hasMaxScore) {
                if (scorePercentage >= 90) {
                  scoreClass = "bg-green-100 text-green-800";
                } else if (scorePercentage >= 70) {
                  scoreClass = "bg-emerald-100 text-emerald-800";
                } else if (scorePercentage >= 50) {
                  scoreClass = "bg-yellow-100 text-yellow-800";
                } else if (scorePercentage >= 30) {
                  scoreClass = "bg-orange-100 text-orange-800";
                } else {
                  scoreClass = "bg-red-100 text-red-800";
                }
              }
              
              const hasDocuments = response.documents && response.documents.length > 0;
              
              return (
                <div
                  key={response.itemId}
                  className={`bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 ${
                    expandedItem === response.itemId 
                      ? "ring-2 ring-indigo-500 shadow-lg" 
                      : "border border-gray-100 hover:shadow-md"
                  }`}
                >
                  <div 
                    className={`px-6 py-5 cursor-pointer transition-colors ${
                      expandedItem === response.itemId ? "bg-indigo-50" : "hover:bg-gray-100"
                    }`}
                    onClick={() => toggleExpand(response.itemId)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center">
                        <span className="flex items-center justify-center w-12 h-12 bg-indigo-600 text-white font-bold rounded-xl mr-4 shadow-md">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{response.itemName}</h3>
                          {hasDocuments && (
                            <div className="flex items-center text-sm text-green-600 mt-1">
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              <span>{response.documents.length} документ(ів)</span>
                            </div>
                          )}
                          {response.comment && (
                            <div className="mt-2 bg-indigo-50 p-3 rounded-lg border border-indigo-200 flex items-start">
                              <InformationCircleIcon className="w-5 h-5 text-indigo-500 mr-2 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-indigo-800">{response.comment}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className={`${scoreClass} font-bold rounded-xl px-5 py-2 flex items-center mr-4 relative overflow-hidden shadow-sm`}>
                          {hasMaxScore && (
                            <div 
                              className="absolute inset-y-0 left-0 bg-current opacity-10"
                              style={{ width: `${scorePercentage}%` }}
                            ></div>
                          )}
                          <span className="mr-1 relative z-10">Бал:</span>
                          <span className="text-xl relative z-10">{formatScore(score)}</span>
                          {hasMaxScore && (
                            <span className="text-sm opacity-75 ml-1 relative z-10">/ {formatScore(maxScore)}</span>
                          )}
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
                    <div className="px-6 pb-6 pt-2 border-t border-gray-200 animate-fadeIn">
                      {/* Документи */}
                      {hasDocuments && (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                            <DocumentTextIcon className="h-5 w-5 mr-2 text-indigo-500" />
                            Прикріплені документи
                          </h4>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {response.documents.map((doc: any, index: number) => (
                              <li key={`doc-${response.itemId}-${index}-${doc.url}`}>
                                <a 
                                  href={`${backendUrl}${doc.url}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center p-3 bg-white hover:bg-indigo-50 rounded-lg border border-gray-200 transition-colors group"
                                >
                                  <div className="p-2 bg-indigo-100 rounded-md group-hover:bg-indigo-200 transition-colors mr-3">
                                    {getFileIcon(doc.url)}
                                  </div>
                                  <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 transition-colors truncate flex-1">
                                    {getFileName(doc)}
                                  </span>
                                  <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                    Переглянути
                                  </span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Поле коментаря */}
                      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1 text-indigo-500" />
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
                          rows={4}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Фіксована панель дій */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-lg border-t border-gray-200 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row gap-4 justify-end">
          <button 
            onClick={() => handleAction(RatingApprovalStatus.PENDING)} 
            type="button" 
            disabled={isSubmitting}
            className={`group flex items-center ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600'
            } text-white justify-center py-3 px-6 rounded-xl shadow-lg transition-all`}
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
            className={`${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
            } text-white group flex items-center justify-center py-3 px-6 rounded-xl shadow-lg transition-all`}
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
    </div>
  );
};

export default ReviewRatingPage;