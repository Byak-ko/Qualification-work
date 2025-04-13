import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PencilIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import Button from '../components/ui/Button';
import { useAuth } from '../components/AuthProvider';
import SkeletonCard from '../components/ui/Skeleton';
import { Rating, RatingApprovalStatus, RatingParticipantStatus } from '../types/Rating';
import { getRatingsByUserId, completeRating, finalizeRating, fillRespondentRating} from '../services/api/ratings';

const RatingsPage: React.FC<{}> = ({ }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'author' | 'respondent' | 'reviewer'>('author');
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [authorRatings, setAuthorRatings] = useState<Rating[]>([]);
  const [respondentRatings, setRespondentRatings] = useState<Rating[]>([]);
  const [reviewerRatings, setReviewerRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const { currentUser } = useAuth();

  useEffect(() => {
    setIsTabVisible(false);
    setTimeout(() => setIsTabVisible(true), 10);
  }, [activeTab]);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    setIsLoading(true);
    try {
      const ratings = await getRatingsByUserId();
      console.log("Ratings: ", ratings);

      setAuthorRatings(ratings.ratingsAuthor);
      setRespondentRatings(ratings.ratingsRespondent);
      setReviewerRatings(ratings.ratingsReviewer);

    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRating = () => {
    navigate('/ratings/create');
  };

  const handleEditRating = (id: number) => {
    navigate(`/ratings/${id}/edit`);
  };

  const handleFillRating = (id: number) => {
    navigate(`/ratings/${id}/fill`);
  };

  const handleReviewRating = (ratingId: number, respondentId: number) => {
    navigate(`/ratings/${ratingId}/review/${respondentId}`);
  };

  const handleFillRespondentRating = async (id: number) => {
    try {
      await fillRespondentRating(id);
      await fetchRatings();
    } catch (error) {
      console.error('Error fill-send rating:', error);
    }
  };
  const handleCompleteRating = async (id: number) => {
    try {
      await completeRating(id);
      await fetchRatings();
    } catch (error) {
      console.error('Error complete rating:', error);
    }
  };

  const handleFinalizeRating = async (id: number) => {
    try {
      await finalizeRating(id);
      await fetchRatings();
    } catch (error) {
      console.error('Error finalizing rating:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'created':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'closed':
        return 'Завершено';
      case 'pending':
        return 'В процесі';
      case 'created':
        return 'Створено';
      default:
        return status;
    }
  };

  const getParticipantStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Очікує заповнення';
      case 'filled':
        return 'Заповнено';
      default:
        return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Науковий':
        return 'bg-purple-100 text-purple-800';
      case 'Навчально-методичний':
        return 'bg-indigo-100 text-indigo-800';
      case 'Організаційно-виховний':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return { label: 'Схвалено', color: 'bg-green-500', icon: <CheckCircleIcon className="h-4 w-4 text-green-500" /> };
      case 'rejected':
        return { label: 'Відхилено', color: 'bg-red-500', icon: <XCircleIcon className="h-4 w-4 text-red-500" /> };
      case 'revision':
        return { label: 'На перевірці', color: 'bg-blue-500', icon: <ClipboardDocumentCheckIcon className="h-4 w-4 text-blue-500" /> };
      case 'pending':
      default:
        return { label: 'Очікує перевірки', color: 'bg-yellow-500', icon: <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" /> };
    }
  };

  const getReviewButtonStatus = (rating: any, approvalStatus: RatingApprovalStatus, participantStatus: RatingParticipantStatus) => {
    if (rating.status === 'created') {
      return {
        disabled: true,
        label: 'Не затверджено',
        icon: <LockClosedIcon className="h-4 w-4" />
      };
    } else if (rating.status === 'closed') {
      return {
        disabled: true,
        label: 'Завершено',
        icon: <LockClosedIcon className="h-4 w-4" />
      };
    } else if (approvalStatus === 'approved') {
      return {
        disabled: true,
        label: 'Перевірено',
        icon: <CheckCircleIcon className="h-4 w-4" />
      };
    } else if (approvalStatus === 'pending' && participantStatus === 'pending') {
      return {
        disabled: true,
        label: 'Очікує заповнення',
        icon: <LockClosedIcon className="h-4 w-4" />
      };
    } else if (approvalStatus === 'pending' && participantStatus === 'filled') {
      return {
        disabled: true,
        label: 'Очікує перевірки', // TODO: change label
        icon: <LockClosedIcon className="h-4 w-4" />
      };
    } else {
      return {
        disabled: false,
        label: 'Перевірити',
        icon: <ClipboardDocumentCheckIcon className="h-4 w-4" />
      };
    }
  };

  const renderDisabledReason = (rating: any, tabType: 'author' | 'respondent') => {
    if (tabType === 'author') {
      if (rating.status === 'closed') {
        return (
          <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
            <LockClosedIcon className="h-4 w-4" />
            Рейтинг завершено і не може бути відредаговано
          </div>
        );
      } else if (rating.status === 'pending') {
        return (
          <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
            <LockClosedIcon className="h-4 w-4" />
            Рейтинг знаходиться в процесі заповнення
          </div>
        );
      }
    } else if (tabType === 'respondent') {
      if (rating.status !== 'pending') {
        return (
          <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
            <LockClosedIcon className="h-4 w-4" />
            {rating.status === 'created' ? 'Рейтинг ще не затверджено' : 'Рейтинг закрито для заповнення'}
          </div>
        );
      } else if (rating.participantStatus !== 'pending' && rating.participantStatus !== 'revision') {
        return (
          <div className="flex items-center gap-2 mt-3 text-gray-500 text-sm">
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
            Ви вже заповнили цей рейтинг
          </div>
        );
      }
    }
    return null;
  };

  const renderEmptyState = (tabType: 'author' | 'respondent' | 'reviewer') => {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm">
        <DocumentTextIcon className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-500">Немає рейтингів</h3>
        <p className="text-gray-400 mt-2 text-center">
          У вас поки що немає рейтингів у цій категорії
        </p>
        {tabType === 'author' && currentUser?.isAuthor && (
          <Button
            variant="primary"
            className="mt-6 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2"
            onClick={handleCreateRating}
          >
            <PlusIcon className="h-4 w-4" />
            Створити рейтинг
          </Button>
        )}
      </div>
    );
  };

  const filteredReviewerRatings = useMemo(() => {
    if (!reviewerRatings) return [];

    return reviewerRatings
      .filter(rating =>
        filterStatus ? rating.status === filterStatus : true
      )
      .map(rating => ({
        ...rating,
        participants: rating.participants?.filter(participant =>
          (participant.firstName + ' ' + participant.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
          (participant.department?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
        ) || []
      }))
      .filter(rating => rating.participants.length > 0 || searchQuery === '');
  }, [reviewerRatings, searchQuery, filterStatus]);

  const hasFilteredReviewerData = useMemo(() => {
    return reviewerRatings && reviewerRatings.length > 0;
  }, [reviewerRatings]);

  const hasFilteredResults = useMemo(() => {
    return filteredReviewerRatings && filteredReviewerRatings.length > 0;
  }, [filteredReviewerRatings]);

  const renderReviewerRatingsList = () => {
    if (!hasFilteredReviewerData) {
      return renderEmptyState('reviewer');
    }

    const renderSearchFilters = () => (
      <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Пошук за ім'ям або відділом..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="appearance-none pl-4 pr-10 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            value={filterStatus || ''}
            onChange={(e) => setFilterStatus(e.target.value || null)}
          >
            <option value="">Всі статуси</option>
            <option value="created">Створені</option>
            <option value="pending">В процесі</option>
            <option value="closed">Завершені</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <FunnelIcon className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    );

    return (
      <div className="space-y-6">
        {renderSearchFilters()}

        {hasFilteredResults ? (
          filteredReviewerRatings.map((rating) => (
            <div
              key={rating.id}
              className="bg-white rounded-2xl shadow-sm transition-all hover:shadow-md border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex flex-col">
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{rating.title}</h3>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(rating.status)}`}>
                        {getStatusLabel(rating.status)}
                      </span>
                      <span className={`text-sm px-3 py-1 rounded-full font-medium ${getTypeColor(rating.type)}`}>
                        {rating.type}
                      </span>
                      <span className="text-sm text-gray-600 flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-1 text-gray-500" />
                        {rating.endedAt ? new Date(rating.endedAt).toLocaleDateString('uk-UA', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'Не вказано'}
                      </span>
                      <span className="text-sm text-gray-600">
                        {rating.participants.length} респондентів
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-1">
                {rating.participants && rating.participants.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {rating.participants.map((participant) => {
                      const statusInfo = getApprovalStatusInfo(participant.approvalStatus);
                      const buttonStatus = getReviewButtonStatus(rating, participant.approvalStatus, participant.participantStatus);

                      return (
                        <div
                          key={participant.id}
                          className="flex justify-between items-center px-5 py-3 hover:bg-gray-100 transition-colors rounded-md"
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {participant.firstName.charAt(0)}{participant.lastName.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-800">{participant.firstName} {participant.lastName}</p>
                              {participant.department && (
                                <p className="text-xs text-gray-500 flex items-center">
                                  <span className="w-1 h-1 bg-gray-400 rounded-full mr-1"></span>
                                  {participant.department.name}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 text-sm">
                              {statusInfo.icon}
                              <span className="hidden sm:inline text-gray-600">{statusInfo.label}</span>
                            </div>
                            <Button
                              variant="secondary"
                              size="sm"
                              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm ${buttonStatus.disabled
                                ? 'opacity-60 cursor-not-allowed'
                                : 'hover:bg-indigo-50 hover:text-indigo-600'
                                }`}
                              disabled={buttonStatus.disabled}
                              onClick={() => !buttonStatus.disabled && handleReviewRating(rating.id, participant.id)}
                            >
                              {buttonStatus.icon}
                              <span>{buttonStatus.label}</span>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-sm text-gray-500 italic">
                    Немає респондентів, що відповідають критеріям пошуку
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">Немає результатів пошуку</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-4">
              За вашим запитом не знайдено жодного рейтингу або респондента. Спробуйте змінити параметри пошуку або фільтрації.
            </p>
            {(searchQuery || filterStatus) && (
              <div className="flex justify-center gap-3">
                {searchQuery && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-4 py-2"
                    onClick={() => setSearchQuery('')}
                  >
                    Очистити пошук
                  </Button>
                )}
                {filterStatus && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl px-4 py-2"
                    onClick={() => setFilterStatus(null)}
                  >
                    Скинути фільтр
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderRatingsList = (ratings: Rating[], tabType: 'author' | 'respondent') => {
    if (ratings.length === 0) {
      return renderEmptyState(tabType);
    }

    return ratings.map((rating) => (
      <div
        key={rating.id}
        className={`bg-white rounded-2xl shadow-sm p-6 transition-all hover:shadow-md border border-gray-100 ${(tabType === 'author' && rating.status !== 'created') ||
          (tabType === 'respondent' && (rating.status !== 'pending' || (rating.participantStatus !== 'pending' && rating.participantStatus !== 'revision')))
          ? 'opacity-90' : ''
          }`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{rating.title}</h3>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${getStatusColor(rating.status)}`}>
                {getStatusLabel(rating.status)}
              </span>
              {tabType === 'respondent' && rating.participantStatus && (
                <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${rating.participantStatus === 'pending' || rating.participantStatus === 'revision' ? 'bg-yellow-100 text-yellow-800' :
                  rating.participantStatus === 'filled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                  {getParticipantStatusLabel(rating.participantStatus)}
                </span>
              )}
              <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${getTypeColor(rating.type)}`}>
                {rating.type}
              </span>
              <span className="text-sm text-gray-600 flex items-center">
                <CalendarDaysIcon className="h-4 w-4 mr-1 text-gray-500" />
                {rating.endedAt ? new Date(rating.endedAt).toLocaleDateString('uk-UA', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'Не вказано'}
              </span>
            </div>

            {/* Відображення причини недоступності */}
            {renderDisabledReason(rating, tabType)}
          </div>

          <div className="flex gap-2 mt-4 sm:mt-0">
            {tabType === 'author' && rating.status === 'created' && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2 rounded-xl px-4 py-2 hover:bg-indigo-50 transition-colors text-indigo-700"
                  onClick={() => handleEditRating(rating.id)}
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Редагувати</span>
                </Button>
                <Button
                  variant="green"
                  size="sm"
                  onClick={() => handleCompleteRating(rating.id)}
                  className="flex items-center gap-1"
                >
                  <PencilIcon className="h-4 w-4" />
                  Затвердити
                </Button>
              </div>
            )}
            {tabType === 'author' && rating.status !== 'closed' && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleFinalizeRating(rating.id)}
                className="flex items-center gap-1 bg-gradient-to-r from-green-600 to-green-500"
              >
                <CheckIcon className="h-4 w-4" />
                Закрити рейтинг
              </Button>
            )}


            {tabType === 'respondent' && (
              <Button
                variant="secondary"
                size="sm"
                disabled={rating.status !== 'pending' || (rating.participantStatus !== 'pending' && rating.participantStatus !== 'revision')}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 ${rating.status === 'pending' && (rating.participantStatus === 'pending' || rating.participantStatus === 'revision')
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                onClick={() => {
                  if (rating.status === 'pending' && (rating.participantStatus === 'pending' || rating.participantStatus === 'revision')) {
                    handleFillRating(rating.id);
                  }
                }}
              >
                <DocumentTextIcon className="h-4 w-4" />
                <span>Заповнити</span>
              </Button>
            )}
            {tabType === 'respondent' && (
              <Button
                variant="secondary"
                size="sm"
                disabled={rating.participantStatus == 'filled'}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 ${rating.status === 'pending' && (rating.participantStatus === 'pending' || rating.participantStatus === 'revision')
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                onClick={() => {
                  if (rating.status === 'pending' && (rating.participantStatus === 'pending' || rating.participantStatus === 'revision')) {
                    handleFillRespondentRating(rating.id);
                  }
                }}
              >
                <DocumentTextIcon className="h-4 w-4" />
                <span>Надіслати на перевірку</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    ));
  };

  // Tab data for a more dynamic approach
  const tabs = [
    { id: 'author', label: 'Автор', icon: <PencilIcon className="h-5 w-5" /> },
    { id: 'respondent', label: 'Респондент', icon: <UserGroupIcon className="h-5 w-5" /> },
    { id: 'reviewer', label: 'Рецензент', icon: <ClipboardDocumentCheckIcon className="h-5 w-5" /> }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8 px-6 py-10">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-b from-indigo-100 to-purple-100 rounded-full -mr-32 -mt-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                Мої рейтинги
              </h1>
              <Button
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors bg-transparent hover:bg-gray-100 rounded-lg p-2"
                onClick={fetchRatings}
              >
                <ArrowPathIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Оновити</span>
              </Button>
            </div>
            <p className="text-gray-600 max-w-2xl">
              Перегляд ваших рейтингів у різних ролях. Виберіть категорію для перегляду відповідних результатів.
            </p>

            {/* Stats summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-indigo-50 rounded-xl p-4 flex items-center group hover:bg-indigo-100 transition-colors cursor-pointer" onClick={() => setActiveTab('author')}>
                <div className="bg-indigo-100 p-3 rounded-lg mr-4 group-hover:bg-indigo-200 transition-colors">
                  <PencilIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-indigo-600 font-semibold">{authorRatings.length}</p>
                  <p className="text-sm text-indigo-800">Створено рейтингів</p>
                </div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 flex items-center group hover:bg-purple-100 transition-colors cursor-pointer" onClick={() => setActiveTab('respondent')}>
                <div className="bg-purple-100 p-3 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
                  <UserGroupIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-purple-600 font-semibold">{respondentRatings.length}</p>
                  <p className="text-sm text-purple-800">Участь у рейтингах</p>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 flex items-center group hover:bg-amber-100 transition-colors cursor-pointer" onClick={() => setActiveTab('reviewer')}>
                <div className="bg-amber-100 p-3 rounded-lg mr-4 group-hover:bg-amber-200 transition-colors">
                  <ClipboardDocumentCheckIcon className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-amber-600 font-semibold">{reviewerRatings.length}</p>
                  <p className="text-sm text-amber-800">Рецензовано рейтингів</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl p-1 flex mb-6 shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 font-medium transition-all ${activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
                }`}
              onClick={() => setActiveTab(tab.id as 'author' | 'respondent' | 'reviewer')}
            >
              {React.cloneElement(tab.icon, {
                className: `h-5 w-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`
              })}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content with Tailwind transitions */}
        <div className="space-y-4">
          {activeTab === 'author' && (
            <div className={`transition-all duration-300 ease-out transform ${isTabVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
              } space-y-4`}>
              {renderRatingsList(authorRatings, 'author')}
            </div>
          )}
          {activeTab === 'respondent' && (
            <div className={`transition-all duration-300 ease-out transform ${isTabVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
              } space-y-4`}>
              {renderRatingsList(respondentRatings, 'respondent')}
            </div>
          )}
          {activeTab === 'reviewer' && (
            <div className={`transition-all duration-300 ease-out transform ${isTabVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
              } space-y-4`}>
              {renderReviewerRatingsList()}
            </div>
          )}
        </div>

        {/* Create new button (shown only for author tab and if user.isAuthor is true) */}
        {activeTab === 'author' && currentUser?.isAuthor && (
          <div className="fixed bottom-8 right-8 z-10">
            <Button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full py-3 px-6 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              onClick={handleCreateRating}
            >
              <PlusIcon className="h-5 w-5" />
              Створити новий
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingsPage;