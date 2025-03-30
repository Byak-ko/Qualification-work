import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRatingForReview, submitReview } from "../../services/api/ratings";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";
import Textarea from "../../components/ui/Textarea";
import Spinner from "../../components/ui/Spinner";
import { CheckCircleIcon, ArrowPathIcon, DocumentTextIcon, ShieldCheckIcon, UserCircleIcon } from "@heroicons/react/24/outline";

const ReviewRatingPage = () => {
  const { ratingId, respondentId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Record<number, string>>({});
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const data = await getRatingForReview(parseInt(ratingId!), parseInt(respondentId!));
        setRating(data);
        console.log(data);
      } catch (error) {
        toast.error("Не вдалося завантажити рейтинг");
      } finally {
        setLoading(false);
      }
    };
    fetchRating();
  }, [ratingId, respondentId]);

  const handleAction = async (status: "approved" | "revision") => {
    try {
      await submitReview(parseInt(ratingId!), parseInt(respondentId!), {
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

  const toggleExpand = (itemId: number) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-indigo-50 to-white">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-indigo-700 font-medium animate-pulse">Завантаження даних...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
            <div className="flex items-center mb-4">
              <ShieldCheckIcon className="h-8 w-8 mr-3" />
              <h1 className="text-3xl font-bold">Перевірка рейтингу</h1>
            </div>
            
            <div className="flex items-center mt-4 bg-white/10 rounded-lg p-4">
              <UserCircleIcon className="h-12 w-12 text-white mr-4" />
              <div>
                <p className="text-sm font-medium text-white/80">Респондент</p>
                <p className="text-xl font-semibold">
                  {rating?.respondent?.firstName} {rating?.respondent?.lastName}
                </p>
              </div>
              <div className="ml-auto bg-white/20 py-2 px-4 rounded-full">
                <span className="text-sm font-medium">ID: {respondentId}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {rating?.responses.map((response: any, index: number) => (
            <div
              key={response.itemId}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleExpand(response.itemId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-700 font-bold rounded-full mr-4">
                      {index + 1}
                    </span>
                    <h3 className="text-lg font-bold text-gray-800">{response.itemName}</h3>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-indigo-100 text-indigo-800 font-bold rounded-full px-4 py-2 flex items-center mr-4">
                      <span className="mr-1">Бал:</span>
                      <span className="text-xl">{response.score}</span>
                    </div>
                    <button className="text-gray-500 hover:text-indigo-600 transition-colors">
                      <svg className={`w-6 h-6 transform transition-transform ${expandedItem === response.itemId ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {expandedItem === response.itemId && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                  {response.documents.length > 0 && (
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
                                <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                              </div>
                              <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700 transition-colors truncate">
                                {doc.title || "Документ без назви"}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4">
                    <Textarea
                      label="Коментар рецензента"
                      value={comments[response.itemId] || ""}
                      onChange={(e) =>
                        setComments((prev) => ({
                          ...prev,
                          [response.itemId]: e.target.value,
                        }))
                      }
                      className="border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-end">
          <Button 
            onClick={() => handleAction("revision")} 
            type="button" 
            variant="danger"
            className="group flex items-center justify-center py-3 px-6 shadow-lg hover:shadow-xl transition-all"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2 group-hover:animate-spin" />
            Повернути на доопрацювання
          </Button>
          <Button 
            onClick={() => handleAction("approved")} 
            type="button"
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white group flex items-center justify-center py-3 px-6 shadow-lg hover:shadow-xl transition-all"
          >
            <CheckCircleIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
            Схвалити
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReviewRatingPage;