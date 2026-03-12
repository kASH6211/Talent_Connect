"use client";

import React, { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { closeConfirm, getConfirmCallback, getCancelCallback } from "@/store/common/confirmSlice";
import { AlertTriangle, X } from "lucide-react";

export default function GlobalConfirmModal() {
  const dispatch = useDispatch<AppDispatch>();

  const { isOpen, message, title } = useSelector(
    (state: RootState) => state.confirm,
  );

  const handleConfirm = useCallback(() => {
    // Read callback from module-level ref (not Immer-frozen Redux state)
    const cb = getConfirmCallback();
    dispatch(closeConfirm());
    cb?.();
  }, [dispatch]);

  const handleCancel = useCallback(() => {
    const cb = getCancelCallback();
    dispatch(closeConfirm());
    cb?.();
  }, [dispatch]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Modal container */}
      <div
        className={`
          relative w-full max-w-md transform overflow-hidden rounded-2xl 
          bg-base-100 shadow-2xl transition-all duration-300
          scale-100 opacity-100
          border border-base-200/60
        `}
      >
        {/* Header with warning icon */}
        <div className="flex items-center gap-3 border-b border-base-200/60 bg-base-200/40 px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-error/10 text-error">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-lg font-semibold text-base-content">
            {title || "Confirm Action"}
          </h3>
        </div>

        {/* Close button */}
        <button
          onClick={handleCancel}
          className="absolute right-4 top-4 rounded-full p-1.5 text-base-content/60 hover:bg-base-200/60 hover:text-base-content transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Message body */}
        <div className="px-6 py-6">
          <p className="text-base-content/90 leading-relaxed">
            {message ||
              "Are you sure you want to delete this record?\nThis action cannot be undone."}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-base-200/60 bg-base-200/20 px-6 py-4">
          <button
            onClick={handleCancel}
            className="btn btn-outline btn-sm min-w-[100px]"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            className="btn btn-error text-white btn-sm min-w-[100px] gap-2"
          >
            Yes, Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
