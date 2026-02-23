'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
    { key: 'program_qualification_mapping_id', label: 'ID' },
    {
        key: 'qualificationid', label: 'Qualification',
        render: (val: any, row: any) => row.qualification?.qualification || val
    },
    {
        key: 'programId', label: 'Program',
        render: (val: any, row: any) => row.program?.program_name || val
    },
    { key: 'is_active', label: 'Status' },
];

const FIELDS = [
    {
        key: 'qualificationid', label: 'Qualification', required: true,
        optionsApi: 'qualification', optionsValueKey: 'qualificationid', optionsLabelKey: 'qualification',
    },
    {
        key: 'programId', label: 'Program', required: true,
        optionsApi: 'program', optionsValueKey: 'programId', optionsLabelKey: 'program_name',
    },
    { key: 'is_active', label: 'Is Active?', type: 'radio' },
];

export default function Page() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    return (
        <>
            <CrudTable title="Program ↔ Qualification Mapping" apiPath="program-qualification-mapping" queryKey="program-qualification-mapping" columns={COLUMNS} primaryKey="program_qualification_mapping_id"
                onAdd={() => { setEditData(null); setModalOpen(true); }}
                onEdit={(r) => { setEditData(r); setModalOpen(true); }} />
            {modalOpen && <CrudModal title="Program-Qualification Mapping" apiPath="program-qualification-mapping" queryKey="program-qualification-mapping" primaryKey="program_qualification_mapping_id" fields={FIELDS} editData={editData} onClose={() => setModalOpen(false)} />}
        </>
    );
}
