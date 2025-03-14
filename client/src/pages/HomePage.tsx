import { useAuth } from "../components/AuthProvider";
import { Role } from "../types/User";

const HomePage = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><div className="spinner"></div></div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">👋 Ласкаво просимо, {currentUser?.email}</h1>
        <p className="text-lg text-gray-600">
          Ви увійшли як{" "}
          <span className="font-semibold text-indigo-600">
            {currentUser?.role === Role.ADMIN ? "Адміністратор" : "Викладач"}
          </span>
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 hover:bg-indigo-50 transition-all">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">ℹ️ Про систему</h2>
          <p className="text-gray-600">
            Ця система дозволяє управляти рейтингами викладачів, запрошувати респондентів та переглядати аналітику.
          </p>
        </div>

        {currentUser?.role === Role.ADMIN && (
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 hover:bg-indigo-50 transition-all">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">👥 Користувачі</h2>
            <p className="text-gray-600">Керуйте викладачами, респондентами та адміністраторами.</p>
          </div>
        )}

        {currentUser?.role === Role.TEACHER && (
          <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 hover:bg-indigo-50 transition-all">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">📝 Ваші рейтинги</h2>
            <p className="text-gray-600">Перевірте поточний статус ваших анкет і оцінок.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
