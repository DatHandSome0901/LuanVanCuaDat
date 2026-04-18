import React from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="relative bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-8 w-full max-w-[360px] overflow-hidden"
          >
            {/* Decoration */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-red-600 to-red-700" />
            
            <div className="flex flex-col items-center text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-600 shadow-inner">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-stone-900 mb-2 font-serif">Xác nhận xóa</h3>
              <p className="text-stone-500 mb-8 leading-relaxed">
                {message || "Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác."}
              </p>

              <div className="flex flex-col w-full gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-200 transition-colors"
                >
                  Xác nhận xóa
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCancel}
                  className="w-full py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-600 font-bold rounded-2xl transition-colors"
                >
                  Hủy bỏ
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;