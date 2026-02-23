'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
  {
    "key": "identifier_type_id",
    "label": "ID"
  },
  {
    "key": "identifier_type",
    "label": "Identifier Type"
  },
  {
    "key": "identifier_type_abbreviation",
    "label": "Abbreviation"
  },
  {
    "key": "is_active",
    "label": "Status"
  }
];
const FIELDS = [
  {
    "key": "identifier_type",
    "label": "Identifier Type"
  },
  {
    "key": "identifier_type_abbreviation",
    "label": "Abbreviation (GSTIN/CIN/PAN/MSME)"
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
        title="Identifier Types"
        apiPath="identifier-type"
        queryKey="identifier-types"
        columns={COLUMNS}
        primaryKey="identifier_type_id"
        onAdd={openAdd}
        onEdit={openEdit}
      />
      {modalOpen && (
        <CrudModal
          title="Identifier Types"
          apiPath="identifier-type"
          queryKey="identifier-types"
          primaryKey="identifier_type_id"
          fields={FIELDS}
          editData={editData}
          onClose={onClose}
        />
      )}
    </>
  );
}
