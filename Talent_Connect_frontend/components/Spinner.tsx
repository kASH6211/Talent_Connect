"use client";

export default function SpinnerFallback({
  title = "HUNAR PUNJAB",
}: {
  title?: string;
}) {
  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.9);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.6);
            opacity: 0;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }

        @keyframes spin-smooth {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .pulse-ring {
          animation: pulse-ring 3.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .spin-smooth {
          animation: spin-smooth 1.4s cubic-bezier(0.65, 0.05, 0.36, 1) infinite;
        }

        .gradient-spinner {
          background: conic-gradient(
            from 0deg at 50% 50%,
            transparent 10%,
            hsl(var(--p)) 40%,
            hsl(var(--p) / 0.8) 60%,
            transparent 90%
          );
          mask: radial-gradient(farthest-side, #0000 calc(100% - 6px), #000 0);
          -webkit-mask: radial-gradient(
            farthest-side,
            #0000 calc(100% - 6px),
            #000 0
          );
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-base-100/60 backdrop-blur-sm gap-10 px-4">
        {/* Brand / Title with subtle glow */}
        <div className="relative">
          <h1
            className="text-3xl md:text-4xl font-semibold tracking-tight text-base-content/90"
            style={{
              textShadow: "0 0 20px hsl(var(--p) / 0.25)",
            }}
          >
            {title}
          </h1>
          <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-primary/10 to-transparent blur-xl opacity-60 animate-pulse-slow" />
        </div>

        {/* Premium spinner container */}
        <div className="relative flex items-center justify-center w-24 h-24">
          {/* Outer pulsing ring */}
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 pulse-ring" />

          {/* Inner spinning gradient ring */}
          <div className="absolute inset-2 rounded-full gradient-spinner spin-smooth opacity-90" />

          {/* Center dot with subtle glow */}
          <div className="w-5 h-5 rounded-full bg-primary shadow-[0_0_20px_8px] shadow-primary/40 animate-pulse" />
        </div>

        {/* Elegant loading message */}
        <div className="text-center space-y-2">
          <p className="text-base font-medium text-base-content/80 tracking-wide">
            Preparing your experience
          </p>
          <p className="text-xs text-base-content/50">Just a moment...</p>
        </div>

        {/* Very subtle progress hint */}
        <div className="w-64 h-1 bg-base-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 rounded-full animate-[progress_3s_ease-in-out_infinite]"
            style={{
              width: "30%",
              animation: "progress 3s ease-in-out infinite",
            }}
          />
        </div>

        {/* Additional keyframe for progress bar */}
        <style jsx>{`
          @keyframes progress {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(300%);
            }
            100% {
              transform: translateX(300%);
            }
          }
        `}</style>
      </div>
    </>
  );
}
