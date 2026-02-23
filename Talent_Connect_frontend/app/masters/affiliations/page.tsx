'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
  {
    "key": "affiliating_body_id",
    "label": "ID"
  },
  {
    "key": "affiliating_body",
    "label": "Affiliating Body"
  },
  {
    "key": "affiliating_body_abbreviation",
    "label": "Abbreviation"
  },
  {
    "key": "is_active",
    "label": "Status"
  }
];
const FIELDS = [
  {
    "key": "affiliating_body",
    "label": "Affiliating Body Name",
    "required": true
  },
  {
    "key": "affiliating_body_abbreviation",
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
        title="Affiliating Bodies"
        apiPath="affiliation"
        queryKey="affiliations"
        columns={COLUMNS}
        primaryKey="affiliating_body_id"
        onAdd={openAdd}
        onEdit={openEdit}
      />
      {modalOpen && (
        <CrudModal
          title="Affiliating Bodies"
          apiPath="affiliation"
          queryKey="affiliations"
          primaryKey="affiliating_body_id"
          fields={FIELDS}
          editData={editData}
          onClose={onClose}
        />
      )}
    </>
  );
}
