import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as yup from "yup";
import { 
  EnvelopeIcon, 
  UserIcon, 
  AcademicCapIcon, 
  BriefcaseIcon, 
  BuildingOfficeIcon,
  SparklesIcon,
  StarIcon
} from "@heroicons/react/24/outline";

import { toast } from "react-toastify";
import { api } from "../../services/api/api";
import { useAuth } from "../../components/AuthProvider";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import SkeletonCard from "../../components/ui/Skeleton";
import ChangePasswordSection from "./ChangePasswordSection";

const emailSchema = yup.object().shape({
  email: yup
    .string()
    .email("Неправильний формат email")
    .required("Email є обов'язковим"),
});

export default function UserProfilePage() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({ email: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [originalEmail, setOriginalEmail] = useState("");

  useEffect(() => {
    if (currentUser) {
      const email = currentUser.email;
      setFormData({ email });
      setOriginalEmail(email);
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSaveEmail = async () => {
    try {
      await emailSchema.validate(formData, { abortEarly: false });
      setSaving(true);
      await api.patch(`/users/${currentUser?.id}/email`, formData);
      setOriginalEmail(formData.email);
      setIsEditingEmail(false);
      toast.success("Email успішно оновлено!");
    } catch (err: any) {
      if (err.name === "ValidationError") {
        setError(err.errors[0]);
      } else {
        toast.error("Помилка при оновленні email");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEmail = () => {
    setFormData({ email: originalEmail });
    setIsEditingEmail(false);
    setError("");
  };

  if (!currentUser) return <SkeletonCard />;

  return (
    <motion.div
      className="max-w-4xl mx-auto mt-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-2xl p-8 border border-indigo-100 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100 to-transparent rounded-full blur-3xl opacity-40 -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-100 to-transparent rounded-full blur-3xl opacity-40 -ml-20 -mb-20"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <motion.h1 
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <motion.div
              className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-full mr-4 text-white shadow-lg"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <UserIcon className="h-8 w-8" />
            </motion.div>
            Особистий кабінет
          </motion.h1>
          
          <motion.div 
            className="hidden md:flex items-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <SparklesIcon className="h-8 w-8 text-indigo-400 animate-pulse" />
            <StarIcon className="h-6 w-6 text-purple-400" />
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div 
            className="space-y-6 backdrop-blur-sm bg-white/80 rounded-xl p-6 shadow-xl border border-indigo-100"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <ProfileField 
              icon={<UserIcon className="h-5 w-5 text-blue-600" />} 
              label="Ім'я"
              color="blue"
            >
              {currentUser.firstName}
            </ProfileField>

            <ProfileField 
              icon={<UserIcon className="h-5 w-5 text-blue-600" />} 
              label="Прізвище"
              color="blue"
            >
              {currentUser.lastName}
            </ProfileField>
            
            <ProfileField 
              icon={<AcademicCapIcon className="h-5 w-5 text-green-600" />} 
              label="Ступінь"
              color="green"
            >
              {currentUser.degree}
            </ProfileField>
            
            <ProfileField 
              icon={<BriefcaseIcon className="h-5 w-5 text-purple-600" />} 
              label="Посада"
              color="purple"
            >
              {currentUser.position}
            </ProfileField>
          </motion.div>

          <motion.div 
            className="space-y-6 backdrop-blur-sm bg-white/80 rounded-xl p-6 shadow-xl border border-indigo-100"
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <ProfileField 
              icon={<BuildingOfficeIcon className="h-5 w-5 text-indigo-600" />} 
              label="Кафедра"
              color="indigo"
            >
              {currentUser.department.name}
            </ProfileField>

            <ProfileField 
              icon={<EnvelopeIcon className="h-5 w-5 text-red-600" />} 
              label="Email"
              color="red"
            >
              {isEditingEmail ? (
                <div className="space-y-2">
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleSaveEmail} 
                      disabled={saving}
                      full
                      isLoading={saving}
                      variant="green"
                      className="transition-all duration-300 hover:shadow-lg"
                    >
                      {saving ? "Збереження..." : "Зберегти"}
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={handleCancelEmail}
                      full
                      className="transition-all duration-300 hover:shadow-lg"
                    >
                      Скасувати
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span>{formData.email}</span>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={() => setIsEditingEmail(true)}
                      className="transition-all duration-300 hover:shadow-lg"
                    >
                      Змінити
                    </Button>
                  </motion.div>
                </div>
              )}
            </ProfileField>

            <div className="pt-4">
              <ChangePasswordSection />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function ProfileField({
  icon,
  label,
  children,
  color
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  color: string;
}) {
  return (
    <div className={`bg-gradient-to-r from-${color}-50 to-white rounded-lg p-4 border border-${color}-100 shadow-sm overflow-hidden relative backdrop-blur-sm`}>
      <div className={`flex items-center gap-3 font-semibold text-${color}-700 mb-2`}>
        <div className={`bg-${color}-100 p-2 rounded-full`}>
          {icon}
        </div>
        <span className="text-lg">{label}</span>
      </div>
      <div className="text-gray-900 font-medium pl-11 py-1">{children}</div>
      <div className={`absolute w-2 h-full top-0 left-0 bg-${color}-400 rounded-r-lg`}></div>
    </div>
  );
}