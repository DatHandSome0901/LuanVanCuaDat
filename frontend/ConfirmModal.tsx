import React from "react";

type Props = {
  open: boolean;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmModal: React.FC<Props> = ({
  open,
  message,
  onCancel,
  onConfirm
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      {/* nền mờ */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-[320px] animate-fadeIn">

        <p className="text-gray-800 mb-5 text-center font-medium">
          {message}
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
          >
            Hủy
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Xóa
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmModal;