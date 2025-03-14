import React, { useState, useEffect } from "react";
import Button from "./ui/Button";

type Field = {
  name: string;
  label: string;
  defaultValue?: string | number;
  type?: string;
  options?: { value: string | number; label: string }[];
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded shadow max-h-[90vh] overflow-y-auto w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) =>
            field.options ? (
              <div key={field.name}>
                <label className="block mb-1">{field.label}</label>
                <select
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
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
              <div key={field.name}>
                <label className="block mb-1">{field.label}</label>
                <input
                  type={field.type || "text"}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  required
                />
                {errors?.[field.name] && <p className="text-red-500 text-sm">{errors[field.name]?.message}</p>}
              </div>
            )
          )}

          <div className="flex justify-end gap-2">
            <Button type="submit">Зберегти</Button>
            <Button type="button" onClick={onClose}>
              Закрити
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditModal;
