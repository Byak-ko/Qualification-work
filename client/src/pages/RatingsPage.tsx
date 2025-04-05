import React, { useState, useEffect } from 'react';
import { 
  EyeIcon, 
  PencilIcon, 
  StarIcon, 
  DocumentTextIcon, 
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Button from '../components/ui/Button';

interface RatingItem {
  id: number;
  title: string;
  status: string;
  date: string;
  score?: number;
}

const RatingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'author' | 'respondent' | 'reviewer'>('author');
  const [isTabVisible, setIsTabVisible] = useState(true);
  
  // Reset animation when tab changes
  useEffect(() => {
    setIsTabVisible(false);
    setTimeout(() => setIsTabVisible(true), 10);
  }, [activeTab]);
  
  // Mock data for demonstration
  const authorRatings: RatingItem[] = [
    { id: 1, title: 'Дослідження кліматичних змін', status: 'Завершено', date: '15.03.2025', score: 4.7 },
    { id: 2, title: 'Інноваційні технології в освіті', status: 'В процесі', date: '22.02.2025', score: 4.2 },
  ];

  const respondentRatings: RatingItem[] = [
    { id: 3, title: 'Опитування про якість медобслуговування', status: 'Завершено', date: '10.02.2025', score: 4.5 },
    { id: 4, title: 'Соціологічне дослідження міграції', status: 'В процесі', date: '05.03.2025', score: 3.9 },
  ];

  const reviewerRatings: RatingItem[] = [
    { id: 5, title: 'Наукова стаття з біотехнологій', status: 'Рецензовано', date: '18.02.2025', score: 4.8 },
    { id: 6, title: 'Дисертаційне дослідження', status: 'На перевірці', date: '25.03.2025', score: 4.6 },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Завершено':
        return 'bg-green-100 text-green-800';
      case 'В процесі':
        return 'bg-blue-100 text-blue-800';
      case 'Рецензовано':
        return 'bg-purple-100 text-purple-800';
      case 'На перевірці':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderRatingsList = (ratings: RatingItem[]) => {
    if (ratings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm">
          <DocumentTextIcon className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-500">Немає рейтингів</h3>
          <p className="text-gray-400 mt-2 text-center">
            У вас поки що немає рейтингів у цій категорії
          </p>
        </div>
      );
    }

    return ratings.map((rating) => (
      <div 
        key={rating.id} 
        className="bg-white rounded-2xl shadow-sm p-6 transition-all hover:shadow-md hover:transform hover:scale-[1.01] border border-gray-100"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{rating.title}</h3>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <span className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColor(rating.status)}`}>
                {rating.status}
              </span>
              <span className="text-sm text-gray-600 flex items-center">
                <CalendarDaysIcon className="h-4 w-4 mr-1 text-gray-500" />
                {rating.date}
              </span>
              {rating.score && (
                <div className="flex items-center bg-amber-50 text-amber-700 px-3 py-1 rounded-full">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIconSolid 
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(rating.score || 0) 
                            ? 'text-amber-500' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-semibold ml-2">{rating.score.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button 
              variant="secondary" 
              size="sm"
              className="flex items-center gap-2 rounded-xl px-4 py-2 hover:bg-indigo-50 transition-colors"
            >
              <DocumentMagnifyingGlassIcon className="h-4 w-4" />
              <span>Переглянути</span>
            </Button>
            
            <Button 
              variant="primary"
              size="sm"
              className="flex items-center gap-2 rounded-xl px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              <ArrowTrendingUpIcon className="h-4 w-4" />
              <span>Деталі</span>
            </Button>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-b from-indigo-100 to-purple-100 rounded-full -mr-32 -mt-32 opacity-50"></div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Мої рейтинги
            </h1>
            <p className="text-gray-600 max-w-2xl">
              Перегляд ваших рейтингів у різних ролях. Виберіть категорію для перегляду відповідних результатів.
            </p>
            
            {/* Stats summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-indigo-50 rounded-xl p-4 flex items-center">
                <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                  <PencilIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-indigo-600 font-semibold">{authorRatings.length}</p>
                  <p className="text-sm text-indigo-800">Створено рейтингів</p>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-4 flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg mr-4">
                  <UserGroupIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-purple-600 font-semibold">{respondentRatings.length}</p>
                  <p className="text-sm text-purple-800">Участь у рейтингах</p>
                </div>
              </div>
              
              <div className="bg-amber-50 rounded-xl p-4 flex items-center">
                <div className="bg-amber-100 p-3 rounded-lg mr-4">
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
              className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 font-medium transition-all ${
                activeTab === tab.id 
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
            <div className={`transition-all duration-300 ease-out transform ${
              isTabVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
            } space-y-4`}>
              {renderRatingsList(authorRatings)}
            </div>
          )}
          {activeTab === 'respondent' && (
            <div className={`transition-all duration-300 ease-out transform ${
              isTabVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
            } space-y-4`}>
              {renderRatingsList(respondentRatings)}
            </div>
          )}
          {activeTab === 'reviewer' && (
            <div className={`transition-all duration-300 ease-out transform ${
              isTabVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
            } space-y-4`}>
              {renderRatingsList(reviewerRatings)}
            </div>
          )}
        </div>
        
        {/* Create new button (conditionally shown for author tab) */}
        {activeTab === 'author' && (
          <div className="fixed bottom-8 right-8">
            <Button
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full py-3 px-6 shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Створити новий
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RatingsPage;