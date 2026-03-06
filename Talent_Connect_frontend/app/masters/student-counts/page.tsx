"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api, { getAll, createOne, updateOne, deleteOne } from "@/lib/api";
import { useAuth } from "@/lib/AuthProvider";
import { Pencil, Trash2, Check, X, Plus, RefreshCw, AlertCircle, Save } from "lucide-react";
import clsx from "clsx";
import { useOptions } from "@/hooks/useOptions";

export default function StudentCountsPage() {
    const { user } = useAuth();
    const qc = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedInstituteId, setSelectedInstituteId] = useState<string>("");
    const [bulkData, setBulkData] = useState<any[]>([]);

    // Fetch all student counts for the main list
    const { data: records, isLoading, isError, refetch } = useQuery({
        queryKey: ["student-count"],
        queryFn: () => getAll("student-count"),
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
        queryFn: () => getAll(`institute-qualification-mapping?institute_id=${selectedInstituteId}`),
        enabled: !!selectedInstituteId,
    });

    // Initialize bulk data when mappings are fetched
    useEffect(() => {
        if (mappings && Array.isArray(mappings)) {
            // For each mapping, check if we already have a record in 'records' for it
            // Actually, it might be better to just let the user fill them.
            // But if we want to "Edit", we should populate existing counts.
            const initialBulk = mappings.map((m: any) => {
                // Find existing record if any (this is a bit slow on client side, but okay for small sets)
                const existing = records?.find((r: any) => r.institute_qualification_id === m.institute_qualification_id);
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
        } else {
            setBulkData([]);
        }
    }, [mappings, records]);

    // Bulk Save Mutation
    const bulkSaveMutation = useMutation({
        mutationFn: (data: any[]) => api.post("student-count/bulk", data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["student-count"] });
            setModalOpen(false);
            setSelectedInstituteId("");
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

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Student Count Management</h1>
                    <p className="text-sm text-base-content/60">{records?.length || 0} records total</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => refetch()} className="btn btn-ghost btn-sm btn-circle">
                        <RefreshCw size={16} />
                    </button>
                    <button
                        onClick={() => setModalOpen(true)}
                        className="btn btn-primary btn-sm gap-2"
                    >
                        <Plus size={16} /> Manage Student Counts
                    </button>
                </div>
            </div>

            <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full text-xs">
                        <thead>
                            <tr className="bg-base-200/60">
                                <th>ID</th>
                                {user?.role !== "institute" && <th>Institute</th>}
                                <th>Qualification</th>
                                <th>Course</th>
                                <th>Affiliation</th>
                                <th>NSQF</th>
                                <th>Duration</th>
                                <th className="text-center">Session</th>
                                <th className="text-center">Student Count</th>
                                <th>Status</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records?.length === 0 && (
                                <tr>
                                    <td colSpan={11} className="text-center py-12 text-base-content/40">No student counts recorded yet.</td>
                                </tr>
                            )}
                            {records?.map((row: any) => (
                                <tr key={row.studentcountid} className="group">
                                    <td>{row.studentcountid}</td>
                                    {user?.role !== "institute" && (
                                        <td className="max-w-[150px] truncate" title={row.instituteQualification?.institute?.institute_name}>
                                            {row.instituteQualification?.institute?.institute_name || "—"}
                                        </td>
                                    )}
                                    <td>{row.instituteQualification?.qualification?.qualification || "—"}</td>
                                    <td className="max-w-[150px] truncate" title={row.instituteQualification?.streamBranch?.stream_branch_name}>
                                        {row.instituteQualification?.streamBranch?.stream_branch_name || "—"}
                                    </td>
                                    <td>{row.instituteQualification?.streamBranch?.affiliation?.affiliating_body || "—"}</td>
                                    <td className="text-center">{row.instituteQualification?.streamBranch?.nsqf?.nsqf_level || "—"}</td>
                                    <td>{row.instituteQualification?.streamBranch?.courseDuration?.courseduration || "—"}</td>
                                    <td className="text-center">
                                        <span className="badge badge-outline border-base-300">{row.session?.session || "—"}</span>
                                    </td>
                                    <td className="text-center">
                                        <span className="text-sm font-bold text-primary">{row.studentcount}</span>
                                    </td>
                                    <td>
                                        <span className={clsx("badge badge-xs", row.is_active === 'Y' ? "badge-success" : "badge-error")}>
                                            {row.is_active === 'Y' ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => confirm("Remove this student count?") && deleteMutation.mutate(row.studentcountid)}
                                                className="btn btn-ghost btn-xs btn-circle text-error"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

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
