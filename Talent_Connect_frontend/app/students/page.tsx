'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
    { key: 'student_id', label: 'ID' },
    { key: 'first_name', label: 'First Name' },
    { key: 'last_name', label: 'Last Name' },
    { key: 'mobileno', label: 'Mobile' },
    { key: 'is_active', label: 'Status' },
];

const FIELDS = [
    { key: 'first_name', label: 'First Name', required: true },
    { key: 'last_name', label: 'Last Name', required: true },
    { key: 'middle_name', label: 'Middle Name' },
    { key: 'date_of_birth', label: 'Date of Birth', type: 'date' },
    {
        key: 'gender', label: 'Gender', type: 'select',
        options: [{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }, { value: 'O', label: 'Other' }],
    },
    { key: 'emailId', label: 'Email' },
    { key: 'mobileno', label: 'Mobile No.', required: true },
    { key: 'address', label: 'Address', type: 'textarea' },
    { key: 'pincode', label: 'Pincode', type: 'number' },
    {
        key: 'institute_id', label: 'Institute',
        optionsApi: 'institute', optionsValueKey: 'institute_id', optionsLabelKey: 'institute_name',
    },
    {
        key: 'qualificationid', label: 'Qualification',
        optionsApi: 'qualification', optionsValueKey: 'qualificationid', optionsLabelKey: 'qualification',
    },
    {
        key: 'programId', label: 'Program',
        optionsApi: 'program', optionsValueKey: 'programId', optionsLabelKey: 'program_name',
    },
    {
        key: 'stream_branch_Id', label: 'Stream / Branch',
        optionsApi: 'stream-branch', optionsValueKey: 'stream_branch_Id', optionsLabelKey: 'stream_branch_name',
    },
    { key: 'passing_year', label: 'Pass-out Year', type: 'number' },
    { key: 'percentage', label: 'CGPA / Percentage' },
    { key: 'is_active', label: 'Is Active?', type: 'radio' },
];

export default function Page() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    return (
        <>
            <CrudTable title="Students" apiPath="student" queryKey="student" columns={COLUMNS} primaryKey="student_id" pagination={true}
                onAdd={() => { setEditData(null); setModalOpen(true); }}
                onEdit={(r) => { setEditData(r); setModalOpen(true); }} />
            {modalOpen && <CrudModal title="Student" apiPath="student" queryKey="student" primaryKey="student_id" fields={FIELDS} editData={editData} onClose={() => setModalOpen(false)} />}
        </>
    );
}
