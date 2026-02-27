'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';
import { useAuth } from '@/hooks/useAuth';

export default function Page() {
    const { isInstitute } = useAuth();
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    const COLUMNS = [
        { key: 'program_institute_mapping_id', label: 'ID' },
        ...(!isInstitute ? [{
            key: 'instituteId', label: 'Institute',
            render: (val: any, row: any) => row.institute?.institute_name || val
        }] : []),
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
        ...(!isInstitute ? [{
            key: 'instituteId', label: 'Institute', required: true,
            optionsApi: 'institute', optionsValueKey: 'institute_id', optionsLabelKey: 'institute_name',
        }] : []),
        {
            key: 'programId', label: 'Program', required: true,
            optionsApi: 'program', optionsValueKey: 'programId', optionsLabelKey: 'program_name',
        },
        {
            key: 'stream_branch_Id', label: 'Stream / Branch', required: true,
            optionsApi: 'stream-branch', optionsValueKey: 'stream_branch_Id', optionsLabelKey: 'stream_branch_name',
            dependsOn: 'programId', dependsOnQueryKey: 'program_id',
        },
        { key: 'totalintake', label: 'Total Intake', type: 'number' },
        { key: 'is_active', label: 'Is Active?', type: 'radio' },
    ];

    return (
        <>
            <CrudTable title="Institute ↔ Program Mapping" apiPath="institute-program-mapping" queryKey="institute-program-mapping" columns={COLUMNS} primaryKey="program_institute_mapping_id"
                onAdd={() => { setEditData(null); setModalOpen(true); }}
                onEdit={(r) => { setEditData(r); setModalOpen(true); }} />
            {modalOpen && <CrudModal title="Institute-Program Mapping" apiPath="institute-program-mapping" queryKey="institute-program-mapping" primaryKey="program_institute_mapping_id" fields={FIELDS} editData={editData} onClose={() => setModalOpen(false)} />}
        </>
    );
}
