import { Link, useLocation, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  HomeIcon, 
  ChevronRightIcon, 
  UserGroupIcon, 
  StarIcon, 
  DocumentChartBarIcon, 
  BuildingOfficeIcon,
  UserCircleIcon,
  PencilIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon
} from "@heroicons/react/24/solid";
import { useState, useEffect } from 'react';
import { getRatingById } from '../services/api/ratings';

const routeNames: Record<string, string> = {
  "": "Головна",
  users: "Користувачі",
  ratings: "Рейтинги",
  reports: "Мої звіти",
  units: "Підрозділи",
  profile: "Особистий кабінет",
  create: "Створення рейтингу",
  edit: "Редагування рейтингу",
  fill: "Заповнення рейтингу",
  review: "Перегляд рейтингу",
  about: "Про систему",
  documents: "Документи",
};

const routeIcons: Record<string, React.ReactNode> = {
  users: <UserGroupIcon className="w-4 h-4" />,
  ratings: <StarIcon className="w-4 h-4" />,
  reports: <DocumentChartBarIcon className="w-4 h-4" />,
  units: <BuildingOfficeIcon className="w-4 h-4" />,
  profile: <UserCircleIcon className="w-4 h-4" />,
  create: <StarIcon className="w-4 h-4" />,
  edit: <PencilIcon className="w-4 h-4" />,
  fill: <DocumentTextIcon className="w-4 h-4" />,
  review: <ClipboardDocumentCheckIcon className="w-4 h-4" />,
  about: <DocumentTextIcon className="w-4 h-4" />,
  documents: <DocumentTextIcon className="w-4 h-4" />,
};

const Breadcrumbs = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [ratingTitle, setRatingTitle] = useState<string | null>(null);
  const pathnames = location.pathname.split("/").filter(Boolean);
  const id = searchParams.get("id") || searchParams.get("ratingId");

  useEffect(() => {
    if (id && ['edit', 'fill', 'review'].includes(pathnames[pathnames.length - 1])) {
      getRatingById(Number(id)).then((rating: any) => {
        setRatingTitle(rating.title);
      }).catch((error: any) => {
        console.error('Error fetching rating title:', error);
      });
    } else {
      setRatingTitle(null);
    }
  }, [id, pathnames]);

  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -5 },
    visible: { opacity: 1, x: 0 }
  };

  const getLabel = (segment: string, index: number) => {
    let label = routeNames[segment] || segment;
    if (['edit', 'fill', 'review'].includes(segment) && ratingTitle && index === pathnames.length - 1) {
      label = `${label}: ${ratingTitle}`;
    }
    return label;
  };

  return (
    <motion.nav
      className="py-3 px-4 bg-white rounded-lg shadow-sm mb-5 border border-gray-100"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <ol className="flex flex-wrap items-center">
        <motion.li variants={itemVariants}>
          <Link 
            to="/" 
            className="flex items-center text-blue-500 hover:text-blue-700 transition-colors duration-200"
          >
            <div className="bg-blue-50 p-1.5 rounded-md mr-2">
              <HomeIcon className="h-4 w-4" />
            </div>
            <span>Головна</span>
          </Link>
        </motion.li>

        {pathnames.map((segment, index) => {
          const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
          const isLast = index === pathnames.length - 1;
          const label = getLabel(segment, index);
          const icon = routeIcons[segment];

          return (
            <motion.li key={routeTo} variants={itemVariants} className="flex items-center">
              <ChevronRightIcon className="h-4 w-4 mx-2 text-gray-400" />
              
              {isLast ? (
                <span className="flex items-center font-medium text-gray-700">
                  {icon && (
                    <span className="bg-gray-50 p-1.5 rounded-md mr-2">
                      {icon}
                    </span>
                  )}
                  <span>{label}</span>
                </span>
              ) : (
                <Link 
                  to={routeTo} 
                  className="flex items-center text-blue-500 hover:text-blue-700 transition-colors duration-200"
                >
                  {icon && (
                    <span className="bg-blue-50 p-1.5 rounded-md mr-2">
                      {icon}
                    </span>
                  )}
                  <span>{label}</span>
                </Link>
              )}
            </motion.li>
          );
        })}
      </ol>
    </motion.nav>
  );
};

export default Breadcrumbs;