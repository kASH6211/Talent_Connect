'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
  {
    "key": "university_board_id",
    "label": "ID"
  },
  {
    "key": "university_board_name",
    "label": "Name"
  },
  {
    "key": "university_board_abbreviation",
    "label": "Abbreviation"
  },
  {
    "key": "phoneno",
    "label": "Phone"
  },
  {
    "key": "emailId",
    "label": "Email"
  },
  {
    "key": "is_active",
    "label": "Status"
  }
];
const FIELDS = [
  {
    "key": "university_board_name",
    "label": "Board/University Name",
    "required": true
  },
  {
    "key": "university_board_abbreviation",
    "label": "Abbreviation"
  },
  {
    "key": "address",
    "label": "Address",
    "type": "textarea"
  },
  {
    "key": "phoneno",
    "label": "Phone Number"
  },
  {
    "key": "emailId",
    "label": "Email Id"
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
        title="Boards & Universities"
        apiPath="board"
        queryKey="boards"
        columns={COLUMNS}
        primaryKey="university_board_id"
        onAdd={openAdd}
        onEdit={openEdit}
      />
      {modalOpen && (
        <CrudModal
          title="Boards & Universities"
          apiPath="board"
          queryKey="boards"
          primaryKey="university_board_id"
          fields={FIELDS}
          editData={editData}
          onClose={onClose}
        />
      )}
    </>
  );
}
