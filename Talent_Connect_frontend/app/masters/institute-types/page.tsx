'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
  {
    "key": "institute_type_id",
    "label": "ID"
  },
  {
    "key": "institute_type",
    "label": "Type"
  },
  {
    "key": "institute_abbreviation",
    "label": "Abbreviation"
  },
  {
    "key": "is_active",
    "label": "Status"
  }
];
const FIELDS = [
  {
    "key": "institute_type",
    "label": "Institute Type",
    "required": true
  },
  {
    "key": "institute_abbreviation",
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
        title="Institute Types"
        apiPath="institute-type"
        queryKey="institute-types"
        columns={COLUMNS}
        primaryKey="institute_type_id"
        onAdd={openAdd}
        onEdit={openEdit}
      />
      {modalOpen && (
        <CrudModal
          title="Institute Types"
          apiPath="institute-type"
          queryKey="institute-types"
          primaryKey="institute_type_id"
          fields={FIELDS}
          editData={editData}
          onClose={onClose}
        />
      )}
    </>
  );
}
