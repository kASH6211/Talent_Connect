"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { getAll, createOne, updateOne, deleteOne } from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import { Pencil, Trash2, Check, X, Plus, RefreshCw, AlertCircle, Save, Users } from "lucide-react";
import clsx from "clsx";
import { useOptions } from "@/hooks/useOptions";
import CrudTable from "@/components/CrudTable";

export default function StudentCountsPage() {
    const { user } = useAuth();
    const qc = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedInstituteId, setSelectedInstituteId] = useState<string>("");
    const [bulkData, setBulkData] = useState<any[]>([]);

    // State to hold data from CrudTable for summary stats
    const [fetchedData, setFetchedData] = useState<any>(null);

    // Fetch existing student counts for the selected institute (for modal population)
    const { data: existingCounts } = useQuery({
        queryKey: ["existing-counts", selectedInstituteId],
        queryFn: () => getAll(`student-count?limit=1000&institute_id=${selectedInstituteId}`),
        enabled: !!selectedInstituteId && modalOpen,
    });

    // Institutes for dropdown
    const { options: institutes } = useOptions(
        "institute",
        "institute_id",
        "institute_name"
    );

    // Sessions for dropdown
    const { options: sessions } = useOptions(
        "master-session",
        "sessionid",
        "session"
    );

    // Fetch mappings for the selected institute
    const { data: mappings, isFetching: isFetchingMappings } = useQuery({
        queryKey: ["mappings-for-institute", selectedInstituteId],
        queryFn: () => getAll(`institute-qualification-mapping?limit=1000&institute_id=${selectedInstituteId}`),
        enabled: !!selectedInstituteId && modalOpen,
    });

    // Initialize bulk data when mappings are fetched
    useEffect(() => {
        const mappingList = Array.isArray(mappings) ? mappings : mappings?.data;
        if (mappingList && Array.isArray(mappingList) && existingCounts) {
            const initialBulk = mappingList.map((m: any) => {
                // Find existing record if any in the fetched counts for this institute
                const existing = existingCounts.data?.find((r: any) => r.institute_qualification_id === m.institute_qualification_id);
                return {
                    institute_qualification_id: m.institute_qualification_id,
                    qualification: m.qualification?.qualification,
                    course: m.streamBranch?.stream_branch_name,
                    affiliation: m.streamBranch?.affiliation?.affiliating_body || "—",
                    nsqf: m.streamBranch?.nsqf?.nsqf_level || "—",
                    duration: m.streamBranch?.courseDuration?.courseduration || "—",
                    sessionid: existing?.sessionid || "",
                    studentcount: existing?.studentcount || "",
                    studentcountid: existing?.studentcountid || null,
                };
            });
            setBulkData(initialBulk);
        } else if (!selectedInstituteId || !modalOpen) {
            setBulkData([]);
        }
    }, [mappings, existingCounts, selectedInstituteId, modalOpen]);

    // Bulk Save Mutation
    const bulkSaveMutation = useMutation({
        mutationFn: (data: any[]) => api.post("student-count/bulk", data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["student-count"] });
            qc.invalidateQueries({ queryKey: ["existing-counts"] });
            setModalOpen(false);
            setSelectedInstituteId("");
            setBulkData([]);
        },
        onError: (err: any) => {
            alert("Error saving: " + (err?.response?.data?.message || err.message));
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteOne("student-count", id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["student-count"] }),
    });

    const handleBulkChange = (index: number, field: string, value: any) => {
        const newData = [...bulkData];
        newData[index][field] = value;
        setBulkData(newData);
    };

    const onSave = () => {
        const toSave = bulkData
            .filter(row => row.sessionid && row.studentcount) // Only save rows where both are filled
            .map(row => ({
                institute_qualification_id: row.institute_qualification_id,
                sessionid: parseInt(row.sessionid),
                studentcount: parseInt(row.studentcount),
                is_active: 'Y'
            }));

        if (toSave.length === 0) {
            alert("Please fill at least one row with Session and Count");
            return;
        }
        bulkSaveMutation.mutate(toSave);
    };

    // If user is institute, auto-select their institute
    useEffect(() => {
        if (user?.role === 'institute' && user?.institute_id) {
            setSelectedInstituteId(String(user.institute_id));
        }
    }, [user]);

    // Column Definitions
    const COLUMNS = useMemo(() => [
        { key: "sn", label: "#", render: (_: any, __: any, i: number) => i },
        { key: "studentcountid", label: "ID" },
        ...(user?.role !== "institute" ? [{
            key: "institute",
            label: "Institute",
            render: (_: any, row: any) => (
                <div className="max-w-[150px] truncate" title={row.instituteQualification?.institute?.institute_name}>
                    {row.instituteQualification?.institute?.institute_name || "—"}
                </div>
            )
        }] : []),
        {
            key: "qualification",
            label: "Qualification",
            render: (_: any, row: any) => row.instituteQualification?.qualification?.qualification || "—"
        },
        {
            key: "course",
            label: "Course",
            render: (_: any, row: any) => (
                <div className="max-w-[180px] truncate" title={row.instituteQualification?.streamBranch?.stream_branch_name}>
                    {row.instituteQualification?.streamBranch?.stream_branch_name || "—"}
                </div>
            )
        },
        {
            key: "affiliation",
            label: "Affiliation",
            render: (_: any, row: any) => row.instituteQualification?.streamBranch?.affiliation?.affiliating_body || "—"
        },
        {
            key: "nsqf",
            label: "NSQF",
            render: (_: any, row: any) => row.instituteQualification?.streamBranch?.nsqf?.nsqf_level || "—"
        },
        {
            key: "duration",
            label: "Duration",
            render: (_: any, row: any) => row.instituteQualification?.streamBranch?.courseDuration?.courseduration || "—"
        },
        {
            key: "session",
            label: "Sess.",
            render: (val: any) => <span className="text-[10px] font-medium opacity-70 px-1.5 border border-base-200 rounded">{val?.session || "—"}</span>
        },
        {
            key: "studentcount",
            label: "Qty",
            render: (val: any) => <span className="text-sm font-bold text-primary">{val}</span>
        },
        {
            key: "is_active",
            label: "St.",
            render: (val: any) => (
                <div className={clsx(
                    "w-2 h-2 rounded-full mx-auto",
                    val === 'Y' ? "bg-success" : "bg-error"
                )} />
            )
        },
    ], [user]);

    // Handle single record edit (though bulk is preferred, we need actions)
    const [editRow, setEditRow] = useState<any>(null);

    return (
        <div className="p-4 space-y-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                    <h1 className="text-2xl font-bold">Student Count Management</h1>
                    <p className="text-sm text-base-content/60">Manage enrollment numbers for mapped courses</p>
                </div>

                {/* Total Stats Card */}
                <div className="stats shadow-sm border border-primary/20 bg-primary/5 min-w-[180px]">
                    <div className="stat py-1.5 px-3">
                        <div className="stat-figure text-primary">
                            <Users size={24} />
                        </div>
                        <div className="stat-title text-[10px] font-bold uppercase tracking-wider">Total Students</div>
                        <div className="stat-value text-primary text-xl">
                            {fetchedData?.totalStudents?.toLocaleString() || 0}
                        </div>
                        <div className="stat-desc text-[9px] opacity-70">Across all filtered records</div>
                    </div>
                </div>
            </div>

            {/* Qualification Breakdown Tiles */}
            {fetchedData?.qualificationStats?.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                    {fetchedData.qualificationStats.map((stat: any, idx: number) => (
                        <div key={idx} className="bg-base-100 border border-base-200 rounded-xl p-2 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-base-content/50 truncate" title={stat.name}>
                                {stat.name}
                            </div>
                            <div className="mt-0.5 flex items-baseline gap-1">
                                <span className="text-lg font-black text-base-content">{stat.total.toLocaleString()}</span>
                                <span className="text-[9px] font-medium opacity-40 uppercase">Students</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <CrudTable
                title="Student Counts"
                apiPath="student-count"
                queryKey="student-count"
                columns={COLUMNS}
                primaryKey="studentcountid"
                onAdd={() => {
                    setSelectedInstituteId(user?.role === 'institute' ? String(user.institute_id) : "");
                    setModalOpen(true);
                }}
                onEdit={(r) => {
                    // Pre-select institute to show the right mappings
                    const instId = r.instituteQualification?.instituteId || (user?.role === 'institute' ? user?.institute_id : "");
                    setSelectedInstituteId(String(instId));
                    setModalOpen(true);
                }}
                onDataFetched={setFetchedData}
            />

            {/* BULK MANAGE MODAL */}
            {modalOpen && (
                <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-6xl max-h-[90vh] bg-base-100 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                        <div className="p-6 border-b border-base-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold">Manage Student Counts</h2>
                            <button onClick={() => setModalOpen(false)} className="btn btn-ghost btn-sm btn-circle">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 flex-1 overflow-auto space-y-6">
                            {/* Institute Selection */}
                            {user?.role !== 'institute' && (
                                <div className="form-control w-full max-w-md">
                                    <label className="label font-bold">Select Institute</label>
                                    <select
                                        className="select select-bordered"
                                        value={selectedInstituteId}
                                        onChange={(e) => setSelectedInstituteId(e.target.value)}
                                    >
                                        <option value="">Select Institute…</option>
                                        {institutes.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                                    </select>
                                </div>
                            )}

                            {/* Course Mapping List with Inputs */}
                            {!selectedInstituteId ? (
                                <div className="py-20 text-center text-base-content/40 flex flex-col items-center gap-2">
                                    <AlertCircle size={40} />
                                    <p>Please select an institute to view mapped courses</p>
                                </div>
                            ) : isFetchingMappings ? (
                                <div className="py-20 text-center"><span className="loading loading-spinner loading-lg" /></div>
                            ) : mappings?.length === 0 ? (
                                <div className="py-20 text-center text-base-content/40">No mappings found for this institute.</div>
                            ) : (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg">Mapped Courses ({bulkData.length})</h3>
                                    <div className="bg-base-200/30 border border-base-200 rounded-xl overflow-hidden">
                                        <table className="table table-compact w-full text-xs">
                                            <thead>
                                                <tr>
                                                    <th>Course / Qualification</th>
                                                    <th>Affiliation</th>
                                                    <th className="text-center">NSQF</th>
                                                    <th>Duration</th>
                                                    <th className="w-48">Session</th>
                                                    <th className="w-32 text-center">Student Count</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bulkData.map((row, idx) => (
                                                    <tr key={idx}>
                                                        <td>
                                                            <div className="font-bold">{row.qualification}</div>
                                                            <div className="text-xs text-base-content/60">{row.course}</div>
                                                        </td>
                                                        <td className="max-w-[120px] truncate" title={row.affiliation}>{row.affiliation}</td>
                                                        <td className="text-center">{row.nsqf}</td>
                                                        <td>{row.duration}</td>
                                                        <td>
                                                            <select
                                                                className="select select-bordered select-sm w-full"
                                                                value={row.sessionid}
                                                                onChange={(e) => handleBulkChange(idx, "sessionid", e.target.value)}
                                                            >
                                                                <option value="">Select Session…</option>
                                                                {sessions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                                            </select>
                                                        </td>
                                                        <td className="text-center">
                                                            <input
                                                                type="number"
                                                                className="input input-bordered input-sm w-full text-center font-bold text-primary"
                                                                value={row.studentcount}
                                                                onChange={(e) => handleBulkChange(idx, "studentcount", e.target.value)}
                                                                placeholder="Count"
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-base-200 flex justify-end gap-3">
                            <button onClick={() => setModalOpen(false)} className="btn btn-ghost px-8">Cancel</button>
                            <button
                                onClick={onSave}
                                disabled={bulkSaveMutation.isPending || !selectedInstituteId || bulkData.length === 0}
                                className="btn btn-primary px-10 gap-2 shadow-lg"
                            >
                                {bulkSaveMutation.isPending ? <span className="loading loading-spinner" /> : <Save size={18} />}
                                Save All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
