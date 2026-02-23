'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOne, updateOne } from '@/lib/api';
import { useOptions } from '@/hooks/useOptions';

export interface FieldDef {
    key: string;
    label: string;
    type?: string;
    required?: boolean;
    options?: { value: any; label: string }[];
    placeholder?: string;
    optionsApi?: string;
    optionsValueKey?: string;
    optionsLabelKey?: string;
}

interface CrudModalProps {
    title: string;
    apiPath: string;
    queryKey: string;
    primaryKey: string;
    fields: FieldDef[];
    editData?: any;
    onClose: () => void;
}

function ApiSelect({ field, register }: { field: FieldDef; register: any }) {
    const options = useOptions(
        field.optionsApi,
        field.optionsValueKey || 'id',
        field.optionsLabelKey || 'name',
    );

    return (
        <select
            {...register(field.key, {
                required: field.required ? `${field.label} is required` : false,
            })}
            className="select select-bordered w-full rounded-xl text-sm"
        >
            <option value="">Select {field.label}…</option>
            {options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    );
}

export default function CrudModal({
    title, apiPath, queryKey, primaryKey, fields, editData, onClose,
}: CrudModalProps) {
    const qc = useQueryClient();
    const isEdit = !!editData;
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({ defaultValues: editData || {} });

    useEffect(() => {
        reset(editData || {});
    }, [editData]);

    const mutation = useMutation({
        mutationFn: (data: any) =>
            isEdit ? updateOne(apiPath, editData[primaryKey], data) : createOne(apiPath, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: [queryKey] });
            onClose();
        },
    });

    const onSubmit = (data: any) => mutation.mutate(data);

    const renderField = (f: FieldDef) => {
        if (f.optionsApi) {
            return <ApiSelect key={f.key} field={f} register={register} />;
        }

        if (f.type === 'textarea') {
            return (
                <textarea
                    {...register(f.key, {
                        required: f.required ? `${f.label} is required` : false,
                    })}
                    placeholder={f.placeholder}
                    rows={3}
                    className="textarea textarea-bordered w-full rounded-xl text-sm resize-none"
                />
            );
        }

        if (f.type === 'select') {
            return (
                <select
                    {...register(f.key, {
                        required: f.required ? `${f.label} is required` : false,
                    })}
                    className="select select-bordered w-full rounded-xl text-sm"
                >
                    <option value="">Select {f.label}…</option>
                    {f.options?.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            );
        }

        if (f.type === 'radio') {
            return (
                <div className="flex gap-4">
                    {(f.options || [
                        { value: 'Y', label: 'Yes' },
                        { value: 'N', label: 'No' },
                    ]).map((o) => (
                        <label key={o.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                value={o.value}
                                {...register(f.key)}
                                className="radio radio-primary radio-sm"
                            />
                            <span className="text-sm text-base-content/80">{o.label}</span>
                        </label>
                    ))}
                </div>
            );
        }

        return (
            <input
                type={f.type || 'text'}
                {...register(f.key, {
                    required: f.required ? `${f.label} is required` : false,
                })}
                placeholder={f.placeholder}
                className="input input-bordered w-full rounded-xl text-sm"
            />
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-base-200 border border-base-300 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Modal header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-base-300">
                    <h2 className="text-lg font-semibold text-base-content">
                        {isEdit ? 'Edit' : 'Add'} {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-square"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {fields.map((f) => (
                        <div key={f.key}>
                            <label className="block text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-1.5">
                                {f.label}
                                {f.required && <span className="text-error ml-1">*</span>}
                            </label>
                            {renderField(f)}
                            {errors[f.key] && (
                                <p className="mt-1 text-xs text-error">
                                    {String((errors[f.key] as any)?.message)}
                                </p>
                            )}
                        </div>
                    ))}

                    {mutation.isError && (
                        <div className="alert alert-error text-sm py-2.5">
                            Failed to save. Please try again.
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost btn-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || mutation.isPending}
                            className="btn btn-primary btn-sm"
                        >
                            {mutation.isPending ? 'Saving…' : isEdit ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
