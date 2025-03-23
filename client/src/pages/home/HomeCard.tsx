import { useNavigate } from "react-router-dom";

type HomeCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  to: string;
};

export default function HomedCard({ title, description, icon, to }: HomeCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(to)}
      className="cursor-pointer bg-white p-6 rounded-2xl shadow-md hover:shadow-lg border border-gray-100 hover:border-indigo-300 transition-all group"
    >
      <div className="flex items-center mb-4 space-x-3">
        <div className="text-indigo-600 group-hover:scale-110 transition-transform">{icon}</div>
        <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      </div>
      <p className="text-gray-600 text-base">{description}</p>
    </div>
  );
}
