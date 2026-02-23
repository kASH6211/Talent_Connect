'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
    { key: 'program_institute_mapping_id', label: 'ID' },
    {
        key: 'instituteId', label: 'Institute',
        render: (val: any, row: any) => row.institute?.institute_name || val
    },
    {
        key: 'programId', label: 'Program',
        render: (val: any, row: any) => row.program?.program_name || val
    },
    {
        key: 'stream_branch_Id', label: 'Stream/Branch',
        render: (val: any, row: any) => row.streamBranch?.stream_branch_name || val
    },
    { key: 'totalintake', label: 'Total Intake' },
    { key: 'is_active', label: 'Status' },
];

const FIELDS = [
    {
        key: 'instituteId', label: 'Institute', required: true,
        optionsApi: 'institute', optionsValueKey: 'instituteId', optionsLabelKey: 'institutename',
    },
    {
        key: 'programId', label: 'Program', required: true,
        optionsApi: 'program', optionsValueKey: 'programId', optionsLabelKey: 'program_name',
    },
    {
        key: 'stream_branch_Id', label: 'Stream / Branch', required: true,
        optionsApi: 'stream-branch', optionsValueKey: 'stream_branch_Id', optionsLabelKey: 'stream_branch_name',
    },
    { key: 'totalintake', label: 'Total Intake', type: 'number' },
    { key: 'is_active', label: 'Is Active?', type: 'radio' },
];

export default function Page() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    return (
        <>
            <CrudTable title="Institute ↔ Program Mapping" apiPath="institute-program-mapping" queryKey="institute-program-mapping" columns={COLUMNS} primaryKey="program_institute_mapping_id"
                onAdd={() => { setEditData(null); setModalOpen(true); }}
                onEdit={(r) => { setEditData(r); setModalOpen(true); }} />
            {modalOpen && <CrudModal title="Institute-Program Mapping" apiPath="institute-program-mapping" queryKey="institute-program-mapping" primaryKey="program_institute_mapping_id" fields={FIELDS} editData={editData} onClose={() => setModalOpen(false)} />}
        </>
    );
}
