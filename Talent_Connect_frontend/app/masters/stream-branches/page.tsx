'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
  { key: 'stream_branch_Id', label: 'ID' },
  { key: 'stream_branch_name', label: 'Stream / Branch' },
  { key: 'stream_branch_abbreviation', label: 'Abbr.' },
  {
    key: 'qualificationid', label: 'Qualification',
    render: (val: any, row: any) => row.qualification?.qualification || val
  },
  { key: 'is_active', label: 'Status' },
];

const FIELDS = [
  { key: 'stream_branch_name', label: 'Stream / Branch Name', required: true },
  { key: 'stream_branch_abbreviation', label: 'Abbreviation' },
  {
    key: 'qualificationid', label: 'Qualification', required: true,
    optionsApi: 'qualification', optionsValueKey: 'qualificationid', optionsLabelKey: 'qualification',
  },
  {
    key: 'affiliating_body_id', label: 'Affiliation Body',
    optionsApi: 'affiliation', optionsValueKey: 'affiliating_body_id', optionsLabelKey: 'affiliating_body',
  },
  { key: 'is_active', label: 'Is Active?', type: 'radio' },
];

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  return (
    <>
      <CrudTable title="Stream / Branches" apiPath="stream-branch" queryKey="stream-branch" columns={COLUMNS} primaryKey="stream_branch_Id"
        onAdd={() => { setEditData(null); setModalOpen(true); }}
        onEdit={(r) => { setEditData(r); setModalOpen(true); }} />
      {modalOpen && <CrudModal title="Stream / Branch" apiPath="stream-branch" queryKey="stream-branch" primaryKey="stream_branch_Id" fields={FIELDS} editData={editData} onClose={() => setModalOpen(false)} />}
    </>
  );
}
