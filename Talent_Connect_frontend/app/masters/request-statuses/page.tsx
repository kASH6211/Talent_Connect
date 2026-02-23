'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
  {
    "key": "request_status_id",
    "label": "ID"
  },
  {
    "key": "request_status",
    "label": "Status"
  },
  {
    "key": "is_active",
    "label": "Status"
  }
];
const FIELDS = [
  {
    "key": "request_status",
    "label": "Request Status",
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
        title="Request Statuses"
        apiPath="request-status"
        queryKey="request-statuses"
        columns={COLUMNS}
        primaryKey="request_status_id"
        onAdd={openAdd}
        onEdit={openEdit}
      />
      {modalOpen && (
        <CrudModal
          title="Request Statuses"
          apiPath="request-status"
          queryKey="request-statuses"
          primaryKey="request_status_id"
          fields={FIELDS}
          editData={editData}
          onClose={onClose}
        />
      )}
    </>
  );
}
