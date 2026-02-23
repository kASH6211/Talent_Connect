"use client";
import { closeConfirm } from "@/store/common/confirmSlice";
import { RootState } from "@/store/store";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

const GlobalConfirmModal = () => {
  const dispatch = useDispatch();
  const { isOpen, message, onConfirm, onCancel } = useSelector(
    (state: RootState) => state.confirm,
  );

  const handleConfirm = () => {
    onConfirm?.();
    dispatch(closeConfirm());
  };

  const handleCancel = () => {
    onCancel?.();
    dispatch(closeConfirm());
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleCancel();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handleCancel]);

  if (!isOpen) return null;

  return (
    <>
      <input
        type="checkbox"
        className="modal-toggle"
        checked={isOpen}
        readOnly
      />
      <div className="modal modal-open">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Delete Confirmation</h3>
          <p className="py-4">{message}</p>
          <div className="modal-action">
            <button className="btn" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleConfirm}>
              Yes, Delete
            </button>
          </div>
        </div>
        <div className="modal-backdrop" onClick={handleCancel} />
      </div>
    </>
  );
};

export default GlobalConfirmModal;
