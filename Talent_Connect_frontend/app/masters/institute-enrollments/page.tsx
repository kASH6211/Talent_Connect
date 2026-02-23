'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
  {
    "key": "institute_enrollment_id",
    "label": "ID"
  },
  {
    "key": "instituteenrollmenttype",
    "label": "Enrollment Type"
  },
  {
    "key": "is_active",
    "label": "Status"
  }
];
const FIELDS = [
  {
    "key": "instituteenrollmenttype",
    "label": "Enrollment Type",
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
        title="Institute Enrollment Types"
        apiPath="institute-enrollment"
        queryKey="institute-enrollments"
        columns={COLUMNS}
        primaryKey="institute_enrollment_id"
        onAdd={openAdd}
        onEdit={openEdit}
      />
      {modalOpen && (
        <CrudModal
          title="Institute Enrollment Types"
          apiPath="institute-enrollment"
          queryKey="institute-enrollments"
          primaryKey="institute_enrollment_id"
          fields={FIELDS}
          editData={editData}
          onClose={onClose}
        />
      )}
    </>
  );
}
