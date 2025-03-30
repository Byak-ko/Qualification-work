import React, { useState } from 'react';
import { EyeIcon, PencilIcon, StarIcon } from '@heroicons/react/24/solid';
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

  const renderRatingsList = (ratings: RatingItem[]) => {
    return ratings.map((rating) => (
      <div 
        key={rating.id} 
        className="bg-white rounded-lg shadow-md p-4 mb-4 flex justify-between items-center hover:shadow-lg transition-shadow"
      >
        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-gray-800">{rating.title}</h3>
          <div className="flex items-center mt-2 space-x-4">
            <span className="text-sm text-gray-600">
              <span className="font-medium">Статус:</span> {rating.status}
            </span>
            <span className="text-sm text-gray-600">
              <span className="font-medium">Дата:</span> {rating.date}
            </span>
            {rating.score && (
              <div className="flex items-center text-yellow-500">
                <StarIcon className="h-5 w-5 mr-1" />
                <span className="font-semibold">{rating.score.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm">
            <EyeIcon className="h-4 w-4" />
            Деталі
          </Button>
        </div>
      </div>
    ));
  };

  const tabStyles = (tab: string) => 
    `px-4 py-2 rounded-lg transition-colors ${
      activeTab === tab 
        ? 'bg-blue-500 text-white' 
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Мої рейтинги
      </h1>

      <div className="flex justify-center space-x-4 mb-8">
        <button 
          className={tabStyles('author')} 
          onClick={() => setActiveTab('author')}
        >
          <div className="flex items-center">
            <PencilIcon className="h-5 w-5 mr-2" />
            Автор
          </div>
        </button>
        <button 
          className={tabStyles('respondent')} 
          onClick={() => setActiveTab('respondent')}
        >
          <div className="flex items-center">
            <StarIcon className="h-5 w-5 mr-2" />
            Респондент
          </div>
        </button>
        <button 
          className={tabStyles('reviewer')} 
          onClick={() => setActiveTab('reviewer')}
        >
          <div className="flex items-center">
            <EyeIcon className="h-5 w-5 mr-2" />
            Рецензент
          </div>
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'author' && renderRatingsList(authorRatings)}
        {activeTab === 'respondent' && renderRatingsList(respondentRatings)}
        {activeTab === 'reviewer' && renderRatingsList(reviewerRatings)}
      </div>
    </div>
  );
};

export default RatingsPage;