'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
  { key: 'stream_branch_Id', label: 'ID' },
  { key: 'stream_branch_name', label: 'Course' },
  { key: 'stream_branch_abbreviation', label: 'Abbr.' },
  {
    key: 'qualificationid', label: 'Qualification',
    render: (val: any, row: any) => row.qualification?.qualification || val
  },
  {
    key: 'affiliating_body_id', label: 'Affiliation Body',
    render: (val: any, row: any) => row.affiliation?.affiliating_body || val || '—'
  },
  {
    key: 'nsqfid', label: 'NSQF Level',
    render: (val: any, row: any) => row.nsqf?.nsqf_level || val
  },
  {
    key: 'coursedurationid', label: 'Course Duration',
    render: (val: any, row: any) => row.courseDuration?.courseduration || val
  },
  { key: 'is_active', label: 'Status' },
];

const FIELDS = [
  { key: 'stream_branch_name', label: 'Course Name', required: true },
  { key: 'stream_branch_abbreviation', label: 'Abbreviation' },
  {
    key: 'qualificationid', label: 'Qualification', required: true,
    optionsApi: 'qualification', optionsValueKey: 'qualificationid', optionsLabelKey: 'qualification',
  },
  {
    key: 'affiliating_body_id', label: 'Affiliation Body',
    optionsApi: 'affiliation', optionsValueKey: 'affiliating_body_id', optionsLabelKey: 'affiliating_body',
  },
  {
    key: 'nsqfid', label: 'NSQF Level',
    optionsApi: 'master-nsqf', optionsValueKey: 'nsqfid', optionsLabelKey: 'nsqf_level',
  },
  {
    key: 'coursedurationid', label: 'Course Duration',
    optionsApi: 'master-course-duration', optionsValueKey: 'coursedurationid', optionsLabelKey: 'courseduration',
  },
  { key: 'is_active', label: 'Is Active?', type: 'radio' },
];

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  return (
    <>
      <CrudTable title="Courses" apiPath="stream-branch" queryKey="stream-branch" columns={COLUMNS} primaryKey="stream_branch_Id"
        onAdd={() => { setEditData(null); setModalOpen(true); }}
        onEdit={(r) => { setEditData(r); setModalOpen(true); }} />
      {modalOpen && <CrudModal title="Course" apiPath="stream-branch" queryKey="stream-branch" primaryKey="stream_branch_Id" fields={FIELDS} editData={editData} onClose={() => setModalOpen(false)} />}
    </>
  );
}
