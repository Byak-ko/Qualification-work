import React from 'react';
import { motion } from 'framer-motion';
import { 
  InformationCircleIcon, 
  StarIcon, 
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import Breadcrumbs from '../components/Breadcrumbs';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      when: 'beforeChildren',
      staggerChildren: 0.3,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
  hover: { scale: 1.03, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)' },
};

const iconVariants = {
  hover: { scale: 1.2, rotate: 5, transition: { duration: 0.3 } },
};

const AboutPage: React.FC = () => {
  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs />

        {/* Hero Section */}
        <motion.section
          variants={sectionVariants}
          className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl shadow-2xl p-8 sm:p-12 mb-12 overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent)] opacity-50"></div>
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
              Про нашу систему
            </h1>
            <p className="text-lg sm:text-xl max-w-2xl mb-6 leading-relaxed opacity-90">
              Сучасна платформа для управління рейтингами, що спрощує оцінку діяльності та підвищує ефективність командної роботи.
            </p>
          </div>
        </motion.section>

        {/* About Section */}
        <motion.section
          variants={sectionVariants}
          className="mb-12 bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 sm:p-12 border border-gray-100/50"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <InformationCircleIcon className="h-8 w-8 text-indigo-600 mr-3" />
            Що це за система?
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            Наша система створена для автоматизації та спрощення процесу оцінки діяльності працівників у науковій, навчально-методичній та організаційно-виховній сферах. Вона забезпечує прозорість, гнучкість і зручність для всіх учасників — від авторів рейтингів до респондентів і рецензентів.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed">
            Завдяки інтуїтивному інтерфейсу, безпечному доступу та потужним аналітичним інструментам, система допомагає організаціям ефективно керувати рейтингами та аналізувати результати.
          </p>
        </motion.section>

        {/* Features Section */}
        <motion.section variants={sectionVariants} className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center text-center sm:text-left">
            <StarIcon className="h-8 w-8 text-indigo-600 mr-3" />
            Ключові можливості
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Створення рейтингів',
                description: 'Гнучке налаштування рейтингів для різних типів діяльності з підтримкою шаблонів.',
              },
              {
                title: 'Заповнення рейтингів',
                description: 'Зручний інтерфейс для респондентів із чіткими інструкціями та автозбереженням.',
              },
              {
                title: 'Перегляд і затвердження',
                description: 'Автоматизований процес перевірки та затвердження рейтингів рецензентами.',
              },
              {
                title: 'Аналітика та звіти',
                description: 'Генерація детальних звітів для аналізу результатів і прийняття рішень.',
              },
              {
                title: 'Управління підрозділами',
                description: 'Легке керування структурами організації та ролями користувачів.',
              },
              {
                title: 'Безпека та доступ',
                description: 'Захищений доступ через авторизацію та підтримка різних ролей.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                className="relative bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-transparent bg-clip-padding bg-gradient-to-r from-indigo-100/50 to-purple-100/50 shadow-lg"
              >
                <motion.div variants={iconVariants} className="absolute top-4 right-4">
                  <StarIcon className="h-6 w-6 text-indigo-500 opacity-50" />
                </motion.div>
                <div className="flex items-start">
                  <div className="bg-indigo-50 p-3 rounded-full mr-4">
                    <InformationCircleIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Contact Section */}
        <motion.section
          variants={sectionVariants}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 sm:p-12 border border-gray-100/50"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
            <EnvelopeIcon className="h-8 w-8 text-indigo-600 mr-3" />
            Зв’яжіться з нами
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Маєте питання чи потрібна допомога? Наша команда підтримки готова відповісти!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.a
              href="mailto:support@ratingsystem.com"
              whileHover={{ scale: 1.05 }}
              className="flex items-center p-4 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors duration-300"
            >
              <motion.div variants={iconVariants} className="bg-indigo-200 p-3 rounded-full mr-4">
                <EnvelopeIcon className="h-6 w-6 text-indigo-600" />
              </motion.div>
              <div>
                <p className="text-gray-800 font-medium">Електронна пошта</p>
                <p className="text-blue-500 hover:text-blue-700">support@ratingsystem.com</p>
              </div>
            </motion.a>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default AboutPage;