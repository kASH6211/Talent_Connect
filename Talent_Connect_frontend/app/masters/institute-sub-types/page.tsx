'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
  { key: 'institute_sub_type_id', label: 'ID' },
  { key: 'institute_type_id', label: 'Type ID' },
  { key: 'institute_sub_type', label: 'Sub Type' },
  { key: 'institute_sub_abbreviation', label: 'Abbreviation' },
  { key: 'is_active', label: 'Status' },
];

const FIELDS = [
  {
    key: 'institute_type_id', label: 'Institute Type', required: true,
    optionsApi: 'institute-type', optionsValueKey: 'institute_type_id', optionsLabelKey: 'institute_type',
  },
  { key: 'institute_sub_type', label: 'Sub Type Name', required: true },
  { key: 'institute_sub_abbreviation', label: 'Abbreviation' },
  { key: 'is_active', label: 'Is Active?', type: 'radio' },
];

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  return (
    <>
      <CrudTable title="Institute Sub Types" apiPath="institute-sub-type" queryKey="institute-sub-type" columns={COLUMNS} primaryKey="institute_sub_type_id"
        onAdd={() => { setEditData(null); setModalOpen(true); }}
        onEdit={(r) => { setEditData(r); setModalOpen(true); }} />
      {modalOpen && <CrudModal title="Institute Sub Type" apiPath="institute-sub-type" queryKey="institute-sub-type" primaryKey="institute_sub_type_id" fields={FIELDS} editData={editData} onClose={() => setModalOpen(false)} />}
    </>
  );
}
