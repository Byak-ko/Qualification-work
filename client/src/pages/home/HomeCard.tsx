import { useNavigate } from "react-router-dom";
import {
  ArrowRightIcon
} from "@heroicons/react/24/outline";

type HomeCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
};

export default function HomeCard({ title, description, icon, to }: HomeCardProps) {
  const navigate = useNavigate();
  
  return (
    <div
      onClick={() => navigate(to)}
      className="cursor-pointer bg-white p-6 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 hover:border-indigo-300 transition-all duration-300 ease-in-out group"
    >
      <div className="flex items-center mb-4 space-x-4">
        <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-indigo-50 transition-colors">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
          {title}
        </h2>
      </div>
      <p className="text-gray-600 text-base line-clamp-2">{description}</p>
      <div className="mt-4 flex items-center text-indigo-600 group-hover:translate-x-1 transition-transform">
        <span className="text-sm font-medium">Перейти</span>
       <ArrowRightIcon className="h-4 w-4 ml-2" />
      </div>
    </div>
  );
}