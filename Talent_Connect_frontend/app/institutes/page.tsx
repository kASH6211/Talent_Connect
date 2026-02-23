'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
    { key: 'institute_id', label: 'ID' },
    { key: 'institute_name', label: 'Name' },
    { key: 'address', label: 'Address' },
    { key: 'is_active', label: 'Status' },
];

const FIELDS = [
    { key: 'institute_name', label: 'Institute Name', required: true },
    {
        key: 'institute_type_id', label: 'Institute Type', required: true,
        optionsApi: 'institute-type', optionsValueKey: 'institute_type_id', optionsLabelKey: 'institute_type',
    },
    {
        key: 'institute_sub_type_id', label: 'Institute Sub Type',
        optionsApi: 'institute-sub-type', optionsValueKey: 'institute_sub_type_id', optionsLabelKey: 'institute_sub_type',
    },
    {
        key: 'institute_ownership_type_id', label: 'Ownership Type',
        optionsApi: 'institute-ownership-type', optionsValueKey: 'institute_ownership_type_id', optionsLabelKey: 'institute_type',
    },
    {
        key: 'affiliating_body_id', label: 'Affiliation Body',
        optionsApi: 'affiliation', optionsValueKey: 'affiliating_body_id', optionsLabelKey: 'affiliating_body',
    },
    {
        key: 'regulatory_body_id', label: 'Regulatory Body',
        optionsApi: 'regulatory', optionsValueKey: 'regulatory_body_id', optionsLabelKey: 'regulatory_body',
    },
    {
        key: 'university_board_id', label: 'University / Board',
        optionsApi: 'board', optionsValueKey: 'university_board_id', optionsLabelKey: 'university_board_name',
    },
    {
        key: 'lgdstateId', label: 'State',
        optionsApi: 'state', optionsValueKey: 'lgdstateid', optionsLabelKey: 'statename',
    },
    {
        key: 'lgddistrictId', label: 'District',
        optionsApi: 'district', optionsValueKey: 'lgddistrictId', optionsLabelKey: 'districtname',
    },
    { key: 'pincode', label: 'Pincode', type: 'number' },
    { key: 'address', label: 'Address', type: 'textarea' },
    { key: 'emailId', label: 'Email', type: 'email' },
    { key: 'mobileno', label: 'Mobile No.' },
    { key: 'url', label: 'Website URL' },
    {
        key: 'institute_enrollment_id', label: 'Enrollment Type',
        optionsApi: 'institute-enrollment', optionsValueKey: 'institute_enrollment_id', optionsLabelKey: 'instituteenrollmenttype',
    },
    {
        key: 'training_type_id', label: 'Training Type',
        optionsApi: 'training-type', optionsValueKey: 'training_type_id', optionsLabelKey: 'training_type',
    },
    { key: 'is_active', label: 'Is Active?', type: 'radio' },
];

export default function Page() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    return (
        <>
            <CrudTable title="Institutes" apiPath="institute" queryKey="institute" columns={COLUMNS} primaryKey="institute_id"
                onAdd={() => { setEditData(null); setModalOpen(true); }}
                onEdit={(r) => { setEditData(r); setModalOpen(true); }} />
            {modalOpen && <CrudModal title="Institute" apiPath="institute" queryKey="institute" primaryKey="institute_id" fields={FIELDS} editData={editData} onClose={() => setModalOpen(false)} />}
        </>
    );
}
