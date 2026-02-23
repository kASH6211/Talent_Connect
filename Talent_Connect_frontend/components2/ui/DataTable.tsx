"use client";

import React from "react";

export type Column<T> = {
    header: string;
    accessor: keyof T;
    render?: (value: any, row: T) => React.ReactNode;
};

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyField: keyof T;
    actions?: (row: T) => React.ReactNode;
}

export default function DataTable<T>({
    columns,
    data,
    keyField,
    actions,
}: DataTableProps<T>) {
    return (
        <div className="overflow-x-auto bg-base-200 rounded-xl shadow">
            <table className="table">
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index}>{col.header}</th>
                        ))}
                        {actions && <th>Actions</th>}
                    </tr>
                </thead>

                <tbody>
                    {data.map((row) => (
                        <tr key={String(row[keyField])} className="hover">
                            {columns.map((col, index) => (
                                <td key={index}>
                                    {col.render
                                        ? col.render(row[col.accessor], row)
                                        : String(row[col.accessor])}
                                </td>
                            ))}
                            {actions && <td className="flex gap-2">{actions(row)}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}



//implement table with dynamic columns and data using a reusable DataTable component============================================================================

// "use client";

// import { useState } from "react";
// import { Eye, Pencil, Trash2, Plus } from "lucide-react";
// import DataTable, { Column } from "@/components/ui/DataTable";

// interface Institute {
//   id: number;
//   name: string;
//   type: string;
//   district: string;
//   status: "Active" | "Pending" | "Blocked";
// }

// const institutesData: Institute[] = [
//   { id: 1, name: "ABC Engineering College", type: "Private", district: "Ludhiana", status: "Active" },
//   { id: 2, name: "Govt Polytechnic", type: "Government", district: "Amritsar", status: "Pending" },
//   { id: 3, name: "XYZ University", type: "Private", district: "Jalandhar", status: "Blocked" },
//   { id: 4, name: "Punjab Technical Institute", type: "Government", district: "Patiala", status: "Active" },
// ];

// export default function InstituteListView() {
//   const [search, setSearch] = useState("");

//   const filtered = institutesData.filter((inst) =>
//     inst.name.toLowerCase().includes(search.toLowerCase())
//   );

//   const columns: Column<Institute>[] = [
//     { header: "#", accessor: "id" },
//     { header: "Name", accessor: "name" },
//     { header: "Type", accessor: "type" },
//     { header: "District", accessor: "district" },
//     {
//       header: "Status",
//       accessor: "status",
//       render: (value) => (
//         <div
//           className={`badge ${
//             value === "Active"
//               ? "badge-success"
//               : value === "Pending"
//               ? "badge-warning"
//               : "badge-error"
//           }`}
//         >
//           {value}
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="p-6 space-y-6">

//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">Institutes</h1>
//         <button className="btn btn-primary gap-2">
//           <Plus size={18} /> Add Institute
//         </button>
//       </div>

//       {/* Search */}
//       <input
//         type="text"
//         placeholder="Search institute..."
//         className="input input-bordered w-full md:w-1/3"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//       />

//       {/* Dynamic Table */}
//       <DataTable
//         columns={columns}
//         data={filtered}
//         keyField="id"
//         actions={(row) => (
//           <>
//             <button className="btn btn-sm btn-info btn-outline">
//               <Eye size={16} />
//             </button>

//             <button className="btn btn-sm btn-warning btn-outline">
//               <Pencil size={16} />
//             </button>

//             <button className="btn btn-sm btn-error btn-outline">
//               <Trash2 size={16} />
//             </button>
//           </>
//         )}
//       />
//     </div>
//   );
// }
