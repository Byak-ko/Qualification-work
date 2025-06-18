import { useState, useEffect } from 'react';
import { 
  TrashIcon, 
  DocumentTextIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  DocumentDuplicateIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';
import { getClosedRatings } from '../services/api/ratings';
import { Rating } from '../types/Rating';
import Button from '../components/ui/Button';
import SkeletonCard from '../components/ui/Skeleton';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';

export default function ClosedRatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRatingId, setSelectedRatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchClosedRatings();
  }, []);

  const fetchClosedRatings = async () => {
    try {
      setLoading(true);
      const response = await getClosedRatings();
      console.log('Closed Ratings Response:', response);
      setRatings(response);
      setError(null);
    } catch (err) {
      console.error('Error fetching closed ratings:', err);
      setError('Не вдалося завантажити дані рейтингів');
      setRatings([]);
      toast.error('Не вдалося завантажити дані рейтингів');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (ratingId: number) => {
    setSelectedRatingId(ratingId);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedRatingId(null);
  };

  const deleteRatingDocuments = async () => {
    if (!selectedRatingId) return;
    
    try {
      await axios.delete(`/api/ratings/${selectedRatingId}/documents`);
      
      toast.success('Документи рейтингу успішно видалено');
      fetchClosedRatings();
    } catch (err) {
      toast.error('Помилка видалення документів');
      console.error('Error deleting rating documents:', err);
    } finally {
      closeDeleteModal();
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

  const totalStats = ratings.reduce((acc, rating) => {
    return {
      documentsCount: acc.documentsCount + (rating.documentsCount || 0),
      totalSizeMB: acc.totalSizeMB + (rating.totalSizeMB || 0)
    };
  }, { documentsCount: 0, totalSizeMB: 0 });

  const renderRatingsList = () => {
    if (!Array.isArray(ratings) || ratings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm">
          <DocumentTextIcon className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-500">Немає закритих рейтингів</h3>
          <p className="text-gray-400 mt-2 text-center">
            У системі поки що немає закритих рейтингів
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {ratings.map((rating) => (
          <div
            key={rating.id}
            className="bg-white rounded-2xl shadow-sm p-6 transition-all hover:shadow-md border border-gray-100"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{rating.title || 'Без назви'}</h3>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <span className="text-sm px-3 py-1.5 rounded-full font-medium bg-green-100 text-green-800">
                    Завершено
                  </span>
                  <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${getTypeColor(rating.type)}`}>
                    {rating.type}
                  </span>
                  <span className="text-sm text-gray-600 flex items-center">
                    <CalendarDaysIcon className="h-4 w-4 mr-1 text-gray-500" />
                    {rating.endedAt ? new Date(rating.endedAt).toLocaleDateString('uk-UA', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'Не вказано'}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-4 mt-3">
                  <span className="text-sm text-gray-600 flex items-center">
                    <DocumentDuplicateIcon className="h-4 w-4 mr-1 text-indigo-500" />
                    {rating.documentsCount || 0} документів
                  </span>
                  <span className="text-sm text-gray-600 flex items-center">
                    <ScaleIcon className="h-4 w-4 mr-1 text-indigo-500" />
                    {rating.totalSizeMB ? rating.totalSizeMB.toFixed(2) : '0'} МБ
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4 sm:mt-0">
                <Button
                  variant="danger"
                  size="sm"
                  className={`flex items-center gap-1 rounded-xl px-4 py-2 ${
                    rating.documentsCount && rating.documentsCount > 0 
                      ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  } transition-colors`}
                  onClick={() => rating.documentsCount && rating.documentsCount > 0 && openDeleteModal(rating.id)}
                  disabled={!rating.documentsCount || rating.documentsCount === 0}
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Видалити документи</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
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
                Закриті рейтинги
              </h1>
              <Button
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors bg-transparent hover:bg-gray-100 rounded-lg p-2"
                onClick={fetchClosedRatings}
              >
                <ArrowPathIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Оновити</span>
              </Button>
            </div>
            <p className="text-gray-600 max-w-2xl mb-6">
              Управління завершеними рейтингами. Тут ви можете переглядати та видаляти документи закритих рейтингів.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-xl p-4 flex items-center">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <DocumentTextIcon className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-green-600 font-semibold">{ratings.length}</p>
                  <p className="text-sm text-green-800">Завершених рейтингів</p>
                </div>
              </div>
              
              <div className="bg-indigo-50 rounded-xl p-4 flex items-center">
                <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                  <DocumentDuplicateIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-indigo-600 font-semibold">{totalStats.documentsCount}</p>
                  <p className="text-sm text-indigo-800">Всього документів</p>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-4 flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                  <ScaleIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-purple-600 font-semibold">{totalStats.totalSizeMB.toFixed(2)} МБ</p>
                  <p className="text-sm text-purple-800">Загальний розмір</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-md mb-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
              <span className="font-medium text-red-700">{error}</span>
            </div>
          </div>
        )}

        {renderRatingsList()}
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Підтвердження видалення"
        message="Ви впевнені, що хочете видалити всі документи, пов'язані з цим рейтингом? Ця дія не може бути скасована."
        type="danger"
        onSubmit={deleteRatingDocuments}
        onClose={closeDeleteModal}
      />
    </div>
  );
}