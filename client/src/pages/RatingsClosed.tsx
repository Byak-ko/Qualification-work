import { useState, useEffect } from 'react';
import { TrashIcon, DocumentTextIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { getClosedRatings } from '../services/api/ratings';
import { Rating } from '../types/Rating';

export default function ClosedRatingsPage() {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRatingId, setSelectedRatingId] = useState<number | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    fetchClosedRatings();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
      setDeleteInProgress(true);

      await axios.delete(`/api/ratings/${selectedRatingId}/documents`);
      
      setNotification({
        message: 'Документи рейтингу успішно видалено',
        type: 'success'
      });
      
      fetchClosedRatings();
    } catch (err) {
      setNotification({
        message: 'Помилка видалення документів',
        type: 'error'
      });
      console.error('Error deleting rating documents:', err);
    } finally {
      setDeleteInProgress(false);
      closeDeleteModal();
    }
  };

  const renderRatingsList = () => {
    if (!Array.isArray(ratings) || ratings.length === 0) {
      return (
        <div className="text-center p-10 bg-gray-50 rounded-lg shadow-sm">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Немає закритих рейтингів</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Назва
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Тип
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата закриття
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дії
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {ratings.map((rating) => (
              <tr key={rating.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{rating.title || 'Без назви'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {rating.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {rating.endedAt ? new Date(rating.endedAt).toLocaleDateString('uk-UA', { year: 'numeric', month: '2-digit', day: '2-digit' }) : 'Не вказано'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openDeleteModal(rating.id)}
                    className="text-red-600 hover:text-red-900 inline-flex items-center"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Видалити документи
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-md">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-2" />
          <span className="font-medium text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Закриті рейтинги</h1>
      </div>

      {notification && (
        <div className={`mb-4 p-4 rounded-md flex justify-between items-center ${
          notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)}>
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {renderRatingsList()}

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Підтвердження видалення</h3>
            <p className="text-gray-600 mb-6">
              Ви впевнені, що хочете видалити всі документи, пов'язані з цим рейтингом? 
              Ця дія не може бути скасована.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                disabled={deleteInProgress}
              >
                Скасувати
              </button>
              <button
                onClick={deleteRatingDocuments}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                disabled={deleteInProgress}
              >
                {deleteInProgress ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                    Видалення...
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Видалити
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}