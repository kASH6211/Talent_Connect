'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
    { key: 'industry_id', label: 'ID' },
    { key: 'industry_name', label: 'Company Name' },
    { key: 'address', label: 'Address' },
    { key: 'industry_sector_id', label: 'Sector ID' },
    { key: 'is_active', label: 'Status' },
];

const FIELDS = [
    { key: 'industry_name', label: 'Company Name', required: true },
    {
        key: 'legal_entity_type_id', label: 'Legal Entity Type',
        optionsApi: 'legal-entity', optionsValueKey: 'legal_entity_id', optionsLabelKey: 'legal_entity_type',
    },
    {
        key: 'industry_sector_id', label: 'Industry Sector',
        optionsApi: 'industry-sector', optionsValueKey: 'industry_sector_id', optionsLabelKey: 'industry_sector_type',
    },
    {
        key: 'industry_scale_id', label: 'Industry Scale',
        optionsApi: 'industry-scale', optionsValueKey: 'industry_scale_id', optionsLabelKey: 'industry_scale',
    },
    {
        key: 'lgdstateId', label: 'State (HQ)',
        optionsApi: 'state', optionsValueKey: 'lgdstateid', optionsLabelKey: 'statename',
    },
    {
        key: 'lgddistrictId', label: 'District (HQ)',
        optionsApi: 'district', optionsValueKey: 'lgddistrictId', optionsLabelKey: 'districtname',
    },
    { key: 'pincode', label: 'Pincode', type: 'number' },
    { key: 'address', label: 'Address', type: 'textarea' },
    { key: 'emailId', label: 'Email' },
    { key: 'mobileno', label: 'Mobile No.' },
    { key: 'url', label: 'Website' },
    { key: 'is_active', label: 'Is Active?', type: 'radio' },
];

export default function Page() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    return (
        <>
            <CrudTable title="Industries" apiPath="industry" queryKey="industry" columns={COLUMNS} primaryKey="industry_id"
                onAdd={() => { setEditData(null); setModalOpen(true); }}
                onEdit={(r) => { setEditData(r); setModalOpen(true); }} />
            {modalOpen && <CrudModal title="Industry" apiPath="industry" queryKey="industry" primaryKey="industry_id" fields={FIELDS} editData={editData} onClose={() => setModalOpen(false)} />}
        </>
    );
}
