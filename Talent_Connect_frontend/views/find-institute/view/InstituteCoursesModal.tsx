import { useEffect, useState } from "react";
import { X, GraduationCap, Users } from "lucide-react";
import api from "@/lib/api";

interface CourseRow {
    course: string;
    student_count: number;
    final_year_student_count: number;
}

const DUMMY_COURSES: CourseRow[] = [
    { course: "ITI (Electrician)", student_count: 0, final_year_student_count: 0 },
    { course: "ITI (Fitter)", student_count: 0, final_year_student_count: 0 },
    { course: "ITI (Welder)", student_count: 0, final_year_student_count: 0 },
    { course: "ITI (Machinist)", student_count: 0, final_year_student_count: 0 },
    { course: "ITI (Computer Operator and Programming Assistant)", student_count: 0, final_year_student_count: 0 },
];

interface Props {
    open: boolean;
    setOpen: (b: boolean) => void;
    instituteId: number | null;
    instituteName: string;
    filters: {
        qualification_ids: number[];
        stream_ids: number[];
    };
}

export default function InstituteCoursesModal({
    open,
    setOpen,
    instituteId,
    instituteName,
    filters,
}: Props) {
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<CourseRow[]>([]);

    useEffect(() => {
        if (!open || !instituteId) return;

        const fetchCourses = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (filters.qualification_ids.length) params.append('qualification_ids', filters.qualification_ids.join(','));
                if (filters.stream_ids.length) params.append('stream_ids', filters.stream_ids.join(','));

                const res = await api.get(`/institute/${instituteId}/filtered-courses?${params.toString()}`);
                setCourses(res.data || []);
            } catch (err) {
                console.error("Failed to fetch filtered courses:", err);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [open, instituteId, filters]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className="bg-base-100 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-base-200 dark:border-base-800 bg-base-100/50">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <GraduationCap className="text-primary" size={24} />
                            Filtered Courses
                        </h2>
                        <p className="text-sm text-base-content/60 mt-1">{instituteName}</p>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="p-2 -mr-2 rounded-full hover:bg-base-200 transition-colors"
                    >
                        <X size={20} className="text-base-content/60" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-base-200/30">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-base-content/50">
                            <span className="loading loading-spinner loading-md" />
                            <p>Loading matching courses...</p>
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="text-center py-16 text-base-content/50 space-y-3">
                            <GraduationCap size={48} className="mx-auto opacity-20" />
                            <p className="font-medium text-lg">No matching courses found</p>
                            <p className="text-sm">This institute has no active students matching your active filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-base-300 dark:border-base-700 bg-base-100 dark:bg-base-900 shadow-sm">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-base-200/60 dark:bg-base-800/60">
                                    <tr>
                                        <th className="px-4 py-3 font-bold text-base-content/60 uppercase tracking-wider text-xs">Course</th>
                                        <th className="px-4 py-3 font-bold text-base-content/60 uppercase tracking-wider text-xs">Total Students on Roll</th>
                                        <th className="px-4 py-3 font-bold text-base-content/60 uppercase tracking-wider text-xs">Final Year Student ready for placement</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-base-200 dark:divide-base-800">
                                    {courses.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-base-200/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-base-content/80">
                                                {row.course}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10 text-primary text-xs font-bold">
                                                    <Users size={12} />
                                                    {row.student_count.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-secondary/10 text-secondary text-xs font-bold">
                                                    <Users size={12} />
                                                    {row.final_year_student_count.toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
