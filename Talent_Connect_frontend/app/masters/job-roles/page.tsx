'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
  {
    "key": "jobrole_id",
    "label": "ID"
  },
  {
    "key": "jobrole",
    "label": "Job Role"
  },
  {
    "key": "is_active",
    "label": "Status"
  }
];
const FIELDS = [
  {
    "key": "jobrole",
    "label": "Job Role Name",
    "required": true
  },
  {
    "key": "jobdescription",
    "label": "Job Description",
    "type": "textarea"
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
        title="Job Roles"
        apiPath="job-role"
        queryKey="job-roles"
        columns={COLUMNS}
        primaryKey="jobrole_id"
        onAdd={openAdd}
        onEdit={openEdit}
      />
      {modalOpen && (
        <CrudModal
          title="Job Roles"
          apiPath="job-role"
          queryKey="job-roles"
          primaryKey="jobrole_id"
          fields={FIELDS}
          editData={editData}
          onClose={onClose}
        />
      )}
    </>
  );
}
