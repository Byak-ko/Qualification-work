import { useEffect, useState } from "react";
import { api } from "../../services/api/api";
import { useAuth } from "../../components/AuthProvider";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import { motion } from "framer-motion";
import * as yup from "yup";
import {
  EnvelopeIcon,
  UserIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  PencilSquareIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import ChangePasswordModal from "./ChangePasswordModal"; 

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Неправильний формат email")
    .required("Email є обов'язковим"),
});

export default function UserProfilePage() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({ email: "" });
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      setFormData({ email: currentUser.email });
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSave = async () => {
    try {
      await schema.validate(formData, { abortEarly: false });
      setSaving(true);
      await api.patch(`/users/${currentUser?.id}`, formData);
      alert("Email успішно оновлено!");
    } catch (err: any) {
      if (err.name === "ValidationError") {
        setError(err.errors[0]);
      } else {
        alert("Помилка при оновленні email");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) return <Skeleton />;

  return (
    <motion.div
      className="max-w-3xl mx-auto mt-10 bg-white rounded-xl shadow-lg p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Особистий кабінет</h1>

      <div className="space-y-4 text-gray-700">
        <ProfileField icon={<UserIcon className="h-5 w-5" />} label="Ім'я">
          {currentUser.firstName} {currentUser.lastName}
        </ProfileField>

        <ProfileField icon={<EnvelopeIcon className="h-5 w-5" />} label="Email">
          <Input
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </ProfileField>

        <ProfileField icon={<AcademicCapIcon className="h-5 w-5" />} label="Ступінь">
          {currentUser.degree}
        </ProfileField>

        <ProfileField icon={<BriefcaseIcon className="h-5 w-5" />} label="Посада">
          {currentUser.position}
        </ProfileField>

        <ProfileField icon={<BuildingOfficeIcon className="h-5 w-5" />} label="Кафедра">
          {currentUser.department.name}
        </ProfileField>

        <div className="flex gap-3 pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Збереження..." : "Зберегти"}
          </Button>
          <Button
            variant="secondary"
            icon={<KeyIcon className="h-5 w-5" />}
            onClick={() => setShowModal(true)}
          >
            Змінити пароль
          </Button>
        </div>
      </div>

      <ChangePasswordModal isOpen={showModal} onClose={() => setShowModal(false)} />
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
    <div>
      <div className="flex items-center gap-2 font-medium text-gray-600 mb-1">
        {icon}
        {label}
      </div>
      <div className="text-gray-900">{children}</div>
    </div>
  );
}
