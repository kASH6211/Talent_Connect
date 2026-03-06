'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
    { key: 'job_role_qualification_mapping_id', label: 'ID' },
    {
        key: 'jobrole_id', label: 'Job Role',
        render: (val: any, row: any) => row.jobRole?.jobrole || val
    },
    {
        key: 'qualificationid', label: 'Qualification',
        render: (val: any, row: any) => row.qualification?.qualification || val
    },
    {
        key: 'stream_branch_Id', label: 'Course',
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
        key: 'qualificationid', label: 'Qualification', required: true,
        optionsApi: 'qualification', optionsValueKey: 'qualificationid', optionsLabelKey: 'qualification',
    },
    {
        key: 'stream_branch_Id', label: 'Course',
        optionsApi: 'stream-branch', optionsValueKey: 'stream_branch_Id', optionsLabelKey: 'stream_branch_name',
        dependsOn: 'qualificationid', dependsOnQueryKey: 'qualification_id',
    },
    { key: 'is_active', label: 'Is Active?', type: 'radio' },
];

export default function Page() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    return (
        <>
            <CrudTable title="Job Role ↔ Qualification Mapping" apiPath="job-role-qualification-mapping" queryKey="job-role-qualification-mapping" columns={COLUMNS} primaryKey="job_role_qualification_mapping_id" pagination={true}
                onAdd={() => { setEditData(null); setModalOpen(true); }}
                onEdit={(r) => { setEditData(r); setModalOpen(true); }} />
            {modalOpen && <CrudModal title="Job Role-Qualification Mapping" apiPath="job-role-qualification-mapping" queryKey="job-role-qualification-mapping" primaryKey="job_role_qualification_mapping_id" fields={FIELDS} editData={editData} onClose={() => setModalOpen(false)} />}
        </>
    );
}
