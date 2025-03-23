import { useEffect, useState } from "react";
import { XMarkIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import Input from "../../components/ui/Input"
import Button from "../../components/ui/Button"
import { toast } from "react-toastify";
import { sendPasswordResetEmail } from "../../services/api/authService";

type Props = {
    isOpen: boolean;
    onClose: () => void;
};

const ForgotPasswordModal = ({ isOpen, onClose }: Props) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEsc);
        return () => document.removeEventListener("keydown", handleEsc);
    }, [onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await sendPasswordResetEmail(email);
            toast.success("Інструкції для відновлення паролю надіслано на пошту.");
            onClose();
        } catch (error: any) {
            toast.error(
                error.response?.data?.message || "Не вдалося відправити лист."
            );
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
            <div
                className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md p-6 shadow-lg animate-fade-in-up relative"
                role="dialog"
                aria-modal="true"
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    aria-label="Закрити"
                >
                    <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>

                <h3 className="text-xl font-semibold text-center text-gray-800 dark:text-white mb-4">
                    Забули пароль?
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 text-center">
                    Введіть ваш email, і ми надішлемо інструкції для відновлення паролю.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon={<EnvelopeIcon className="w-5 h-5" />}
                        autoFocus
                    />

                    <Button type="submit" full disabled={loading || !email}>
                        {loading ? "Надсилаємо..." : "Надіслати"}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordModal;
