// "use client";
// import React, { useState } from "react";
// import { AnimatePresence, motion } from "framer-motion";
// import { ChevronDown, ChevronUp } from "lucide-react";

// const tabs = [
//   {
//     title: "How can we hire skilled students efficiently?",
//     description:
//       "Our platform connects employers with thousands of pre-qualified, skilled students from top institutes in Punjab, making the hiring process faster and more efficient.",
//     imageUrl:
//       "https://res.cloudinary.com/dzl9yxixg/image/upload/v1714806148/design_elbeas.png",
//   },
//   {
//     title: "How do we collaborate with educational institutes?",
//     description:
//       "Employers and industry partners can collaborate with institutes for training programs, internships, and workshops, ensuring students gain practical skills and industry experience.",
//     imageUrl:
//       "https://res.cloudinary.com/dzl9yxixg/image/upload/v1714806148/share_xxzjjp.png",
//   },
//   {
//     title: "How do we track student enrollment and performance?",
//     description:
//       "Our dashboard provides real-time insights into student enrollment, courses, and skills development, helping employers and institutes make data-driven decisions.",
//     imageUrl:
//       "https://res.cloudinary.com/dzl9yxixg/image/upload/v1714806148/collboration_frpdk8.png",
//   },
// ];

// const FAQs: React.FC = () => {
//   const [activeIndex, setActiveIndex] = useState<number | null>(null);

//   const handleClick = (index: number) => {
//     setActiveIndex(activeIndex === index ? null : index);
//   };

//   return (
//     <div className="min-h-screen py-20 lg:py-32 bg-gradient-to-br from-base-100/50 via-base-200/30 to-base-300/20">
//       <div className="max-w-4xl mx-auto px-6 lg:px-12">
//         {/* Header */}
//         <div className="text-center mb-20">
//           <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-base-content via-primary to-secondary bg-clip-text text-transparent mb-6 leading-tight">
//             Frequently Asked Questions
//           </h1>
//           <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
//             Find answers to common questions about our platform and services
//           </p>
//         </div>

//         {/* FAQ Cards */}
//         <div className="space-y-4">
//           {tabs.map((tab, index) => (
//             <motion.div
//               key={index}
//               className="group bg-base-100/90 backdrop-blur-md rounded-2xl border border-base-200/60 hover:border-primary/40 hover:shadow-md transition-all duration-300 overflow-hidden shadow-sm"
//               whileHover={{ y: -2 }}
//             >
//               {/* Question Button */}
//               <button
//                 onClick={() => handleClick(index)}
//                 className="w-full flex items-center justify-between p-8 lg:p-10 hover:bg-base-200/50 transition-colors"
//               >
//                 <div className="space-y-2">
//                   <h3 className="text-xl lg:text-2xl font-bold text-base-content group-hover:text-primary transition-colors">
//                     {tab.title}
//                   </h3>
//                 </div>
//                 <motion.div
//                   animate={{ rotate: activeIndex === index ? 180 : 0 }}
//                   transition={{ duration: 0.3 }}
//                   className="flex-shrink-0 w-6 h-6 text-base-content/70 group-hover:text-primary transition-colors"
//                 >
//                   <ChevronDown className="w-6 h-6" />
//                 </motion.div>
//               </button>

//               {/* Answer Content */}
//               <AnimatePresence>
//                 {activeIndex === index && (
//                   <motion.div
//                     initial={{ height: 0, opacity: 0 }}
//                     animate={{ height: "auto", opacity: 1 }}
//                     exit={{ height: 0, opacity: 0 }}
//                     transition={{ duration: 0.4, ease: "easeInOut" }}
//                     className="overflow-hidden"
//                   >
//                     <div className="px-8 lg:px-10 pb-8 pt-2">
//                       <p className="text-base-content/80 leading-relaxed text-lg max-w-3xl">
//                         {tab.description}
//                       </p>
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FAQs;
