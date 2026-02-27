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
        { key: 'institute_qualification_id', label: 'ID' },
        ...(!isInstitute ? [{
            key: 'instituteId', label: 'Institute',
            render: (val: any, row: any) => row.institute?.institute_name || val
        }] : []),
        {
            key: 'qualificationid', label: 'Qualification',
            render: (val: any, row: any) => row.qualification?.qualification || val
        },
        {
            key: 'stream_branch_Id', label: 'Stream / Branch',
            render: (val: any, row: any) => row.streamBranch?.stream_branch_name || val || '—'
        },
        { key: 'is_active', label: 'Status' },
    ];

    const FIELDS = [
        ...(!isInstitute ? [{
            key: 'instituteId', label: 'Institute', required: true,
            optionsApi: 'institute', optionsValueKey: 'institute_id', optionsLabelKey: 'institute_name',
        }] : []),
        {
            key: 'qualificationid', label: 'Qualification', required: true,
            optionsApi: 'qualification', optionsValueKey: 'qualificationid', optionsLabelKey: 'qualification',
        },
        {
            key: 'stream_branch_Id', label: 'Stream / Branch',
            optionsApi: 'stream-branch', optionsValueKey: 'stream_branch_Id', optionsLabelKey: 'stream_branch_name',
            dependsOn: 'qualificationid', dependsOnQueryKey: 'qualification_id',
        },
        { key: 'is_active', label: 'Is Active?', type: 'radio' },
    ];

    return (
        <>
            <CrudTable title="Institute ↔ Qualification Mapping" apiPath="institute-qualification-mapping" queryKey="institute-qualification-mapping" columns={COLUMNS} primaryKey="institute_qualification_id"
                onAdd={() => { setEditData(null); setModalOpen(true); }}
                onEdit={(r) => { setEditData(r); setModalOpen(true); }} />
            {modalOpen && <CrudModal title="Institute-Qualification Mapping" apiPath="institute-qualification-mapping" queryKey="institute-qualification-mapping" primaryKey="institute_qualification_id" fields={FIELDS} editData={editData} onClose={() => setModalOpen(false)} />}
        </>
    );
}
