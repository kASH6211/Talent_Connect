'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
  {
    "key": "industry_sector_id",
    "label": "ID"
  },
  {
    "key": "industry_sector_type",
    "label": "Sector Type"
  },
  {
    "key": "industry_sector_type_abbreviation",
    "label": "Abbreviation"
  },
  {
    "key": "is_active",
    "label": "Status"
  }
];
const FIELDS = [
  {
    "key": "industry_sector_type",
    "label": "Industry Sector Type",
    "required": true
  },
  {
    "key": "industry_sector_type_abbreviation",
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
        title="Industry Sectors"
        apiPath="industry-sector"
        queryKey="industry-sectors"
        columns={COLUMNS}
        primaryKey="industry_sector_id"
        onAdd={openAdd}
        onEdit={openEdit}
      />
      {modalOpen && (
        <CrudModal
          title="Industry Sectors"
          apiPath="industry-sector"
          queryKey="industry-sectors"
          primaryKey="industry_sector_id"
          fields={FIELDS}
          editData={editData}
          onClose={onClose}
        />
      )}
    </>
  );
}
