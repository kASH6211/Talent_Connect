"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import { getDashboardRoute } from "@/lib/helper";

interface ComingSoonProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  minHeight?: string;
}

export default function ComingSoon({ 
  title = "Coming Soon", 
  description = "We're crafting something awesome. This feature will be available shortly.",
  showBackButton = false,
  minHeight = "min-h-[60vh]"
}: ComingSoonProps) {
  const router = useRouter();
  const { role } = useAuth();

  const topText = (title === "Coming Soon" || title === "Coming Soon!") 
    ? "NEW FEATURE" 
    : title;

  return (
    <div className={`flex flex-col items-center justify-center ${minHeight} px-4 py-10 text-center animate-in fade-in zoom-in-95 duration-700`}>
      
      <p className="text-base md:text-lg font-black tracking-[0.2em] text-slate-900 uppercase mb-2 md:mb-4">
        {topText}
      </p>
      
      <h2 className="text-[4rem] sm:text-[5.5rem] md:text-[7rem] lg:text-[8.5rem] font-black tracking-tighter text-primary leading-[0.80] uppercase mb-8 md:mb-12">
        COMING<br/>SOON
      </h2>

      {description && (
        <p className="text-slate-600 max-w-sm mx-auto mb-8 text-sm md:text-base font-medium leading-relaxed">
          {description}
        </p>
      )}

      {showBackButton ? (
        <button 
          onClick={() => router.back()}
          className="px-8 py-3.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-xl active:scale-95"
        >
          Go Back
        </button>
      ) : (
        <button 
          onClick={() => router.push(getDashboardRoute(role || ""))}
          className="px-8 py-3.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-xl active:scale-95"
        >
          Back to Dashboard
        </button>
      )}
    </div>
  );
}
