import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { getAllRatings } from '../services/api/ratings';
import { getRatingReport, downloadRatingReport, GroupByType, ReportGroup } from '../services/api/reports';
import { Rating } from '../types/Rating';
import { DocumentTextIcon, ChartPieIcon, ArrowPathIcon, TableCellsIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { User } from '../types/User';
import { toast, ToastContainer } from 'react-toastify';

export type reportRating = Omit<Rating, keyof Rating> & {
  author: User;
};

const ReportsPage: React.FC = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [groupBy, setGroupBy] = useState<GroupByType | undefined>();
  const [report, setReport] = useState<ReportGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'title' | 'endedAt'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ratingId = params.get('ratingId');
    if (ratingId && !isNaN(Number(ratingId))) {
      setSelectedRating(Number(ratingId));
    }
  }, [location.search]);

  useEffect(() => {
    const fetchRatings = async () => {
      if (currentUser) {
        try {
          const data = await getAllRatings();
          const authorRatings = data.filter((rating: reportRating) => rating.author.id === currentUser.id);
          setRatings(authorRatings);
          if (selectedRating && !authorRatings.some((r: Rating) => r.id === selectedRating)) {
            setSelectedRating(null);
            navigate('/reports', { replace: true });
            toast.error('Обраний рейтинг недоступний');
          }
        } catch (error) {
          console.error('Error fetching ratings:', error);
          toast.error('Помилка при завантаженні рейтингів');
        }
      }
    };

    fetchRatings();
  }, [currentUser, selectedRating, navigate]);

  useEffect(() => {
    const loadReport = async () => {
      if (selectedRating) {
        try {
          setLoading(true);
          const data = await getRatingReport(selectedRating, groupBy);
          setReport(data);
        } catch (error) {
          console.error('Error loading report:', error);
          toast.error('Помилка при завантаженні звіту');
        } finally {
          setLoading(false);
        }
      }
    };

    loadReport();
  }, [selectedRating, groupBy]);

  const handleDownloadPdf = () => {
    if (selectedRating) {
      downloadRatingReport(selectedRating, groupBy);
      toast.success('Звіт завантажується...');
    }
  };

  const filteredRatings = useMemo(() => {
    let result = ratings.filter((rating) =>
      rating.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rating.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (rating.endedAt && new Date(rating.endedAt).toLocaleDateString('uk-UA').includes(searchQuery.toLowerCase()))
    );

    result.sort((a, b) => {
      if (sortBy === 'title') {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        return sortOrder === 'asc' ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
      } else {
        const dateA = a.endedAt ? new Date(a.endedAt).getTime() : 0;
        const dateB = b.endedAt ? new Date(b.endedAt).getTime() : 0;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });

    return result;
  }, [ratings, searchQuery, sortBy, sortOrder]);

  const handleSort = (field: 'title' | 'endedAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getStatusColor = (status: string, isClosed: boolean) => {
    if (isClosed) {
      return status === 'filled' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    }
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800';
      case 'filled':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'revision':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string, isClosed: boolean) => {
    if (isClosed) {
      return status === 'filled' ? 'Підтверджено' : 'Не підтверджено';
    }
    switch (status) {
      case 'pending':
        return 'Не заповнено';
      case 'filled':
        return 'Заповнено';
      case 'approved':
        return 'Підтверджено';
      case 'revision':
        return 'На доопрацюванні';
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

  const selectedRatingObj = ratings.find(r => r.id === selectedRating);
  const isRatingClosed = selectedRatingObj?.status === 'closed';

  const summary = useMemo(() => {
    if (!report.length) return null;

    return {
      totalGroups: report.length,
      totalParticipants: report.reduce((sum, group) => sum + group.totalParticipants, 0),
      totalFilled: report.reduce((sum, group) => sum + group.filledCount, 0),
      totalApproved: report.reduce((sum, group) => sum + group.approvedCount, 0),
      totalRevision: report.reduce((sum, group) => sum + group.revisionCount, 0),
      totalPending: report.reduce((sum, group) => sum + group.pendingCount, 0),
      averageScore: isRatingClosed ?
        report.reduce((sum, group) => sum + (group.averageScore * group.totalParticipants), 0) /
        report.reduce((sum, group) => sum + group.totalParticipants, 0) || 0 : 0,
      highestScoreGroup: isRatingClosed ?
        report.reduce((highest, group) =>
          group.averageScore > highest.score
            ? { name: group.name, score: group.averageScore }
            : highest,
          { name: '', score: 0 }) : { name: '', score: 0 },
      lowestScoreGroup: isRatingClosed ?
        report.reduce((lowest, group) =>
          (lowest.score === 0 || group.averageScore < lowest.score) && group.averageScore > 0
            ? { name: group.name, score: group.averageScore }
            : lowest,
          { name: '', score: 0 }) : { name: '', score: 0 },
      completionRate: report.reduce((sum, group) => sum + group.approvedCount, 0) /
        report.reduce((sum, group) => sum + group.totalParticipants, 0) * 100 || 0
    };
  }, [report, isRatingClosed]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-gray-800">Звіти по рейтингам</h2>
        <p className="text-gray-600">Аналітика та статистика рейтингових оцінок</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8 border border-gray-100">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <h3 className="font-medium text-lg text-gray-800 flex items-center">
            <ChartPieIcon className="h-5 w-5 mr-2 text-blue-600" />
            Параметри звіту
          </h3>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Оберіть рейтинг</label>
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Пошук за назвою, типом або датою..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-80 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('title')}
                    >
                      Назва {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Тип
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('endedAt')}
                    >
                      Дата завершення {sortBy === 'endedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRatings.length > 0 ? (
                    filteredRatings.map((rating) => (
                      <tr
                        key={rating.id}
                        className={`hover:bg-blue-50 cursor-pointer transition-colors ${selectedRating === rating.id ? 'bg-blue-100' : ''
                          }`}
                        onClick={() => {
                          setSelectedRating(rating.id);
                          navigate(`/reports?ratingId=${rating.id}`, { replace: true });
                        }}
                      >
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {rating.title}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className={`text-sm px-3 py-1 rounded-full font-medium ${getTypeColor(rating.type)}`}>
                            {rating.type}
                          </span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                          {rating.endedAt ? new Date(rating.endedAt).toLocaleDateString('uk-UA') : 'Не вказано'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-3 text-center text-sm text-gray-500">
                        Немає рейтингів за вашим запитом
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">Групування</label>
              <div className="relative">
                <select
                  className={`appearance-none block w-full bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 shadow-sm ${!selectedRating
                    ? 'bg-gray-50 cursor-not-allowed text-gray-500'
                    : 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  value={groupBy || ''}
                  onChange={(e) => setGroupBy(e.target.value as GroupByType || undefined)}
                  disabled={!selectedRating}
                >
                  <option value="">Без групування</option>
                  <option value="department">За кафедрами</option>
                  <option value="unit">За підрозділами</option>
                  <option value="position">За посадами</option>
                  <option value="scientificDegree">За науковим ступенем</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto flex items-end">
              {isRatingClosed && (
                <div className="w-full md:w-auto flex items-end">
                  <button
                    className={`flex items-center px-6 py-3 rounded-lg transition-all ${!selectedRating
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                      }`}
                    onClick={handleDownloadPdf}
                    disabled={!selectedRating}
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    <span>Завантажити PDF</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
            <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
            <span>Завантаження даних...</span>
          </div>
        </div>
      ) : report.length > 0 ? (
        <div className="space-y-8">
          {report.map((group, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800">{group.name}</h3>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Всього учасників</p>
                    <p className="text-2xl font-bold text-gray-800">{group.totalParticipants}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">{isRatingClosed ? 'Підтверджено' : 'Заповнено'}</p>
                    <p className="text-2xl font-bold text-blue-700">{group.filledCount}</p>
                  </div>
                  {!isRatingClosed && (
                    <>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Підтверджено</p>
                        <p className="text-2xl font-bold text-green-700">{group.approvedCount}</p>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">На доопрацюванні</p>
                        <p className="text-2xl font-bold text-orange-700">{group.revisionCount}</p>
                      </div>
                      <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 shadow-sm">
                        <p className="text-sm text-gray-500 mb-1">Очікування заповнення</p>
                        <p className="text-2xl font-bold text-red-700">{group.pendingCount}</p>
                      </div>
                    </>
                  )}
                  {isRatingClosed && (
                    <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 shadow-sm">
                      <p className="text-sm text-gray-500 mb-1">Не підтверджено</p>
                      <p className="text-2xl font-bold text-red-700">{group.totalParticipants - group.filledCount}</p>
                    </div>
                  )}
                  {isRatingClosed && (
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 shadow-sm">
                      <p className="text-sm text-gray-500 mb-1">Середній бал</p>
                      <p className="text-2xl font-bold text-purple-700">{group.averageScore.toFixed(2)}</p>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ПІБ
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Статус
                        </th>
                        {isRatingClosed && (
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Бали
                          </th>
                        )}
                        {groupBy !== 'position' && (
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Посада
                          </th>
                        )}
                        {groupBy !== 'scientificDegree' && (
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Науковий ступінь
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {group.participants.map((participant, pIndex) => (
                        <tr key={pIndex} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {participant.name}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(participant.status, isRatingClosed)}`}>
                              {getStatusText(participant.status, isRatingClosed)}
                            </span>
                          </td>
                          {isRatingClosed && (
                            <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                              {participant.score}
                            </td>
                          )}
                          {groupBy !== 'position' && (
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                              {participant.position}
                            </td>
                          )}
                          {groupBy !== 'scientificDegree' && (
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                              {participant.degree}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}

          {/* Загальні підсумки */}
          {summary && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                  <TableCellsIcon className="h-5 w-5 mr-2 text-purple-600" />
                  Загальні підсумки
                </h3>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* Перша колонка статистики */}
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 shadow-md">
                    <h4 className="font-medium text-lg text-gray-800 mb-4 border-b pb-2">Загальна статистика</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Кількість груп:</span>
                        <span className="font-semibold text-gray-800">{summary.totalGroups}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Всього учасників:</span>
                        <span className="font-semibold text-gray-800">{summary.totalParticipants}</span>
                      </div>
                      {isRatingClosed && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Середній бал:</span>
                            <span className="font-semibold text-purple-700">{summary.averageScore.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Відсоток заповнення:</span>
                            <span className="font-semibold text-blue-700">{summary.completionRate.toFixed(1)}%</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Друга колонка статистики */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 shadow-md">
                    <h4 className="font-medium text-lg text-gray-800 mb-4 border-b pb-2">Статуси заповнення</h4>
                    <div className="space-y-3">
                      {isRatingClosed ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Підтверджено:</span>
                            <div className="flex items-center">
                              <span className="font-semibold text-green-700 mr-2">{summary.totalFilled}</span>
                              <span className="text-xs text-gray-500">
                                ({((summary.totalFilled / summary.totalParticipants) * 100).toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Не підтверджено:</span>
                            <div className="flex items-center">
                              <span className="font-semibold text-red-700 mr-2">{summary.totalParticipants - summary.totalFilled}</span>
                              <span className="text-xs text-gray-500">
                                ({(((summary.totalParticipants - summary.totalFilled) / summary.totalParticipants) * 100).toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Заповнено:</span>
                            <div className="flex items-center">
                              <span className="font-semibold text-blue-700 mr-2">{summary.totalFilled}</span>
                              <span className="text-xs text-gray-500">
                                ({((summary.totalFilled / summary.totalParticipants) * 100).toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Підтверджено:</span>
                            <div className="flex items-center">
                              <span className="font-semibold text-green-700 mr-2">{summary.totalApproved}</span>
                              <span className="text-xs text-gray-500">
                                ({((summary.totalApproved / summary.totalParticipants) * 100).toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">На доопрацюванні:</span>
                            <div className="flex items-center">
                              <span className="font-semibold text-orange-700 mr-2">{summary.totalRevision}</span>
                              <span className="text-xs text-gray-500">
                                ({((summary.totalRevision / summary.totalParticipants) * 100).toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Очікування заповнення:</span>
                            <div className="flex items-center">
                              <span className="font-semibold text-red-700 mr-2">{summary.totalPending}</span>
                              <span className="text-xs text-gray-500">
                                ({((summary.totalPending / summary.totalParticipants) * 100).toFixed(1)}%)
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Третя колонка статистики */}
                  {isRatingClosed && (
                    <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl p-5 shadow-md">
                      <h4 className="font-medium text-lg text-gray-800 mb-4 border-b pb-2">Лідери та аутсайдери</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-gray-600 mb-1">Найвищий середній бал:</p>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="font-medium text-gray-800">{summary.highestScoreGroup.name}</p>
                            <p className="text-purple-700 font-bold text-lg">{summary.highestScoreGroup.score.toFixed(2)}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Найнижчий середній бал:</p>
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <p className="font-medium text-gray-800">{summary.lowestScoreGroup.name || "Немає даних"}</p>
                            <p className="text-purple-700 font-bold text-lg">
                              {summary.lowestScoreGroup.score ? summary.lowestScoreGroup.score.toFixed(2) : "-"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Візуалізація статусу заповнення */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Прогрес заповнення</h4>
                  <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="flex h-full">
                      {isRatingClosed ? (
                        <>
                          <div
                            className="bg-green-500 h-full"
                            style={{ width: `${(summary.totalFilled / summary.totalParticipants) * 100}%` }}
                            title={`Підтверджено: ${summary.totalFilled}`}
                          ></div>
                          <div
                            className="bg-red-500 h-full"
                            style={{ width: `${((summary.totalParticipants - summary.totalFilled) / summary.totalParticipants) * 100}%` }}
                            title={`Не підтверджено: ${summary.totalParticipants - summary.totalFilled}`}
                          ></div>
                        </>
                      ) : (
                        <>
                          <div
                            className="bg-green-500 h-full"
                            style={{ width: `${(summary.totalApproved / summary.totalParticipants) * 100}%` }}
                            title={`Підтверджено: ${summary.totalApproved}`}
                          ></div>
                          <div
                            className="bg-blue-500 h-full"
                            style={{ width: `${(summary.totalFilled / summary.totalParticipants) * 100}%` }}
                            title={`Заповнено: ${summary.totalFilled}`}
                          ></div>
                          <div
                            className="bg-orange-500 h-full"
                            style={{ width: `${(summary.totalRevision / summary.totalParticipants) * 100}%` }}
                            title={`На доопрацюванні: ${summary.totalRevision}`}
                          ></div>
                          <div
                            className="bg-red-500 h-full"
                            style={{ width: `${(summary.totalPending / summary.totalParticipants) * 100}%` }}
                            title={`Очікування заповнення: ${summary.totalPending}`}
                          ></div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap mt-2 text-xs gap-4">
                    {isRatingClosed ? (
                      <>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                          <span>Підтверджено ({((summary.totalFilled / summary.totalParticipants) * 100).toFixed(1)}%)</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                          <span>Не підтверджено ({(((summary.totalParticipants - summary.totalFilled) / summary.totalParticipants) * 100).toFixed(1)}%)</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                          <span>Підтверджено ({((summary.totalApproved / summary.totalParticipants) * 100).toFixed(1)}%)</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                          <span>Заповнено ({((summary.totalFilled / summary.totalParticipants) * 100).toFixed(1)}%)</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-orange-500 mr-1"></div>
                          <span>На доопрацюванні ({((summary.totalRevision / summary.totalParticipants) * 100).toFixed(1)}%)</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                          <span>Очікування заповнення ({((summary.totalPending / summary.totalParticipants) * 100).toFixed(1)}%)</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Таблиця зведених даних по групах */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-purple-50">
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Група
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Учасники
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {isRatingClosed ? 'Підтверджено' : 'Заповнено'}
                        </th>
                        {!isRatingClosed && (
                          <>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Підтверджено
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              На доопрацюванні
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Очікування заповнення
                            </th>
                          </>
                        )}
                        {isRatingClosed && (
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Не підтверджено
                          </th>
                        )}
                        {isRatingClosed && (
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Середній бал
                          </th>
                        )}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          % заповнення
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.map((group, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {group.name}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                            {group.totalParticipants}
                          </td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                            <span className="text-blue-700 font-medium">{group.filledCount}</span>
                            <span className="text-xs text-gray-500 ml-1">
                              ({((group.filledCount / group.totalParticipants) * 100).toFixed(1)}%)
                            </span>
                          </td>
                          {!isRatingClosed && (
                            <>
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                <span className="text-green-700 font-medium">{group.approvedCount}</span>
                                <span className="text-xs text-gray-500 ml-1">
                                  ({((group.approvedCount / group.totalParticipants) * 100).toFixed(1)}%)
                                </span>
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                <span className="text-orange-700 font-medium">{group.revisionCount}</span>
                                <span className="text-xs text-gray-500 ml-1">
                                  ({((group.revisionCount / group.totalParticipants) * 100).toFixed(1)}%)
                                </span>
                              </td>
                              <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                <span className="text-red-700 font-medium">{group.pendingCount}</span>
                                <span className="text-xs text-gray-500 ml-1">
                                  ({((group.pendingCount / group.totalParticipants) * 100).toFixed(1)}%)
                                </span>
                              </td>
                            </>
                          )}
                          {isRatingClosed && (
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                              <span className="text-red-700 font-medium">{group.totalParticipants - group.filledCount}</span>
                              <span className="text-xs text-gray-500 ml-1">
                                ({(((group.totalParticipants - group.filledCount) / group.totalParticipants) * 100).toFixed(1)}%)
                              </span>
                            </td>
                          )}
                          {isRatingClosed && (
                            <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-purple-700">
                              {group.averageScore.toFixed(2)}
                            </td>
                          )}
                          <td className="px-6 py-3 whitespace-nowrap">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${((group.filledCount + (isRatingClosed ? 0 : group.approvedCount)) / group.totalParticipants) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1 block">
                              {(((group.filledCount + (isRatingClosed ? 0 : group.approvedCount)) / group.totalParticipants) * 100).toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                          Всього
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                          {summary.totalParticipants}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm">
                          <span className="font-semibold text-blue-700">{summary.totalFilled}</span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({((summary.totalFilled / summary.totalParticipants) * 100).toFixed(1)}%)
                          </span>
                        </td>
                        {!isRatingClosed && (
                          <>
                            <td className="px-6 py-3 whitespace-nowrap text-sm">
                              <span className="font-semibold text-green-700">{summary.totalApproved}</span>
                              <span className="text-xs text-gray-500 ml-1">
                                ({((summary.totalApproved / summary.totalParticipants) * 100).toFixed(1)}%)
                              </span>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm">
                              <span className="font-semibold text-orange-700">{summary.totalRevision}</span>
                              <span className="text-xs text-gray-500 ml-1">
                                ({((summary.totalRevision / summary.totalParticipants) * 100).toFixed(1)}%)
                              </span>
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm">
                              <span className="font-semibold text-red-700">{summary.totalPending}</span>
                              <span className="text-xs text-gray-500 ml-1">
                                ({((summary.totalPending / summary.totalParticipants) * 100).toFixed(1)}%)
                              </span>
                            </td>
                          </>
                        )}
                        {isRatingClosed && (
                          <td className="px-6 py-3 whitespace-nowrap text-sm">
                            <span className="font-semibold text-red-700">{summary.totalParticipants - summary.totalFilled}</span>
                            <span className="text-xs text-gray-500 ml-1">
                              ({(((summary.totalParticipants - summary.totalFilled) / summary.totalParticipants) * 100).toFixed(1)}%)
                            </span>
                          </td>
                        )}
                        {isRatingClosed && (
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-purple-700">
                            {summary.averageScore.toFixed(2)}
                          </td>
                        )}
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${((summary.totalFilled + (isRatingClosed ? 0 : summary.totalApproved)) / summary.totalParticipants) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1 block">
                            {(((summary.totalFilled + (isRatingClosed ? 0 : summary.totalApproved)) / summary.totalParticipants) * 100).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center py-16">
          <p className="text-gray-500">Немає доступних звітів для вибраного рейтингу.</p>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default ReportsPage;