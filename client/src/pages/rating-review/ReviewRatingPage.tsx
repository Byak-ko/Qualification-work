import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import SkeletonCard from "../../components/ui/Skeleton";
import Button from "../../components/ui/Button";

const ReviewRatingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ratingId = searchParams.get("ratingId");
  const respondentId = searchParams.get("respondentId");

  useEffect(() => {
    if (!ratingId || !respondentId || isNaN(Number(ratingId)) || isNaN(Number(respondentId))) {
      navigate("/ratings");
    }
  }, [ratingId, respondentId, navigate]);

  const [rating, setRating] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<number, string>>({});
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

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
      const hasAnyComment = Object.values(comments).some((comment) => comment.trim().length > 0);

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
      const message =
        status === RatingApprovalStatus.APPROVED
          ? "Рейтинг успішно схвалено!"
          : "Рейтинг відправлено на доопрацювання";

      toast.success(message, {
        icon: status === RatingApprovalStatus.APPROVED ? CheckCircleIcon : PencilIcon,
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

    const extension = url.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <PhotoIcon className="h-5 w-5 text-blue-500" />;
      case "pdf":
        return <DocumentTextIcon className="h-5 w-5 text-red-500" />;
      default:
        return <DocumentIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFileName = (doc: any) => {
    if (!doc || !doc.url) return "Документ";
    try {
      const url = doc.url;
      const urlParts = url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/;
      return fileName.replace(uuidRegex, "");
    } catch (e) {
      return "Документ";
    }
  };

  const formatScore = (score: number | string) => {
    const num = typeof score === "string" ? parseFloat(score) : score;
    return num % 1 === 0 ? num.toFixed(0) : num.toFixed(2);
  };

  const completedResponses = rating?.responses
    ? rating.responses.filter((item: any) => item.documents && item.documents.length > 0).length
    : 0;
  const totalResponses = rating?.responses ? rating.responses.length : 0;
  const completionPercentage = totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-indigo-100 to-purple-50">
        <div className="text-center">
          <Spinner size="large" color="primary" />
          <p className="mt-4 text-indigo-700 font-medium animate-pulse">Завантаження даних...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-indigo-100 to-purple-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <ExclamationCircleIcon className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Помилка</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            variant="primary"
            size="md"
            className="w-full rounded-lg"
            onClick={() => navigate("/ratings")}
          >
            Повернутися до списку рейтингів
          </Button>
        </div>
      </div>
    );
  }

  if (!rating) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-indigo-100 to-purple-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-6">
            <ExclamationTriangleIcon className="h-10 w-10 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Дані недоступні</h2>
          <p className="text-gray-600 mb-6">Не вдалося завантажити інформацію про рейтинг</p>
          <Button
            variant="primary"
            size="md"
            className="w-full rounded-lg"
            onClick={() => navigate("/ratings")}
          >
            Повернутися до списку рейтингів
          </Button>
        </div>
      </div>
    );
  }

  if (rating.responses?.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
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
          <Button
            variant="primary"
            size="md"
            className="rounded-lg"
            onClick={() => navigate("/ratings")}
          >
            Повернутися до списку рейтингів
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pb-20">
      <div className="bg-white/90 rounded-3xl shadow-xl overflow-hidden mb-10 transform transition-all hover:shadow-2xl backdrop-blur-sm">
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 px-6 py-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md mr-6 shadow-lg">
                <ShieldCheckIcon className="h-10 w-10 text-indigo-100" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold mb-1 line-clamp-1">{rating.name}</h1>
                <p className="text-white/80 text-lg font-semibold">Перевірка рейтингу</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md shadow-inner">
                <UserCircleIcon className="h-8 w-8 text-indigo-100" />
              </div>
              <div>
                <p className="text-sm text-white/80">Респондент</p>
                <p className="text-lg font-medium">
                  {rating?.respondent?.firstName} {rating?.respondent?.lastName}
                </p>
              </div>
              <div className="ml-6 bg-white/20 p-3 rounded-xl shadow-inner flex items-center gap-2">
                <div className="text-sm text-white/80">Заповнено</div>
                <div className="text-lg font-medium">
                  {completedResponses} / {totalResponses}
                </div>
                <div className="relative w-12 h-12">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
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
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                    {completionPercentage}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/90 p-6 rounded-3xl shadow-xl mb-8 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center border-b-2 border-indigo-100 pb-4">
          <ClipboardDocumentCheckIcon className="h-6 w-6 mr-2 text-indigo-600" />
          Форма перевірки
        </h2>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {rating?.responses.map((response: any, index: number) => {
              const score = parseFloat(response.score) || 0;
              const maxScore = parseFloat(response.maxScore) || 0;
              const hasMaxScore = maxScore > 0;
              const scorePercentage = hasMaxScore ? (score / maxScore) * 100 : 0;

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
                  className={`bg-gray-50 rounded-2xl overflow-hidden transition-all duration-300 ${expandedItem === response.itemId ? "ring-2 ring-indigo-500 shadow-xl" : "border border-gray-200 hover:shadow-lg"
                    }`}
                >
                  <div
                    className={`px-6 py-4 cursor-pointer transition-colors ${expandedItem === response.itemId ? "bg-indigo-50" : "hover:bg-gray-100"}`}
                    onClick={() => toggleExpand(response.itemId)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center justify-center w-10 h-10 bg-indigo-600 text-white font-bold rounded-lg shadow-md">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1 break-words">{response.itemName}</h3>
                          {hasDocuments && (
                            <div className="flex items-center text-sm text-green-600 mt-1">
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              <span>{response.documents.length} документ(ів)</span>
                            </div>
                          )}
                          {response.comment && (
                            <div className="mt-2 bg-indigo-50 p-2 rounded-lg border border-indigo-200 flex items-start text-sm">
                              <InformationCircleIcon className="w-4 h-4 text-indigo-500 mr-2 mt-0.5" />
                              <p className="text-indigo-800">{response.comment}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`${scoreClass} font-bold rounded-lg px-3 py-1 flex items-center justify-center shadow-sm min-w-[130px] text-center`}>
                          <span className="text-sm">Бал:</span>
                          <span className="text-base ml-1">{formatScore(score)}</span>
                          {hasMaxScore && (
                            <span className="text-xs opacity-75 ml-0.5">/ {formatScore(maxScore)}</span>
                          )}
                        </div>
                        <Button
                          variant="icon-secondary"
                          size="sm"
                          icon={<ChevronDownIcon className={`w-5 h-5 ${expandedItem === response.itemId ? "rotate-180" : ""}`} />}
                          className="p-2 bg-transparent hover:bg-gray-200 rounded-full"
                          onClick={() => toggleExpand(response.itemId)}
                          aria-label={expandedItem === response.itemId ? "Згорнути" : "Розгорнути"}
                        />
                      </div>
                    </div>
                  </div>

                  {expandedItem === response.itemId && (
                    <div className="px-6 pb-6 pt-3 border-t border-gray-100 animate-fadeIn">
                      {hasDocuments && (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
                            <DocumentTextIcon className="h-5 w-5 mr-2 text-indigo-500" />
                            Прикріплені документи
                          </h4>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {response.documents.map((doc: any, index: number) => (
                              <li key={`doc-${response.itemId}-${index}-${doc.url}`}>
                                <a
                                  href={`${backendUrl}${doc.url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center p-3 bg-white hover:bg-indigo-50 rounded-xl border border-gray-200 transition-colors shadow-sm hover:shadow-md"
                                >
                                  <div className="p-2 bg-indigo-100 rounded-md mr-3">
                                    {getFileIcon(doc.url)}
                                  </div>
                                  <span className="text-sm font-medium text-gray-700 truncate flex-1">
                                    {getFileName(doc)}
                                  </span>
                                  <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Переглянути
                                  </span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

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
                          className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-200 rounded-xl shadow-sm transition-all"
                          rows={4}
                          maxLength={500}
                          style={{ maxHeight: "150px", overflowY: "auto" }}
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

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-2xl border-t border-gray-100 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-center">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="danger"
              size="lg"
              icon={<ArrowPathIcon className="h-5 w-5" />}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              onClick={() => handleAction(RatingApprovalStatus.PENDING)}
              className="bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-semibold rounded-xl px-6 py-3 transition-all"
            >
              Повернути на доопрацювання
            </Button>
            <Button
              variant="green"
              size="lg"
              icon={<CheckCircleIcon className="h-5 w-5" />}
              isLoading={isSubmitting}
              disabled={isSubmitting}
              onClick={() => handleAction(RatingApprovalStatus.APPROVED)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl px-6 py-3 transition-all"
            >
              Схвалити
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewRatingPage;