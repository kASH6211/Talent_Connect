"use client";

export default function DotsLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/20 backdrop-blur-md">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.16s]"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.08s]"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
      </div>
      <h1 className="mt-6 text-xl md:text-2xl font-semibold tracking-wide text-base-content">
        Talent Connect
      </h1>
      <p className="text-sm text-base-content/60">
        Connecting talent with opportunity...
      </p>
    </div>
  );
}
