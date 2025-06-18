import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PencilIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  PlusIcon,
  LockClosedIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import Button from '../components/ui/Button';
import ConfirmModal from '../components/ConfirmModal';
import { useAuth } from '../components/AuthProvider';
import SkeletonCard from '../components/ui/Skeleton';
import { Rating, RatingApprovalStatus, RatingParticipantStatus } from '../types/Rating';
import { getRatingsByUserId, submitRating, finalizeRating, fillRespondentRating } from '../services/api/ratings';

const RatingsPage: React.FC<{}> = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'author' | 'respondent' | 'reviewer'>('author');
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [authorRatings, setAuthorRatings] = useState<Rating[]>([]);
  const [respondentRatings, setRespondentRatings] = useState<Rating[]>([]);
  const [reviewerRatings, setReviewerRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({});
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'danger' | 'success';
    onSubmit: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onSubmit: () => { },
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

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
      console.log('Fetched ratings:', ratings);
      setAuthorRatings(ratings.ratingsAuthor);
      setRespondentRatings(ratings.ratingsRespondent);
      setReviewerRatings(ratings.ratingsReviewer);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRating = async () => {
    setLoadingStates((prev) => ({ ...prev, createRating: true }));
    try {
      navigate('/ratings/create');
    } finally {
      setLoadingStates((prev) => ({ ...prev, createRating: false }));
    }
  };

  const handleEditRating = (id: number) => {
    setLoadingStates((prev) => ({ ...prev, [`editRating_${id}`]: true }));
    try {
      navigate(`/ratings/edit?id=${id}`);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`editRating_${id}`]: false }));
    }
  };

  const handleFillRating = (id: number) => {
    setLoadingStates((prev) => ({ ...prev, [`fillRating_${id}`]: true }));
    try {
      navigate(`/ratings/fill?id=${id}`);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`fillRating_${id}`]: false }));
    }
  };

  const handleReviewRating = (ratingId: number, respondentId: number) => {
    setLoadingStates((prev) => ({ ...prev, [`reviewRating_${ratingId}_${respondentId}`]: true }));
    try {
      navigate(`/ratings/review?ratingId=${ratingId}&respondentId=${respondentId}`);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`reviewRating_${ratingId}_${respondentId}`]: false }));
    }
  };

  const handleFillRespondentRating = async (id: number) => {
    setLoadingStates((prev) => ({ ...prev, [`fillRespondentRating_${id}`]: true }));
    try {
      await fillRespondentRating(id);
      toast.success('Рейтинг успішно надіслано на перевірку!');
      await fetchRatings();
    } catch (error) {
      toast.error('Не вдалося надіслати рейтинг на перевірку. Спробуйте ще раз.');
      console.error('Error fill-send rating:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`fillRespondentRating_${id}`]: false }));
    }
  };

  const handleSubmitRating = async (id: number) => {
    setLoadingStates((prev) => ({ ...prev, [`submitRating_${id}`]: true }));
    try {
      await submitRating(id);
      await fetchRatings();
      toast.success('Рейтинг успішно затверджено!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Не вдалося затвердити рейтинг. Спробуйте ще раз.');
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`submitRating_${id}`]: false }));
    }
  };

  const handleFinalizeRating = async (id: number) => {
    setLoadingStates((prev) => ({ ...prev, [`finalizeRating_${id}`]: true }));
    try {
      await finalizeRating(id);
      await fetchRatings();
      toast.success('Рейтинг успішно закрито!');
    } catch (error) {
      toast.error('Не вдалося закрити рейтинг. Спробуйте ще раз.');
      console.error('Error finalizing rating:', error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`finalizeRating_${id}`]: false }));
    }
  };

  const handleViewReport = (id: number) => {
    setLoadingStates((prev) => ({ ...prev, [`viewReport_${id}`]: true }));
    try {
      navigate(`/reports?ratingId=${id}`);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [`viewReport_${id}`]: false }));
    }
  };

  const openConfirmModal = (
    title: string,
    message: string,
    type: 'info' | 'danger' | 'success',
    onSubmit: () => Promise<void>
  ) => {
    setModalState({
      isOpen: true,
      title,
      message,
      type,
      onSubmit: async () => {
        try {
          await onSubmit();
          closeConfirmModal();
        } catch (error) {
        }
      },
    });
  };

  const closeConfirmModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirmFillRespondentRating = (id: number) => {
    openConfirmModal(
      'Надіслати на перевірку',
      'Ви впевнені, що хочете надіслати цей рейтинг на перевірку? Після відправки зміни будуть неможливі.',
      'info',
      async () => handleFillRespondentRating(id)
    );
  };

  const handleConfirmCompleteRating = (id: number) => {
    openConfirmModal(
      'Затвердити рейтинг',
      'Ви впевнені, що хочете затвердити цей рейтинг? Це дозволить респондентам почати заповнення.',
      'success',
      async () => handleSubmitRating(id)
    );
  };

  const handleConfirmFinalizeRating = (id: number) => {
    openConfirmModal(
      'Закрити рейтинг',
      'Ви впевнені, що хочете закрити цей рейтинг? Після закриття подальші зміни будуть неможливі.',
      'danger',
      async () => handleFinalizeRating(id)
    );
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
      case 'revision':
        return 'На доопрацюванні';
      case 'approved':
        return 'Підтверджено';
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

  const getReviewButtonStatus = (rating: Rating, approvalStatus: RatingApprovalStatus, participantStatus: RatingParticipantStatus) => {
    if (rating.status === 'created' || rating.status === 'closed' || approvalStatus === 'approved' ||
      (approvalStatus === 'pending' && (participantStatus === 'pending' || participantStatus === 'filled'))) {
      return {
        disabled: true,
        label: 'Перевірити',
        icon: <ClipboardDocumentCheckIcon className="h-4 w-4" />
      };
    }
    return {
      disabled: false,
      label: 'Перевірити',
      icon: <ClipboardDocumentCheckIcon className="h-4 w-4" />
    };
  };

  const renderDisabledReason = (rating: Rating, tabType: 'author' | 'respondent') => {
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

  const renderEmptyState = () => {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm">
        <DocumentTextIcon className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-500">Немає рейтингів</h3>
        <p className="text-gray-400 mt-2 text-center">
          У вас поки що немає рейтингів у цій категорії
        </p>
      </div>
    );
  };

  const filterRatings = (ratings: Rating[]) => {
    return ratings.filter((rating) => {
      const matchesTitle = rating.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus ? rating.status === selectedStatus : true;
      return matchesTitle && matchesStatus;
    });
  };

  const filterReviewerRatings = (ratings: Rating[]) => {
    return ratings
      .map((rating) => {
        const matchesTitle = rating.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = rating.type.toLowerCase().includes(searchQuery.toLowerCase());

        const participants = rating.participants?.filter((participant) => {
          const buttonStatus = getReviewButtonStatus(rating, participant.approvalStatus, participant.participantStatus);
          if (matchesTitle || matchesType) {
            return !buttonStatus.disabled; 
          }
          const matchesName = searchQuery
            ? `${participant.firstName} ${participant.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
          return !buttonStatus.disabled && matchesName;
        }) || [];

        return { ...rating, participants };
      })
      .filter((rating) => {
        const matchesStatus = selectedStatus ? rating.status === selectedStatus : true;
        return rating.participants.length > 0 && matchesStatus;
      });
  };

  const renderReviewerRatingsList = () => {
    const filteredRatings = filterReviewerRatings(reviewerRatings);
    if (filteredRatings.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-6">
        {filteredRatings.map((rating) => (
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
              {rating.participants.map((participant) => {
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
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm hover:bg-indigo-50 hover:text-indigo-600"
                        onClick={() => handleReviewRating(rating.id, participant.id)}
                        isLoading={loadingStates[`reviewRating_${rating.id}_${participant.id}`]}
                        icon={buttonStatus.icon}
                      >
                        {buttonStatus.label}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRatingsList = (ratings: Rating[], tabType: 'author' | 'respondent') => {
    const filteredRatings = filterRatings(ratings);
    if (filteredRatings.length === 0) {
      return renderEmptyState();
    }

    return (
      <div className="space-y-6">
        {filteredRatings.map((rating) => (
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
                {renderDisabledReason(rating, tabType)}
              </div>

              <div className="flex gap-2 mt-4 sm:mt-0">
                {tabType === 'author' && (
                  <>
                    {rating.status === 'created' && (
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex items-center gap-2 rounded-xl px-4 py-2 hover:bg-indigo-50 transition-colors text-indigo-700"
                          onClick={() => handleEditRating(rating.id)}
                          isLoading={loadingStates[`editRating_${rating.id}`]}
                          icon={<PencilIcon className="h-4 w-4" />}
                        >
                          Редагувати
                        </Button>
                        <Button
                          variant="green"
                          size="sm"
                          onClick={() => handleConfirmCompleteRating(rating.id)}
                          className="flex items-center gap-1"
                          isLoading={loadingStates[`completeRating_${rating.id}`]}
                          icon={<CheckIcon className="h-4 w-4" />}
                        >
                          Затвердити
                        </Button>
                      </div>
                    )}
                    {rating.status === 'pending' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleConfirmFinalizeRating(rating.id)}
                        className="flex items-center gap-1 bg-gradient-to-r from-red-600 to-red-500"
                        isLoading={loadingStates[`finalizeRating_${rating.id}`]}
                        icon={<CheckIcon className="h-4 w-4" />}
                      >
                        Закрити рейтинг
                      </Button>
                    )}
                    {rating.status !== 'created' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2 rounded-xl px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700"
                        onClick={() => handleViewReport(rating.id)}
                        isLoading={loadingStates[`viewReport_${rating.id}`]}
                        icon={<ChartBarIcon className="h-4 w-4" />}
                      >
                        Звіт по рейтингу
                      </Button>
                    )}
                  </>
                )}
                {tabType === 'respondent' && (
                  <>
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
                      isLoading={loadingStates[`fillRating_${rating.id}`]}
                      icon={<DocumentTextIcon className="h-4 w-4" />}
                    >
                      Заповнити
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={rating.participantStatus === 'filled' || rating.participantStatus === 'approved'}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2 ${rating.status === 'pending' && (rating.participantStatus === 'pending' || rating.participantStatus === 'revision')
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      onClick={() => {
                        if (rating.status === 'pending' && (rating.participantStatus === 'pending' || rating.participantStatus === 'revision')) {
                          handleConfirmFillRespondentRating(rating.id);
                        }
                      }}
                      isLoading={loadingStates[`fillRespondentRating_${rating.id}`]}
                      icon={<DocumentTextIcon className="h-4 w-4" />}
                    >
                      Надіслати на перевірку
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

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
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-b from-indigo-100 to-purple-100 rounded-full -mr-32 -mt-32 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                Мої рейтинги
              </h1>
              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  onClick={fetchRatings}
                >
                  <ArrowPathIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Оновити</span>
                </Button>
                {currentUser?.isAuthor && (
                  <Button
                    variant="primary"
                    onClick={handleCreateRating}
                    isLoading={loadingStates.createRating}
                    icon={<PlusIcon className="h-4 w-4" />}
                  >
                    Створити рейтинг
                  </Button>
                )}
              </div>
            </div>
            <p className="text-gray-600 max-w-2xl">
              Перегляд ваших рейтингів у різних ролях. Виберіть категорію для перегляду відповідних результатів.
            </p>
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
                  <p className="text-sm text-purple-800">Рейтингів до заповнення</p>
                </div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 flex items-center group hover:bg-amber-100 transition-colors cursor-pointer" onClick={() => setActiveTab('reviewer')}>
                <div className="bg-amber-100 p-3 rounded-lg mr-4 group-hover:bg-amber-200 transition-colors">
                  <ClipboardDocumentCheckIcon className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-amber-600 font-semibold">{reviewerRatings.length}</p>
                  <p className="text-sm text-amber-800">Рейтингів до перегляду</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Пошук за назвою, типом або іменем..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Всі статуси</option>
              <option value="created">Створено</option>
              <option value="pending">В процесі</option>
              <option value="closed">Завершено</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-1 flex mb-6 shadow-sm">
          {tabs.map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'green' : 'secondary'}
              size="lg"
              icon={React.cloneElement(tab.icon, {
                className: `h-5 w-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`,
              })}
              className={`flex-1 py-3 rounded-2xl ${activeTab !== tab.id ? 'text-gray-600 hover:bg-gray-50' : ''}`}
              onClick={() => setActiveTab(tab.id as 'author' | 'respondent' | 'reviewer')}
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
            >
              <span>{tab.label}</span>
            </Button>
          ))}
        </div>

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

        <ConfirmModal
          isOpen={modalState.isOpen}
          title={modalState.title}
          message={modalState.message}
          type={modalState.type}
          onSubmit={modalState.onSubmit}
          onClose={closeConfirmModal}
        />
      </div>
    </div>
  );
};

export default RatingsPage;