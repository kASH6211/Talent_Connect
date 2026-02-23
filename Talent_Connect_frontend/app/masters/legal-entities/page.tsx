'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
  {
    "key": "legal_entity_type_id",
    "label": "ID"
  },
  {
    "key": "legal_entity_type",
    "label": "Legal Entity Type"
  },
  {
    "key": "legal_entity_type_abbreviation",
    "label": "Abbreviation"
  },
  {
    "key": "is_active",
    "label": "Status"
  }
];
const FIELDS = [
  {
    "key": "legal_entity_type",
    "label": "Legal Entity Type",
    "required": true
  },
  {
    "key": "legal_entity_type_abbreviation",
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
        title="Legal Entity Types"
        apiPath="legal-entity"
        queryKey="legal-entities"
        columns={COLUMNS}
        primaryKey="legal_entity_type_id"
        onAdd={openAdd}
        onEdit={openEdit}
      />
      {modalOpen && (
        <CrudModal
          title="Legal Entity Types"
          apiPath="legal-entity"
          queryKey="legal-entities"
          primaryKey="legal_entity_type_id"
          fields={FIELDS}
          editData={editData}
          onClose={onClose}
        />
      )}
    </>
  );
}
