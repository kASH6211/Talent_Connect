"use client";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export const JobApplyHeroSection = ({ jobType }: { jobType: string }) => {
    const router = useRouter();

    return (
        <div className="relative py-20 px-6 overflow-hidden bg-gradient-to-r from-primary via-secondary to-primary text-primary-content">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-base-100/20 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-base-100/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute top-40 left-1/2 w-80 h-80 bg-base-100/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative max-w-4xl mx-auto text-center z-10">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="absolute left-6 top-1/2 -translate-y-1/2 btn btn-ghost btn-circle btn-sm border border-primary-content/40 hover:bg-base-100/20 transition-all duration-300 group"
                    aria-label="Go back"
                >
                    <ArrowLeftIcon className="w-5 h-5 stroke-[3px] group-hover:-translate-x-1 transition-transform duration-300" />
                </button>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-base-100/20 backdrop-blur-md rounded-full border border-primary-content/20 mb-8">
                    <div className="w-2.5 h-2.5 bg-primary rounded-full animate-ping"></div>
                    <span className="font-semibold tracking-wide opacity-90">
                        Application Form
                    </span>
                </div>

                {/* Heading */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                    Apply for{" "}
                    <span className="bg-gradient-to-r from-accent via-secondary to-primary bg-clip-text text-transparent drop-shadow-xl">
                        {jobType}
                    </span>
                </h1>

                {/* Subheading */}
                <p className="text-xl md:text-2xl font-light opacity-90 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Fill out the form below — it only takes{" "}
                    <span className="font-bold text-accent">
                        a few minutes
                    </span>{" "}
                    to showcase your talent.
                </p>

                {/* Stats */}
                <div className="flex flex-wrap justify-center gap-8 mb-12">
                    <div className="min-w-[80px] p-4 bg-base-100/20 backdrop-blur-sm rounded-2xl border border-primary-content/20">
                        <div className="text-3xl font-black text-primary mb-1">
                            5
                        </div>
                        <div className="text-xs font-medium opacity-80 uppercase tracking-wider">
                            Min to Complete
                        </div>
                    </div>

                    <div className="min-w-[80px] p-4 bg-base-100/20 backdrop-blur-sm rounded-2xl border border-primary-content/20">
                        <div className="text-3xl font-black text-secondary mb-1">
                            100%
                        </div>
                        <div className="text-xs font-medium opacity-80 uppercase tracking-wider">
                            Secure
                        </div>
                    </div>

                    <div className="min-w-[80px] p-4 bg-base-100/20 backdrop-blur-sm rounded-2xl border border-primary-content/20">
                        <div className="text-3xl font-black text-accent mb-1">
                            ✓
                        </div>
                        <div className="text-xs font-medium opacity-80 uppercase tracking-wider">
                            No Fees
                        </div>
                    </div>
                </div>

                {/* Floating Shapes */}
                <div className="absolute -top-12 -right-12 w-24 h-24 bg-accent/30 rounded-2xl -rotate-12 blur-sm animate-float"></div>
                <div className="absolute -bottom-12 -left-12 w-20 h-20 bg-secondary/30 rounded-full rotate-12 blur-sm animate-float animation-delay-3000"></div>
            </div>
        </div>
    );
};
