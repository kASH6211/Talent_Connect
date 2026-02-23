"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// Comprehensive validation schema
const schema = yup.object({
  role: yup
    .string()
    .oneOf(["student", "institute", "college", "admin"])
    .required("Please select a role"),
  name: yup
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters")
    .required("Full name is required"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and number"
    )
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

type FormData = yup.InferType<typeof schema>;

const Signup = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      role: "student",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const password = watch("password");

  const onSubmit = async (data: FormData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log("Signup data:", data);

      // Redirect based on role
      switch (data.role) {
        case "student":
          router.push("/student/onboarding");
          break;
        case "institute":
          router.push("/institute/onboarding");
          break;
        case "college":
          router.push("/college/onboarding");
          break;
        case "admin":
          router.push("/admin/dashboard");
          break;
        default:
          router.push("/dashboard");
      }

      reset();
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse space-y-10 lg:space-y-0">
        {/* LEFT SIDE */}
        <div className="text-center lg:text-left lg:w-1/2 space-y-6">
          <h1 className="text-5xl font-bold text-primary">Sign Up</h1>
          <p className="text-lg text-base-content opacity-70">
            Create a new account to get started and enjoy all available features.
          </p>

          <button
            className="btn btn-primary px-6 py-3"
            onClick={() => router.push("/")}
          >
            Home
          </button>
        </div>

        {/* Right side: Signup Card */}
        <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-lg rounded-xl">
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <fieldset className="space-y-4" disabled={isSubmitting}>

                <label className="label font-medium text-base-content opacity-80">Email</label>
                <input
                  type="email"
                  className="input input-bordered w-full bg-base-100 text-base-content border-base-300"
                  placeholder="Email"
                />

                <label className="label font-medium text-base-content opacity-80">Password</label>
                <input
                  type="password"
                  className="input input-bordered w-full bg-base-100 text-base-content border-base-300"
                  placeholder="Password"
                />

                <label className="label font-medium text-base-content opacity-80">Confirm Password</label>
                <input
                  type="password"
                  className="input input-bordered w-full bg-base-100 text-base-content border-base-300"
                  placeholder="Confirm Password"
                />

                {/* Sign Up button */}
                <button
                  className="btn btn-primary w-full mt-4"
                >
                  Sign Up
                </button>

                <p className="text-center mt-4 text-sm text-base-content opacity-70">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="text-primary font-semibold hover:underline"
                  >
                    Login
                  </a>
                </p>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
