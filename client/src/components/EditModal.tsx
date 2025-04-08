import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "./ui/Button";
import { SparklesIcon } from "@heroicons/react/24/outline";
import Spinner from "./ui/Spinner";

type Field = {
  name: string;
  label: string;
  defaultValue?: string | number | boolean;
  type?: string;
  options?: { value: string | number; label: string }[];
  readOnly?: boolean;
};

export type EditModalProps<T> = {
  isOpen: boolean;
  title: string;
  fields: Field[];
  onClose: () => void;
  onSubmit: (formData: T) => void | Promise<void>;
  errors?: Record<string, { message: string | undefined }>;
  isSubmitting?: boolean;
};

function EditModal<T>({ isOpen, title, fields, onClose, onSubmit, errors, isSubmitting }: EditModalProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    const initialValues: Record<string, any> = {};
    fields.forEach((field) => {
      initialValues[field.name] = field.defaultValue ?? "";
    });
    setFormData(initialValues);
  }, [fields, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement; // Приводимо до HTMLInputElement для доступу до checked
    
    // Спеціальна обробка для чекбоксів
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData as T);
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
          <div className="fixed -top-20 -left-20 w-64 h-64 bg-purple-200 rounded-full filter blur-3xl opacity-30 z-0 animate-pulse"></div>
          <div className="fixed bottom-20 -right-20 w-72 h-72 bg-blue-200 rounded-full filter blur-3xl opacity-30 z-0"></div>
          <div className="fixed -bottom-20 left-40 w-60 h-60 bg-pink-200 rounded-full filter blur-3xl opacity-20 z-0"></div>

          <motion.div
            key="modal"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-purple-200 z-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <SparklesIcon className="w-8 h-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500" />
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">{title}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {fields.map((field) => {
                // Спеціальна обробка для поля типу checkbox
                if (field.type === "checkbox") {
                  return (
                    <div key={field.name} className="group flex items-center">
                      <input
                        name={field.name}
                        type="checkbox"
                        checked={!!formData[field.name]}
                        onChange={handleChange}
                        className="w-5 h-5 text-purple-600 border border-purple-200 rounded focus:ring-purple-400"
                      />
                      <label className="ml-2 text-sm font-medium text-indigo-700">{field.label}</label>
                    </div>
                  );
                }
                // Для поля з опціями (select)
                else if (field.options) {
                  return (
                    <div key={field.name} className="group">
                      <label className="block mb-2 text-sm font-medium text-indigo-700 group-hover:text-indigo-800 transition-colors duration-200">{field.label}</label>
                      <select
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        disabled={field.readOnly}
                        className="w-full px-4 py-2.5 bg-purple-50 border border-purple-200 rounded-xl text-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 hover:bg-purple-100"
                        required
                      >
                        {field.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }
                // Для звичайних текстових полів
                else {
                  return (
                    <div key={field.name} className="group">
                      <label className="block mb-2 text-sm font-medium text-indigo-700 group-hover:text-indigo-800 transition-colors duration-200">{field.label}</label>
                      <input
                        name={field.name}
                        type={field.type || "text"}
                        value={formData[field.name]}
                        onChange={handleChange}
                        readOnly={field.readOnly}
                        required={!field.readOnly}
                        className={`w-full px-4 py-2.5 bg-purple-50 border border-purple-200 rounded-xl text-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 hover:bg-purple-100 ${field.readOnly ? "bg-gray-100 cursor-not-allowed opacity-70" : ""
                          }`}
                      />
                    </div>
                  );
                }
              })}

              {errors &&
                Object.entries(errors).map(([key, err]) => (
                  <motion.p
                    key={key}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 font-medium pl-2 border-l-2 border-red-400"
                  >
                    {err?.message}
                  </motion.p>
                ))}

              <div className="flex justify-end gap-3 pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="green"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-purple-700 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
                >
                  {isSubmitting ? <Spinner size="small" color="primary" /> : "Зберегти"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  Закрити
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default EditModal;