import Button from "./ui/Button";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onSubmit: () => void | Promise<void>;
  onClose: () => void
};

const ConfirmModal = ({ isOpen, title, message, onSubmit, onClose, }: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <Button onClick={onSubmit}>Так</Button>
          <Button onClick={onClose}>Скасувати</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
