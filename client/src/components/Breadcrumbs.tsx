import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  HomeIcon, 
  ChevronRightIcon, 
  UserGroupIcon, 
  StarIcon, 
  DocumentChartBarIcon, 
  BuildingOfficeIcon,
  UserCircleIcon
} from "@heroicons/react/24/solid";

const routeNames: Record<string, string> = {
  "": "Головна",
  users: "Користувачі",
  ratings: "Рейтинги",
  reports: "Мої звіти",
  units: "Підрозділи",
  profile: "Особистий кабінет",
};

const routeIcons: Record<string, React.ReactNode> = {
  users: <UserGroupIcon className="w-4 h-4" />,
  ratings: <StarIcon className="w-4 h-4" />,
  reports: <DocumentChartBarIcon className="w-4 h-4" />,
  units: <BuildingOfficeIcon className="w-4 h-4" />,
  profile: <UserCircleIcon className="w-4 h-4" />,
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

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
          const label = routeNames[segment] || segment;
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