import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { HomeIcon } from "@heroicons/react/24/solid"; 

const routeNames: Record<string, string> = {
  "": "Головна",
  users: "Користувачі",
  ratings: "Рейтинги",
  reports: "Мої звіти",
  units: "Підрозділи",
  me: "Особистий кабінет",
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  return (
    <motion.nav
      className="text-sm text-gray-500 dark:text-gray-400 mb-4"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <ol className="flex flex-wrap items-center space-x-2">
        <li>
          <Link to="/" className="flex items-center hover:underline text-indigo-600 dark:text-indigo-400">
            <HomeIcon className="h-4 w-4 mr-1" />
            Головна
          </Link>
        </li>

        {pathnames.map((segment, index) => {
          const routeTo = "/" + pathnames.slice(0, index + 1).join("/");
          const isLast = index === pathnames.length - 1;
          const label = routeNames[segment] || segment;

          return (
            <li key={routeTo} className="flex items-center space-x-2">
              <span className="mx-1 text-gray-400">/</span>
              {isLast ? (
                <span className="font-medium text-gray-700 dark:text-gray-200">{label}</span>
              ) : (
                <Link to={routeTo} className="hover:underline text-indigo-600 dark:text-indigo-400">
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </motion.nav>
  );
};

export default Breadcrumbs;
