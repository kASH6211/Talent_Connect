"use client";
import { useRouter } from 'next/navigation'
import React from 'react'

export const Hero = () => {
    const router = useRouter();
    return (
        <div className="hero bg-base-200 min-h-screen">
            <div className="hero-content flex-col lg:flex-row">
                <img
                    src="/fabio-oyXis2kALVg-unsplash.jpg"
                    className="max-w-sm rounded-lg shadow-2xl"
                />
                <div>
                    <h1 className="text-5xl font-bold">
                        <span className="text-rotate text-7xl">
                            <span className="justify-items-center">
                                <span>Talent</span>
                                <span>Connect</span>

                            </span>
                        </span>
                    </h1>
                    <p className="py-6">
                        Provident cupiditate voluptatem et in. Quaerat fugiat ut assumenda excepturi exercitationem
                        quasi. In deleniti eaque aut repudiandae et a id nisi.
                    </p>
                    <button
  className="btn btn-primary transition-all duration-300 hover:scale-105 hover:shadow-lg"
  onClick={() => router.push('/login')}
>
  Get Started
</button>

                </div>
            </div>
        </div>
    )
}
