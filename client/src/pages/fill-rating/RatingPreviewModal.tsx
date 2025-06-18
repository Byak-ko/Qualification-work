import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import Button from "../../components/ui/Button";
import { XMarkIcon, DocumentCheckIcon, StarIcon, ExclamationTriangleIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { RatingItem } from "../../types/Rating";

type Props = {
  isOpen: boolean;
  items: RatingItem[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export default function RatingPreviewModal({
  isOpen,
  items,
  submitting,
  onClose,
  onSubmit
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const prevFocusedElementRef = useRef<HTMLElement | null>(null);

  const getFileNameFromUrl = (url: string) => {
    try {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1];
    } catch (e) {
      return 'Документ';
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      prevFocusedElementRef.current = document.activeElement as HTMLElement;
      if (modalRef.current) {
        const firstFocusable = modalRef.current.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        firstFocusable?.focus();
      }
    } else {
      document.body.style.overflow = "unset";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) {
        onClose();
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
      prevFocusedElementRef.current?.focus();
    };
  }, [isOpen, onClose, submitting]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Попередній перегляд рейтингу"
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="fixed inset-0 flex items-center justify-center p-4"
          >
            <div
              ref={modalRef}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            >
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 pb-8">
                <div className="flex items-center">
                  <DocumentCheckIcon className="w-8 h-8 mr-3" />
                  <h2 className="text-2xl font-bold flex-grow">Попередній перегляд</h2>
                  <Button
                    variant="icon-secondary"
                    size="sm"
                    icon={<XMarkIcon className="w-5 h-5" />}
                    onClick={onClose}
                    className="text-white/80 hover:text-white hover:bg-white/20 p-1"
                    aria-label="Закрити"
                  />
                </div>
                <p className="text-white/80 mt-2">Перевірте введені дані перед надсиланням:</p>
              </div>
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {items.map((item) => {
                  const hasAnyDocuments =
                    (item.documents && item.documents.length > 0) ||
                    (item.documentUrls && item.documentUrls.length > 0);

                  const isDocumentsMissing = item.isDocNeed && item.score > 0 && !hasAnyDocuments;

                  return (
                    <div
                      key={item.id}
                      className="bg-indigo-50 border-2 border-indigo-100 rounded-xl p-4 hover:bg-indigo-100 transition-colors group"
                    >
                      <div className="flex items-center mb-2">
                        <StarIcon className="w-6 h-6 text-indigo-500 mr-2" />
                        <h3 className="text-lg font-bold text-gray-800 flex-grow">{item.name}</h3>
                        <div className="bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full text-sm font-semibold">
                          {item.score}
                        </div>
                      </div>

                      {item.documentUrls && item.documentUrls.length > 0 && (
                        <div className="mt-2">
                          <p className="text-gray-600 flex items-center">
                            <DocumentTextIcon className="w-5 h-5 mr-2 text-green-500" />
                            Завантажені раніше документи:{" "}
                            <span className="ml-2 text-gray-700 font-medium">
                              {item.documentUrls.map(url => getFileNameFromUrl(url)).join(", ")}
                            </span>
                          </p>
                        </div>
                      )}

                      {item.documents && item.documents.length > 0 && (
                        <div className="mt-2">
                          <p className="text-gray-600 flex items-center">
                            <DocumentCheckIcon className="w-5 h-5 mr-2 text-indigo-500" />
                            Нові документи:{" "}
                            <span className="ml-2 text-gray-700 font-medium">
                              {item.documents.map(file => file.name).join(", ")}
                            </span>
                          </p>
                        </div>
                      )}

                      {!hasAnyDocuments && (
                        <div className="mt-2">
                          <p className="text-gray-600 flex items-center">
                            <DocumentCheckIcon className="w-5 h-5 mr-2 text-indigo-500" />
                            Документи: <span className="ml-2 text-gray-700 font-medium">немає</span>
                          </p>
                        </div>
                      )}

                      {isDocumentsMissing && (
                        <div className="mt-2">
                          <p className="text-red-500 flex items-center">
                            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                            Потрібні документи
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-end gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={onSubmit}
                  disabled={submitting}
                  isLoading={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Зберегти
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onClose}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg"
                >
                  Назад
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const modalRoot = document.getElementById("modal-root") || document.body;
  return createPortal(modalContent, modalRoot);
}