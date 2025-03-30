import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import * as yup from "yup";
import { 
  EnvelopeIcon, 
  UserIcon, 
  AcademicCapIcon, 
  BriefcaseIcon, 
  BuildingOfficeIcon, 
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
      className="max-w-4xl mx-auto mt-10 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-gray-800 flex items-center">
          <UserIcon className="h-10 w-10 mr-3 text-blue-600" />
          Особистий кабінет
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6 bg-white rounded-xl p-6 shadow-md">
          <ProfileField icon={<UserIcon className="h-5 w-5 text-blue-600" />} label="Ім'я">
            {currentUser.firstName}
          </ProfileField>

          <ProfileField icon={<UserIcon className="h-5 w-5 text-blue-600" />} label="Прізвище">
            {currentUser.lastName}
          </ProfileField>
          
          <ProfileField 
            icon={<AcademicCapIcon className="h-5 w-5 text-green-600" />} 
            label="Ступінь"
          >
            {currentUser.degree}
          </ProfileField>
          
          <ProfileField 
            icon={<BriefcaseIcon className="h-5 w-5 text-purple-600" />} 
            label="Посада"
          >
            {currentUser.position}
          </ProfileField>
         
        </div>

        <div className="space-y-6 bg-white rounded-xl p-6 shadow-md">
        <ProfileField 
            icon={<BuildingOfficeIcon className="h-5 w-5 text-indigo-600" />} 
            label="Кафедра"
          >
            {currentUser.department.name}
          </ProfileField>

          <ProfileField 
            icon={<EnvelopeIcon className="h-5 w-5 text-red-600" />} 
            label="Email"
          >
            {isEditingEmail ? (
              <div className="space-y-2">
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleSaveEmail} 
                    disabled={saving}
                    full
                    isLoading={saving}
                    variant="green"
                  >
                    {saving ? "Збереження..." : "Зберегти"}
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={handleCancelEmail}
                    full
                  >
                    Скасувати
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <span>{formData.email}</span>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => setIsEditingEmail(true)}
                >
                  Змінити
                </Button>
              </div>
            )}
          </ProfileField>

          {/* Заміна кнопки на секцію зміни пароля */}
          <div className="pt-4">
            <ChangePasswordSection />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProfileField({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center gap-3 font-semibold text-gray-700 mb-2">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-gray-900 font-medium pl-9">{children}</div>
    </div>
  );
}
