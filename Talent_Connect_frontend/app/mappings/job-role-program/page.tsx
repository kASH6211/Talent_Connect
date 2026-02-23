'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
    { key: 'job_role_program_mapping_id', label: 'ID' },
    {
        key: 'jobrole_id', label: 'Job Role',
        render: (val: any, row: any) => row.jobRole?.jobrole || val
    },
    {
        key: 'programId', label: 'Program',
        render: (val: any, row: any) => row.program?.program_name || val
    },
    {
        key: 'stream_branch_Id', label: 'Stream/Branch',
        render: (val: any, row: any) => row.streamBranch?.stream_branch_name || val
    },
    { key: 'is_active', label: 'Status' },
];

const FIELDS = [
    {
        key: 'jobrole_id', label: 'Job Role', required: true,
        optionsApi: 'job-role', optionsValueKey: 'jobrole_id', optionsLabelKey: 'jobrole',
    },
    {
        key: 'programId', label: 'Program', required: true,
        optionsApi: 'program', optionsValueKey: 'programId', optionsLabelKey: 'program_name',
    },
    {
        key: 'stream_branch_Id', label: 'Stream / Branch',
        optionsApi: 'stream-branch', optionsValueKey: 'stream_branch_Id', optionsLabelKey: 'stream_branch_name',
    },
    { key: 'is_active', label: 'Is Active?', type: 'radio' },
];

export default function Page() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    return (
        <>
            <CrudTable title="Job Role ↔ Program Mapping" apiPath="job-role-program-mapping" queryKey="job-role-program-mapping" columns={COLUMNS} primaryKey="job_role_program_mapping_id"
                onAdd={() => { setEditData(null); setModalOpen(true); }}
                onEdit={(r) => { setEditData(r); setModalOpen(true); }} />
            {modalOpen && <CrudModal title="Job Role-Program Mapping" apiPath="job-role-program-mapping" queryKey="job-role-program-mapping" primaryKey="job_role_program_mapping_id" fields={FIELDS} editData={editData} onClose={() => setModalOpen(false)} />}
        </>
    );
}
