'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
    { key: 'student_placement_id', label: 'ID' },
    { key: 'studentId', label: 'Student ID' },
    { key: 'industryId', label: 'Industry ID' },
    { key: 'jobrole_id', label: 'Job Role ID' },
    { key: 'placement_status', label: 'Status' },
    { key: 'ctcoffered', label: 'CTC Offered' },
    { key: 'is_active', label: 'Active' },
];

const FIELDS = [
    {
        key: 'studentId', label: 'Student', required: true,
        optionsApi: 'student', optionsValueKey: 'studentId', optionsLabelKey: 'studentfirstname',
    },
    {
        key: 'industryId', label: 'Company (Industry)', required: true,
        optionsApi: 'industry', optionsValueKey: 'industryId', optionsLabelKey: 'industryname',
    },
    {
        key: 'jobrole_id', label: 'Job Role',
        optionsApi: 'job-role', optionsValueKey: 'jobrole_id', optionsLabelKey: 'jobrole',
    },
    { key: 'placement_date', label: 'Placement Date', type: 'date' },
    { key: 'ctcoffered', label: 'CTC Offered (LPA)', type: 'number' },
    {
        key: 'placement_status', label: 'Placement Status', type: 'select',
        options: [
            { value: 'Offered', label: 'Offered' },
            { value: 'Accepted', label: 'Accepted' },
            { value: 'Joined', label: 'Joined' },
            { value: 'Rejected', label: 'Rejected' },
            { value: 'Declined', label: 'Declined' },
        ],
    },
    { key: 'remarks', label: 'Remarks', type: 'textarea' },
    { key: 'is_active', label: 'Is Active?', type: 'radio' },
];

export default function Page() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    return (
        <>
            <CrudTable title="Placements" apiPath="student-placement" queryKey="student-placement" columns={COLUMNS} primaryKey="student_placement_id"
                onAdd={() => { setEditData(null); setModalOpen(true); }}
                onEdit={(r) => { setEditData(r); setModalOpen(true); }} />
            {modalOpen && <CrudModal title="Placement" apiPath="student-placement" queryKey="student-placement" primaryKey="student_placement_id" fields={FIELDS} editData={editData} onClose={() => setModalOpen(false)} />}
        </>
    );
}
