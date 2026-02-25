// "use client";

// import { useForm, Controller } from "react-hook-form";
// import InfiniteSelect from "@/components/ui/InfiniteSelect";
// import FileUploader from "@/components/ui/FileUploader";
// import { FormField } from "@/helper/form";

// interface DynamicFormProps {
//     fields: FormField[];
//     onSubmit: (data: any) => void;
// }

// export default function DynamicForm({
//     fields,
//     onSubmit,
// }: DynamicFormProps) {
//     const { register, handleSubmit, control } = useForm();

//     return (
//         <form
//             onSubmit={handleSubmit(onSubmit)}
//             className="space-y-4"
//         >
//             {fields.map((field) => {
//                 switch (field.type) {
//                     case "text":
//                     case "email":
//                     case "number":
//                         return (
//                             <input
//                                 key={field.name}
//                                 type={field.type}
//                                 placeholder={field.placeholder}
//                                 {...register(field.name, {
//                                     required: field.required,
//                                 })}
//                                 className="input input-bordered w-full"
//                             />
//                         );

//                     case "textarea":
//                         return (
//                             <textarea
//                                 key={field.name}
//                                 placeholder={field.placeholder}
//                                 {...register(field.name, {
//                                     required: field.required,
//                                 })}
//                                 className="textarea textarea-bordered w-full"
//                             />
//                         );

//                     case "select":
//                         return (
//                             <select
//                                 key={field.name}
//                                 {...register(field.name, {
//                                     required: field.required,
//                                 })}
//                                 className="select select-bordered w-full"
//                             >
//                                 <option value="">Select {field.label}</option>
//                                 {field.options?.map((opt:any) => (
//                                     <option
//                                         key={opt.value}
//                                         value={opt.value}
//                                     >
//                                         {opt.label}
//                                     </option>
//                                 ))}
//                             </select>
//                         );

//                     case "file":
//                         return (
//                             <Controller
//                                 key={field.name}
//                                 name={field.name}
//                                 control={control}
//                                 render={({ field: ctrl }) => (
//                                     <FileUploader
//                                         files={ctrl.value || []}
//                                         setFiles={ctrl.onChange}
//                                         multiple
//                                     />
//                                 )}
//                             />
//                         );

//                     default:
//                         return null;
//                 }
//             })}

//             <button className="btn btn-primary w-full">
//                 Apply Now
//             </button>
//         </form>
//     );
// }
