import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../components/AuthProvider";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { EyeIcon, EyeSlashIcon, LockClosedIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import ForgotPasswordModal from "./ForgotPasswordModal";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);

      if (response.error) {
        throw new Error(response.message);
      }

      navigate("/");
    } catch (err: any) {
      const message = err.message || "Невірний email або пароль";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-blue-400 to-purple-500 flex items-center justify-center px-4 relative overflow-hidden">
      <motion.div
        className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-300 rounded-full opacity-20 filter blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.3, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-300 rounded-full opacity-20 filter blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.25, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8 border border-white/20"
      >
        <h1 className="text-center text-indigo-700 font-extrabold text-3xl mb-4 tracking-tight">
          📚 UniRate
        </h1>

        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-8">
          Вхід до системи
        </h2>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-red-600 text-center font-medium mb-6 bg-red-100 px-4 py-2 rounded-lg border border-red-200"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Input
              label="Email"
              type="email"
              icon={<EnvelopeIcon className="w-5 h-5 text-indigo-500" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Input
              label="Пароль"
              type={showPassword ? "text" : "password"}
              icon={<LockClosedIcon className="w-5 h-5 text-indigo-500" />}
              rightIcon={
                showPassword ? (
                  <EyeSlashIcon
                    className="w-5 h-5 text-indigo-500 cursor-pointer hover:text-indigo-700 transition"
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <EyeIcon
                    className="w-5 h-5 text-indigo-500 cursor-pointer hover:text-indigo-700 transition"
                    onClick={() => setShowPassword(true)}
                  />
                )
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-indigo-200 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
            />
          </motion.div>

          <div className="flex justify-between items-center text-sm">
            <span />
            <button
              type="button"
              onClick={() => setForgotModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-medium transition hover:underline"
            >
              Забули пароль?
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              type="submit"
              full
              disabled={loading || !email || !password}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:bg-indigo-300"
            >
              {loading ? <Spinner size="small" /> : "Увійти"}
            </Button>
          </motion.div>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <Link
            to="/about"
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm transition hover:underline"
          >
            Про UniRate
          </Link>
        </motion.div>
      </motion.div>

      <ForgotPasswordModal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
      />
    </div>
  );
};

export default LoginPage;