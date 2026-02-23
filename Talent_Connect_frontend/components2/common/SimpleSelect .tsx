interface SimpleSelectProps {
  label: string;
  value: number | string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { label: string; value: number | string }[];
  error?: string;
}

export const SimpleSelect = ({
  label,
  value,
  onChange,
  options,
  error,
}: SimpleSelectProps) => {
    console.log('error >>>' , error)
  return (
    <div className="space-y-2">
      <label className="font-semibold text-base-content">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 rounded-lg border text-base 
        ${
          error
            ? "border-red-500 focus:ring-red-200"
            : "border-base-300 focus:ring-primary/30"
        }
        focus:outline-none focus:ring-2 bg-base-100`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )} */}
    </div>
  );
};
