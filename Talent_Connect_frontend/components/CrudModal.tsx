"use client";
import {
  X,
  AlertCircle,
  CheckCircle2,
  Building2,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOne, updateOne } from "@/lib/api";
import { useOptions } from "@/hooks/useOptions";

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
  dependsOn?: string;
  dependsOnQueryKey?: string;
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

function ApiSelect({ field, register, watch }: { field: FieldDef; register: any, watch: any }) {
  // If this field depends on another, watch that field's value
  const dependentValue = field.dependsOn ? watch(field.dependsOn) : undefined;

  // Conditionally construct the API path if there is a dependency
  let apiPath = field.optionsApi;
  if (field.dependsOn && field.optionsApi) {
    if (dependentValue) {
      apiPath = `${field.optionsApi}?${field.dependsOnQueryKey}=${dependentValue}`;
    } else {
      apiPath = undefined; // Don't fetch until dependency is selected
    }
  }

  const options = useOptions(
    apiPath,
    field.optionsValueKey || "id",
    field.optionsLabelKey || "name",
  );

  return (
    <select
      {...register(field.key, {
        required: field.required ? `${field.label} is required` : false,
      })}
      disabled={field.dependsOn && !dependentValue}
      className="w-full h-14 px-4 border border-base-200/20 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
    >
      <option value="">Select {field.label}…</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

const FormField = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1">
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    {children}
    {error && (
      <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-lg">
        <AlertCircle className="w-4 h-4" /> {error}
      </div>
    )}
  </div>
);

export default function CrudModal({
  title,
  apiPath,
  queryKey,
  primaryKey,
  fields,
  editData,
  onClose,
}: CrudModalProps) {
  const qc = useQueryClient();
  const isEdit = !!editData;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: editData || {} });

  useEffect(() => reset(editData || {}), [editData]);

  const mutation = useMutation({
    mutationFn: (data: any) =>
      isEdit
        ? updateOne(apiPath, editData[primaryKey], data)
        : createOne(apiPath, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [queryKey] });
      onClose();
    },
  });

  const onSubmit = (data: any) => mutation.mutate(data);

  const renderField = (f: FieldDef) => {
    if (f.optionsApi)
      return <ApiSelect key={f.key} field={f} register={register} watch={watch} />;
    if (f.type === "textarea")
      return (
        <textarea
          {...register(f.key, { required: f.required })}
          placeholder={f.placeholder}
          rows={3}
          className="w-full h-28 px-4 py-2 border border-base-200/20 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none"
        />
      );
    if (f.type === "select")
      return (
        <select
          {...register(f.key, { required: f.required })}
          className="w-full h-14 px-4 border border-base-200/20 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
        >
          <option value="">Select {f.label}…</option>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    if (f.type === "radio")
      return (
        <div className="flex gap-4">
          {(
            f.options || [
              { value: "Y", label: "Yes" },
              { value: "N", label: "No" },
            ]
          ).map((o) => (
            <label
              key={o.value}
              className="flex items-center gap-2 cursor-pointer text-gray-700"
            >
              <input
                type="radio"
                value={o.value}
                {...register(f.key)}
                className="radio radio-primary radio-sm"
              />
              <span className="text-sm">{o.label}</span>
            </label>
          ))}
        </div>
      );
    return (
      <input
        type={f.type || "text"}
        {...register(f.key, { required: f.required })}
        placeholder={f.placeholder}
        className="w-full h-14 px-4 border border-base-200/20 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
      />
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl max-h-[95vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEdit ? `Edit ${title}` : `Add ${title}`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-auto"
        >
          <div className="p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300/50 scrollbar-track-gray-100/50">
            {fields.map((f) => (
              <FormField
                key={f.key}
                label={f.label}
              // error={errors[f.key]?.message}
              >
                {renderField(f)}
              </FormField>
            ))}

            {mutation.isError && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm shadow-sm">
                Failed to save. Please try again.
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-primary text-white flex items-center gap-2 hover:bg-primary/90 transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              {isEdit ? "Update" : "Create"} {title}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
