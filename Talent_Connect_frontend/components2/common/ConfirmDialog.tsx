// ConfirmDialog.tsx
"use client";

import { ReactNode } from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    message: any;
    title?: string;
    onConfirm: () => void;
    onCancel: () => void;
    children?: ReactNode;
}

export default function ConfirmDialog({
    isOpen,
    message,
    title = "Confirm Action",
    onConfirm,
    onCancel,
    children
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <>
            <input
                type="checkbox"
                id="confirm-dialog"
                className="modal-toggle"
                checked={isOpen}
                readOnly
            />
            <div className="modal modal-open">
                <div className="modal-box max-w-md">
                    <h3 className="font-bold text-lg">{title}</h3>
                    <p className="py-4">{message}</p>
                    {children && <div className="py-4">{children}</div>}

                    <div className="modal-action">

                        <label
                            htmlFor="confirm-dialog"
                            className="btn btn-ghost"
                            onClick={onCancel}
                        >
                            Cancel
                        </label>
                        <button className="btn btn-primary" onClick={onConfirm}>
                            Confirm
                        </button>

                    </div>
                </div>
                <label
                    className="modal-backdrop"
                    htmlFor="confirm-dialog"
                    onClick={onCancel}
                />
            </div>
        </>
    );
}
