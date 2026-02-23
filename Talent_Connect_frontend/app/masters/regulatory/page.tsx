'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
  {
    "key": "regulatory_body_id",
    "label": "ID"
  },
  {
    "key": "regulatory_body",
    "label": "Regulatory Body"
  },
  {
    "key": "regulatory_body_abbreviation",
    "label": "Abbreviation"
  },
  {
    "key": "is_active",
    "label": "Status"
  }
];
const FIELDS = [
  {
    "key": "regulatory_body",
    "label": "Regulatory Body Name",
    "required": true
  },
  {
    "key": "regulatory_body_abbreviation",
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
        title="Regulatory Bodies"
        apiPath="regulatory"
        queryKey="regulatory"
        columns={COLUMNS}
        primaryKey="regulatory_body_id"
        onAdd={openAdd}
        onEdit={openEdit}
      />
      {modalOpen && (
        <CrudModal
          title="Regulatory Bodies"
          apiPath="regulatory"
          queryKey="regulatory"
          primaryKey="regulatory_body_id"
          fields={FIELDS}
          editData={editData}
          onClose={onClose}
        />
      )}
    </>
  );
}
