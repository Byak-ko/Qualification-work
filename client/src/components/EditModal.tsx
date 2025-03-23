import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Input from "./ui/Input";
import Button from "./ui/Button";

type Field = {
  name: string;
  label: string;
  defaultValue?: string | number;
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
};

function EditModal<T>({ isOpen, title, fields, onClose, onSubmit, errors }: EditModalProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    const initialValues: Record<string, any> = {};
    fields.forEach((field) => {
      initialValues[field.name] = field.defaultValue ?? "";
    });
    setFormData(initialValues);
  }, [fields, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData as T);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200"
          >
            <h2 className="text-2xl font-semibold mb-5 text-gray-800">{title}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((field) =>
                field.options ? (
                  <div key={field.name}>
                    <label className="block mb-1 text-sm font-medium text-gray-700">{field.label}</label>
                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      disabled={field.readOnly}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <Input
                    key={field.name}
                    name={field.name}
                    label={field.label}
                    value={formData[field.name]}
                    onChange={handleChange}
                    readOnly={field.readOnly}
                    type={field.type || "text"}
                    required={!field.readOnly}
                  />
                )
              )}

              {errors &&
                Object.entries(errors).map(([key, err]) => (
                  <p key={key} className="text-sm text-red-500">
                    {err?.message}
                  </p>
                ))}

              <div className="flex justify-end gap-2 pt-4">
                <Button type="submit" variant="green">Зберегти</Button>
                <Button type="button" variant="secondary" onClick={onClose}>
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
