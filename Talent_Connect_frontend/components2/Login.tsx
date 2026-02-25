// "use client";
// import { useRouter } from "next/navigation";
// import React from "react";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";

// // Validation schema
// const schema = yup.object({
//   role: yup.string().oneOf(["student", "institute", "college", "admin"]).required("Please select a role"),
//   email: yup
//     .string()
//     .email("Please enter a valid email")
//     .required("Email is required"),
//   password: yup
//     .string()
//     .min(6, "Password must be at least 6 characters")
//     .required("Password is required"),
// });

// type FormData = yup.InferType<typeof schema>;

// const Login = () => {
//   const router = useRouter();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting, isValid },
//     reset,
//     watch,
//   } = useForm<FormData>({
//     resolver: yupResolver(schema),
//     defaultValues: {
//       role: "student",
//       email: "",
//       password: "",
//     },
//     mode: "onChange",
//   });

//   const role = watch("role");

//   const onSubmit = async (data: FormData) => {
//     try {
//       // Simulate API call
//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       // Here you would typically call your login API
//       console.log("Login data:", data);

//       // Redirect based on role
//       switch (data.role) {
//         case "student":
//           router.push("/student/dashboard");
//           break;
//         case "institute":
//           router.push("/institute/dashboard");
//           break;
//         case "college":
//           router.push("/college/dashboard");
//           break;
//         case "admin":
//           router.push("/admin/dashboard");
//           break;
//         default:
//           router.push("/dashboard");
//       }
//     } catch (error) {
//       console.error("Login failed:", error);
//     }
//   };

//   return (
//     <div className="hero bg-base-200 min-h-screen">
//       <div className="hero-content flex-col lg:flex-row-reverse space-y-10 lg:space-y-0">
//         {/* LEFT INFO */}
//         <div className="text-center lg:text-left lg:w-1/2 space-y-6">
//           <h1 className="text-5xl font-bold text-primary">
//             Talent Connect Login
//           </h1>
//           <p className="text-lg text-base-content opacity-70">
//             Access top institutes, skilled students, and employers. Join Punjab’s workforce ecosystem and streamline your hiring process.
//           </p>

//           <button
//             className="btn btn-primary px-6 py-3"
//             onClick={() => router.push("/")}
//           >
//             Home
//           </button>
//         </div>

//         {/* Right side: Login Card */}
//         <div className="card bg-base-100 w-full max-w-sm shrink-0 shadow-lg rounded-xl">
//           <div className="card-body">
//             <form onSubmit={handleSubmit(onSubmit)} noValidate>
//               <fieldset className="space-y-4" disabled={isSubmitting}>

//                 <label className="label font-medium text-base-content opacity-80">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   className="input input-bordered w-full bg-base-100 text-base-content border-base-300"
//                   placeholder="Email"
//                 />

//                 <label className="label font-medium text-base-content opacity-80">
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   className="input input-bordered w-full bg-base-100 text-base-content border-base-300"
//                   placeholder="Password"
//                 />

//                 <div>
//                   <a className="text-primary font-semibold text-sm hover:underline">
//                     Forgot password?
//                   </a>
//                 </div>

//                 {/* Login button */}
//                 <button
//                   className="btn btn-primary w-full mt-4"
//                 >
//                   Login
//                 </button>

//                 <p className="text-center mt-4 text-sm text-base-content opacity-70">
//                   Don’t have an account?{" "}
//                   <a href="/signup" className="text-primary font-semibold hover:underline">
//                     Sign up
//                   </a>
//                 </p>
//               </fieldset>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;
