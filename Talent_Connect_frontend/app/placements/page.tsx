'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
    { key: 'placement_id', label: 'ID' },
    { key: 'student.first_name', label: 'Student' },
    { key: 'industry.industry_name', label: 'Company (Industry)' },
    { key: 'job_role', label: 'Job Role' },
    { key: 'placement_status', label: 'Status' },
    { key: 'is_active', label: 'Active' },
];

const FIELDS = [
    {
        key: 'student_id', label: 'Student', required: true,
        optionsApi: 'student', optionsValueKey: 'student_id', optionsLabelKey: 'first_name',
    },
    {
        key: 'industryid', label: 'Company (Industry)', required: true,
        optionsApi: 'industry', optionsValueKey: 'industry_id', optionsLabelKey: 'industry_name',
    },
    { key: 'job_role', label: 'Job Role' },
    { key: 'offer_date', label: 'Offer Date', type: 'date' },
    { key: 'joining_date', label: 'Joining Date', type: 'date' },
    {
        key: 'placement_status', label: 'Placement Status', type: 'select',
        options: [
            { value: 'O', label: 'Offered' },
            { value: 'A', label: 'Accepted' },
            { value: 'J', label: 'Joined' },
            { value: 'R', label: 'Rejected' },
            { value: 'D', label: 'Declined' },
        ],
    },
    { key: 'offer_accepted', label: 'Offer Accepted?', type: 'radio' },
    { key: 'is_active', label: 'Is Active?', type: 'radio' },
];

export default function Page() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    return (
        <>
            <CrudTable title="Placements" apiPath="student-placement" queryKey="student-placement" columns={COLUMNS} primaryKey="placement_id"
                onAdd={() => { setEditData(null); setModalOpen(true); }}
                onEdit={(r) => { setEditData(r); setModalOpen(true); }} />
            {modalOpen && <CrudModal title="Placement" apiPath="student-placement" queryKey="student-placement" primaryKey="placement_id" fields={FIELDS} editData={editData} onClose={() => setModalOpen(false)} />}
        </>
    );
}
