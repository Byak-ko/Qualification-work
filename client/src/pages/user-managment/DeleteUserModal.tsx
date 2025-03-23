import ConfirmModal from "../../components/ConfirmModal";

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export default function DeleteUserModal({ isOpen, onClose, onSubmit }: DeleteUserModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      title="Підтвердження видалення"
      message="Ви дійсно хочете видалити користувача?"
      onSubmit={onSubmit}
      onClose={onClose}
      type="danger"
    />
  );
}
