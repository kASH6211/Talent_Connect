'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
    { key: 'stream_branch_qualification_id', label: 'ID' },
    {
        key: 'qualificationid', label: 'Qualification',
        render: (val: any, row: any) => row.qualification?.qualification || val
    },
    {
        key: 'stream_branch_Id', label: 'Stream / Branch',
        render: (val: any, row: any) => row.streamBranch?.stream_branch_name || val
    },
    { key: 'is_active', label: 'Status' },
];

const FIELDS = [
    {
        key: 'qualificationid', label: 'Qualification', required: true,
        optionsApi: 'qualification', optionsValueKey: 'qualificationid', optionsLabelKey: 'qualification',
    },
    {
        key: 'stream_branch_Id', label: 'Stream / Branch', required: true,
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
            <CrudTable title="Qualification ↔ Stream/Branch Mapping" apiPath="stream-branch-qualification-mapping" queryKey="stream-branch-qualification-mapping" columns={COLUMNS} primaryKey="stream_branch_qualification_id"
                onAdd={() => { setEditData(null); setModalOpen(true); }}
                onEdit={(r) => { setEditData(r); setModalOpen(true); }} />
            {modalOpen && <CrudModal title="Qualification-Stream/Branch Mapping" apiPath="stream-branch-qualification-mapping" queryKey="stream-branch-qualification-mapping" primaryKey="stream_branch_qualification_id" fields={FIELDS} editData={editData} onClose={() => setModalOpen(false)} />}
        </>
    );
}
