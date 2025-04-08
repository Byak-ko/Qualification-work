import { useAuth } from "../../components/AuthProvider";
import { Role } from "../../types/User";
import HomeCard from "./HomeCard";
import SkeletonCard from "../../components/ui/Skeleton";
import {
  UsersIcon,
  ClipboardDocumentIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";

const HomePage = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-8 px-6 py-10">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="bg-white shadow-sm rounded-xl p-8 mb-10">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500">
            Ласкаво просимо, {currentUser?.firstName}
          </h1>
          <p className="text-lg text-gray-600">
            Роль:{" "}
            <span className="font-semibold text-indigo-600">
              {currentUser?.role === Role.ADMIN ? "Адміністратор" : "Викладач"}
            </span>
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        <HomeCard
          title="Про систему"
          description="Система управління рейтингами викладачів, аналітикою та процесом заповнення."
          icon={<InformationCircleIcon className="w-10 h-10 text-indigo-500" />}
          to="#"
        />
        {currentUser?.role === Role.ADMIN && (
          <>
            <HomeCard
              title="Користувачі"
              description="Керуйте обліковими записами користувачів."
              icon={<UsersIcon className="w-10 h-10 text-green-500" />}
              to="/users"
            />
            <HomeCard
              title="Рейтинги"
              description="Створюйте та редагуйте рейтинги викладачів."
              icon={<ClipboardDocumentIcon className="w-10 h-10 text-blue-500" />}
              to="/ratings"
            />
            <HomeCard
              title="Підрозділи"
              description="Налаштування факультетів та кафедр."
              icon={<BuildingOfficeIcon className="w-10 h-10 text-purple-500" />}
              to="/units"
            />
          </>
        )}
        <HomeCard
          title="Особистий кабінет"
          description="Перегляньте або змініть інформацію свого акаунту."
          icon={<UsersIcon className="w-10 h-10 text-orange-500" />}
          to="/profile"
        />
        <HomeCard
          title="Рейтинги"
          description="Створюйте та редагуйте рейтинги викладачів."
          icon={<ClipboardDocumentIcon className="w-10 h-10 text-blue-500" />}
          to="/ratings"
        />
      </div>
    </div>
  );
};

export default HomePage;