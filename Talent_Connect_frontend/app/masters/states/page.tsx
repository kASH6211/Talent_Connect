'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
  {
    "key": "stateid",
    "label": "ID"
  },
  {
    "key": "statename",
    "label": "Name"
  },
  {
    "key": "lgdstateid",
    "label": "LGD Code"
  },
  {
    "key": "is_active",
    "label": "Status"
  }
];
const FIELDS = [
  {
    "key": "statename",
    "label": "State Name",
    "required": true
  },
  {
    "key": "lgdstateid",
    "label": "LGD State Code",
    "type": "number",
    "required": true
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
        title="States"
        apiPath="state"
        queryKey="states"
        columns={COLUMNS}
        primaryKey="stateid"
        onAdd={openAdd}
        onEdit={openEdit}
      />
      {modalOpen && (
        <CrudModal
          title="States"
          apiPath="state"
          queryKey="states"
          primaryKey="stateid"
          fields={FIELDS}
          editData={editData}
          onClose={onClose}
        />
      )}
    </>
  );
}
