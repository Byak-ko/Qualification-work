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
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
          Ласкаво просимо, {currentUser?.email}
        </h1>
        <p className="text-lg text-gray-500">
          Роль:{" "}
          <span className="font-semibold text-indigo-600">
            {currentUser?.role === Role.ADMIN ? "Адміністратор" : "Викладач"}
          </span>
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        <HomeCard
          title="Про систему"
          description="Система управління рейтингами викладачів, аналітикою та процесом заповнення."
          icon={<InformationCircleIcon className="w-8 h-8" />}
          to="#"
        />

        {currentUser?.role === Role.ADMIN && (
          <>
            <HomeCard
              title="Користувачі"
              description="Керуйте обліковими записами користувачів."
              icon={<UsersIcon className="w-8 h-8" />}
              to="/users"
            />
            <HomeCard
              title="Рейтинги"
              description="Створюйте та редагуйте рейтинги викладачів."
              icon={<ClipboardDocumentIcon className="w-8 h-8" />}
              to="/ratings"
            />
            <HomeCard
              title="Підрозділи"
              description="Налаштування факультетів та кафедр."
              icon={<BuildingOfficeIcon className="w-8 h-8" />}
              to="/units"
            />
          </>
        )}

        <HomeCard
          title="Особистий кабінет"
          description="Перегляньте або змініть інформацію свого акаунту."
          icon={<UsersIcon className="w-8 h-8" />}
          to="/profile"
        />

        <HomeCard
          title="Звіти"
          description="Аналізуйте результати рейтингів."
          icon={<ChartBarIcon className="w-8 h-8" />}
          to="/reports"
        />
      </div>
    </div>
  );
};

export default HomePage;
