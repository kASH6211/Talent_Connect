import { AlertCircle } from "lucide-react";

interface ToggleFieldProps {
    label: string;
    name: string;
    register: any;
    error?: string;
}

export const CommonToggleField = ({ label, name, register, error }: ToggleFieldProps) => (
    <div className="space-y-4">
        <label className="text-sm font-semibold text-base-content/90">{label}</label>
        <div className={`p-6 border-2 rounded-2xl transition-all duration-200 flex items-center justify-center gap-10 ${error
                ? "border-error bg-error/5"
                : "border-base-300 hover:border-primary/30 bg-base-200/50"
            }`}>
            <label className="flex items-center gap-4 cursor-pointer p-4 rounded-xl hover:bg-base-100 transition-all group">
                <input
                    type="radio"
                    value="Y"
                    {...register(name)}
                    className="w-7 h-7 radio radio-lg radio-primary border-4"
                />
                <span className="text-xl font-bold text-base-content group-hover:text-primary">Yes</span>
            </label>
            <label className="flex items-center gap-4 cursor-pointer p-4 rounded-xl hover:bg-base-100 transition-all group">
                <input
                    type="radio"
                    value="N"
                    {...register(name)}
                    className="w-7 h-7 radio radio-lg border-4"
                />
                <span className="text-xl font-bold text-base-content group-hover:text-primary">No</span>
            </label>
        </div>
        {error && (
            <div className="flex items-center gap-2 text-error text-sm p-3 bg-error/10 border border-error/20 rounded-xl backdrop-blur-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
            </div>
        )}
    </div>
);
