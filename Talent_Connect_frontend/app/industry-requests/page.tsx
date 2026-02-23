'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
    { key: 'industry_request_id', label: 'ID' },
    { key: 'industryId', label: 'Industry ID' },
    { key: 'instituteId', label: 'Institute ID' },
    { key: 'request_type_id', label: 'Request Type' },
    { key: 'request_status_id', label: 'Status' },
    { key: 'is_active', label: 'Active' },
];

const FIELDS = [
    {
        key: 'industryId', label: 'Company (Industry)', required: true,
        optionsApi: 'industry', optionsValueKey: 'industryId', optionsLabelKey: 'industryname',
    },
    {
        key: 'instituteId', label: 'Institute', required: true,
        optionsApi: 'institute', optionsValueKey: 'instituteId', optionsLabelKey: 'institutename',
    },
    {
        key: 'request_type_id', label: 'Request Type', required: true,
        optionsApi: 'request-type', optionsValueKey: 'request_type_id', optionsLabelKey: 'request_type',
    },
    {
        key: 'request_status_id', label: 'Request Status',
        optionsApi: 'request-status', optionsValueKey: 'request_status_id', optionsLabelKey: 'request_status',
    },
    {
        key: 'programId', label: 'Program',
        optionsApi: 'program', optionsValueKey: 'programId', optionsLabelKey: 'program_name',
    },
    {
        key: 'stream_branch_Id', label: 'Stream / Branch',
        optionsApi: 'stream-branch', optionsValueKey: 'stream_branch_Id', optionsLabelKey: 'stream_branch_name',
    },
    { key: 'request_date', label: 'Request Date', type: 'date' },
    { key: 'vacancies', label: 'No. of Vacancies', type: 'number' },
    { key: 'request_description', label: 'Description', type: 'textarea' },
    { key: 'is_active', label: 'Is Active?', type: 'radio' },
];

export default function Page() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    return (
        <>
            <CrudTable title="Industry Requests" apiPath="industry-request" queryKey="industry-request" columns={COLUMNS} primaryKey="industry_request_id"
                onAdd={() => { setEditData(null); setModalOpen(true); }}
                onEdit={(r) => { setEditData(r); setModalOpen(true); }} />
            {modalOpen && <CrudModal title="Industry Request" apiPath="industry-request" queryKey="industry-request" primaryKey="industry_request_id" fields={FIELDS} editData={editData} onClose={() => setModalOpen(false)} />}
        </>
    );
}
