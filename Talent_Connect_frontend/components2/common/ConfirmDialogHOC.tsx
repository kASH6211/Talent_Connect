// "use client";

// import React, { useEffect, useCallback } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { RootState, AppDispatch } from "@/store/store";
// import { closeConfirm } from "@storek";

// export default function GlobalConfirmModal() {
//   const dispatch = useDispatch<AppDispatch>();

//   const { isOpen, message, onConfirm, onCancel } = useSelector(
//     (state: RootState) => state.confirm
//   );

//   const handleConfirm = useCallback(() => {
//     onConfirm?.();
//     dispatch(closeConfirm());
//   }, [dispatch, onConfirm]);

//   const handleCancel = useCallback(() => {
//     onCancel?.();
//     dispatch(closeConfirm());
//   }, [dispatch, onCancel]);

//   useEffect(() => {
//     const handleEscape = (e: KeyboardEvent) => {
//       if (e.key === "Escape" && isOpen) {
//         handleCancel();
//       }
//     };

//     if (isOpen) {
//       document.body.style.overflow = "hidden";
//       document.addEventListener("keydown", handleEscape);
//     }

//     return () => {
//       document.body.style.overflow = "unset";
//       document.removeEventListener("keydown", handleEscape);
//     };
//   }, [isOpen, handleCancel]);

//   if (!isOpen) return null;

//   return (
//     <div className="modal modal-open">
//       <div className="modal-box">

//         {/* Title */}
//         <h3 className="font-bold text-lg text-base-content">
//           Delete Confirmation
//         </h3>

//         {/* Message */}
//         <p className="py-4 text-base-content/70">
//           {message || "Are you sure you want to delete this record?"}
//         </p>

//         {/* Actions */}
//         <div className="modal-action">
//           <button
//             className="btn btn-outline"
//             onClick={handleCancel}
//           >
//             Cancel
//           </button>

//           <button
//             className="btn btn-error"
//             onClick={handleConfirm}
//           >
//             Yes, Delete
//           </button>
//         </div>
//       </div>

//       {/* Backdrop */}
//       <div className="modal-backdrop" onClick={handleCancel}></div>
//     </div>
//   );
// }
