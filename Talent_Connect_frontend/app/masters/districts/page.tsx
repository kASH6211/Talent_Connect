'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
  { key: 'lgddistrictId', label: 'District ID' },
  { key: 'districtname', label: 'District Name' },
  { key: 'lgdstateid', label: 'State ID' },
  { key: 'is_active', label: 'Status' },
];

const FIELDS = [
  { key: 'districtname', label: 'District Name', required: true },
  {
    key: 'lgdstateid', label: 'State', required: true,
    optionsApi: 'state', optionsValueKey: 'lgdstateid', optionsLabelKey: 'statename',
  },
  { key: 'lgddistrictId', label: 'LGD District ID (numeric)', type: 'number' },
  { key: 'is_active', label: 'Is Active?', type: 'radio' },
];

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  return (
    <>
      <CrudTable title="Districts" apiPath="district" queryKey="district" columns={COLUMNS} primaryKey="lgddistrictId"
        onAdd={() => { setEditData(null); setModalOpen(true); }}
        onEdit={(r) => { setEditData(r); setModalOpen(true); }} />
      {modalOpen && <CrudModal title="District" apiPath="district" queryKey="district" primaryKey="lgddistrictId" fields={FIELDS} editData={editData} onClose={() => setModalOpen(false)} />}
    </>
  );
}
