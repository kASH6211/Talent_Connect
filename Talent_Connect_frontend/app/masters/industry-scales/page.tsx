'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
  {
    "key": "industry_scale_id",
    "label": "ID"
  },
  {
    "key": "industry_scale",
    "label": "Scale"
  },
  {
    "key": "industry_scale_abbreviation",
    "label": "Abbreviation"
  },
  {
    "key": "is_active",
    "label": "Status"
  }
];
const FIELDS = [
  {
    "key": "industry_scale",
    "label": "Industry Scale",
    "required": true
  },
  {
    "key": "industry_scale_abbreviation",
    "label": "Abbreviation"
  },
  {
    "key": "is_active",
    "label": "Is Active?",
    "type": "radio"
  }
];

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const openAdd = () => { setEditData(null); setModalOpen(true); };
  const openEdit = (row: any) => { setEditData(row); setModalOpen(true); };
  const onClose = () => setModalOpen(false);

  return (
    <>
      <CrudTable
        title="Industry Scales"
        apiPath="industry-scale"
        queryKey="industry-scales"
        columns={COLUMNS}
        primaryKey="industry_scale_id"
        onAdd={openAdd}
        onEdit={openEdit}
      />
      {modalOpen && (
        <CrudModal
          title="Industry Scales"
          apiPath="industry-scale"
          queryKey="industry-scales"
          primaryKey="industry_scale_id"
          fields={FIELDS}
          editData={editData}
          onClose={onClose}
        />
      )}
    </>
  );
}
