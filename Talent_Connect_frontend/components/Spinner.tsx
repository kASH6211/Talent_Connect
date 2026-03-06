"use client";

export default function SpinnerFallback({
  title = "Hunar Punjab",
}: {
  title?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 gap-6">
      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
        {title}
      </h1>

      {/* Spinner */}
      <span className="loading loading-spinner loading-lg text-secondary"></span>

      {/* Optional small text */}
      <p className="text-sm text-base-content/60">Loading, please wait...</p>
    </div>
  );
}
