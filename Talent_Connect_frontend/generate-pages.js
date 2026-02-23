const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'app');

// Simple master pages config
const masterPages = [
    {
        route: 'masters/boards',
        title: 'Boards & Universities',
        apiPath: 'board',
        queryKey: 'boards',
        primaryKey: 'university_board_id',
        columns: [
            { key: 'university_board_id', label: 'ID' },
            { key: 'university_board_name', label: 'Name' },
            { key: 'university_board_abbreviation', label: 'Abbreviation' },
            { key: 'phoneno', label: 'Phone' },
            { key: 'emailId', label: 'Email' },
            { key: 'is_active', label: 'Status' },
        ],
        fields: [
            { key: 'university_board_name', label: 'Board/University Name', required: true },
            { key: 'university_board_abbreviation', label: 'Abbreviation' },
            { key: 'address', label: 'Address', type: 'textarea' },
            { key: 'phoneno', label: 'Phone Number' },
            { key: 'emailId', label: 'Email Id' },
            { key: 'is_active', label: 'Is Active?', type: 'radio' },
        ],
    },
    {
        route: 'masters/states',
        title: 'States',
        apiPath: 'state',
        queryKey: 'states',
        primaryKey: 'stateid',
        columns: [
            { key: 'stateid', label: 'ID' },
            { key: 'statename', label: 'Name' },
            { key: 'lgdstateid', label: 'LGD Code' },
            { key: 'is_active', label: 'Status' },
        ],
        fields: [
            { key: 'statename', label: 'State Name', required: true },
            { key: 'lgdstateid', label: 'LGD State Code', type: 'number', required: true },
            { key: 'is_active', label: 'Is Active?', type: 'radio' },
        ],
    },
    {
        route: 'masters/districts',
        title: 'Districts',
        apiPath: 'district',
        queryKey: 'districts',
        primaryKey: 'districtid',
        columns: [
            { key: 'districtid', label: 'ID' },
            { key: 'districtname', label: 'Name' },
            { key: 'lgdstateid', label: 'LGD State Code' },
            { key: 'lgddistrictId', label: 'LGD District Code' },
            { key: 'is_active', label: 'Status' },
        ],
        fields: [
            { key: 'districtname', label: 'District Name', required: true },
            { key: 'lgdstateid', label: 'LGD State Code', type: 'number', required: true },
            { key: 'lgddistrictId', label: 'LGD District Code', type: 'number', required: true },
            { key: 'is_active', label: 'Is Active?', type: 'radio' },
        ],
    },
    {
        route: 'masters/qualifications',
        title: 'Qualifications',
        apiPath: 'qualification',
        queryKey: 'qualifications',
        primaryKey: 'qualificationid',
        columns: [
            { key: 'qualificationid', label: 'ID' },
            { key: 'qualification', label: 'Qualification' },
            { key: 'is_active', label: 'Status' },
        ],
        fields: [
            { key: 'qualification', label: 'Qualification Name', required: true },
            { key: 'is_active', label: 'Is Active?', type: 'radio' },
        ],
    },
    {
        route: 'masters/programs',
        title: 'Programs',
        apiPath: 'program',
        queryKey: 'programs',
        primaryKey: 'programId',
        columns: [
            { key: 'programId', label: 'ID' },
            { key: 'program_name', label: 'Program Name' },
            { key: 'program_abbreviation', label: 'Abbreviation' },
            { key: 'is_active', label: 'Status' },
        ],
        fields: [
            { key: 'program_name', label: 'Program Name', required: true },
            { key: 'program_abbreviation', label: 'Abbreviation' },
            { key: 'is_active', label: 'Is Active?', type: 'radio' },
        ],
    },
    {
        route: 'masters/stream-branches',
        title: 'Streams & Branches',
        apiPath: 'stream-branch',
        queryKey: 'stream-branches',
        primaryKey: 'stream_branch_Id',
        columns: [
            { key: 'stream_branch_Id', label: 'ID' },
            { key: 'stream_branch_name', label: 'Name' },
            { key: 'stream_branch_abbreviation', label: 'Abbreviation' },
            { key: 'programId', label: 'Program ID' },
            { key: 'is_active', label: 'Status' },
        ],
        fields: [
            { key: 'stream_branch_name', label: 'Stream/Branch Name', required: true },
            { key: 'stream_branch_abbreviation', label: 'Abbreviation' },
            { key: 'programId', label: 'Program ID', type: 'number', required: true },
            { key: 'affiliating_body_id', label: 'Affiliating Body ID', type: 'number' },
            { key: 'is_active', label: 'Is Active?', type: 'radio' },
        ],
    },
    {
        route: 'masters/job-roles',
        title: 'Job Roles',
        apiPath: 'job-role',
        queryKey: 'job-roles',
        primaryKey: 'jobrole_id',
        columns: [
            { key: 'jobrole_id', label: 'ID' },
            { key: 'jobrole', label: 'Job Role' },
            { key: 'is_active', label: 'Status' },
        ],
        fields: [
            { key: 'jobrole', label: 'Job Role Name', required: true },
            { key: 'jobdescription', label: 'Job Description', type: 'textarea' },
            { key: 'is_active', label: 'Is Active?', type: 'radio' },
        ],
    },
    {
        route: 'masters/institute-types',
        title: 'Institute Types',
        apiPath: 'institute-type',
        queryKey: 'institute-types',
        primaryKey: 'institute_type_id',
        columns: [
            { key: 'institute_type_id', label: 'ID' },
            { key: 'institute_type', label: 'Type' },
            { key: 'institute_abbreviation', label: 'Abbreviation' },
            { key: 'is_active', label: 'Status' },
        ],
        fields: [
            { key: 'institute_type', label: 'Institute Type', required: true },
            { key: 'institute_abbreviation', label: 'Abbreviation' },
            { key: 'is_active', label: 'Is Active?', type: 'radio' },
        ],
    },
    {
        route: 'masters/institute-sub-types',
        title: 'Institute Sub Types',
        apiPath: 'institute-sub-type',
        queryKey: 'institute-sub-types',
        primaryKey: 'institute_sub_type_id',
        columns: [
            { key: 'institute_sub_type_id', label: 'ID' },
            { key: 'institute_sub_type', label: 'Sub Type' },
            { key: 'institute_type_id', label: 'Type ID' },
            { key: 'is_active', label: 'Status' },
        ],
        fields: [
            { key: 'institute_type_id', label: 'Institute Type ID', type: 'number', required: true },
            { key: 'institute_sub_type', label: 'Institute Sub Type', required: true },
            { key: 'institute_sub_abbreviation', label: 'Abbreviation' },
            { key: 'is_active', label: 'Is Active?', type: 'radio' },
        ],
    },
    {
        route: 'masters/institute-ownership-types',
        title: 'Institute Ownership Types',
        apiPath: 'institute-ownership-type',
        queryKey: 'institute-ownership-types',
        primaryKey: 'institute_ownership_type_id',
        columns: [
            { key: 'institute_ownership_type_id', label: 'ID' },
            { key: 'institute_type', label: 'Ownership Type' },
            { key: 'institute_type_abbreviation', label: 'Abbreviation' },
            { key: 'is_active', label: 'Status' },
        ],
        fields: [
            { key: 'institute_type', label: 'Ownership Type', required: true },
            { key: 'institute_type_abbreviation', label: 'Abbreviation' },
            { key: 'is_active', label: 'Is Active?', type: 'radio' },
        ],
    },
    {
        route: 'masters/affiliations',
        title: 'Affiliating Bodies',
        apiPath: 'affiliation',
        queryKey: 'affiliations',
        primaryKey: 'affiliating_body_id',
        columns: [
            { key: 'affiliating_body_id', label: 'ID' },
            { key: 'affiliating_body', label: 'Affiliating Body' },
            { key: 'affiliating_body_abbreviation', label: 'Abbreviation' },
            { key: 'is_active', label: 'Status' },
        ],
        fields: [
            { key: 'affiliating_body', label: 'Affiliating Body Name', required: true },
            { key: 'affiliating_body_abbreviation', label: 'Abbreviation' },
            { key: 'is_active', label: 'Is Active?', type: 'radio' },
        ],
    },
    {
        route: 'masters/regulatory',
        title: 'Regulatory Bodies',
        apiPath: 'regulatory',
        queryKey: 'regulatory',
        primaryKey: 'regulatory_body_id',
        columns: [
            { key: 'regulatory_body_id', label: 'ID' },
            { key: 'regulatory_body', label: 'Regulatory Body' },
            { key: 'regulatory_body_abbreviation', label: 'Abbreviation' },
            { key: 'is_active', label: 'Status' },
        ],
        fields: [
            { key: 'regulatory_body', label: 'Regulatory Body Name', required: true },
            { key: 'regulatory_body_abbreviation', label: 'Abbreviation' },
            { key: 'is_active', label: 'Is Active?', type: 'radio' },
        ],
    },
    {
        route: 'masters/training-types',
        title: 'Training Types',
        apiPath: 'training-type',
        queryKey: 'training-types',
        primaryKey: 'training_type_id',
        columns: [
            { key: 'training_type_id', label: 'ID' },
            { key: 'training_type', label: 'Training Type' },
            { key: 'is_active', label: 'Status' },
        ],
        fields: [
            { key: 'training_type', label: 'Training Type', required: true },
            { key: 'is_active', label: 'Is Active?', type: 'radio' },
        ],
    },
    {
        route: 'masters/institute-enrollments',
        title: 'Institute Enrollment Types',
        apiPath: 'institute-enrollment',
        queryKey: 'institute-enrollments',
        primaryKey: 'institute_enrollment_id',
        columns: [
            { key: 'institute_enrollment_id', label: 'ID' },
            { key: 'instituteenrollmenttype', label: 'Enrollment Type' },
            { key: 'is_active', label: 'Status' },
        ],
        fields: [
            { key: 'instituteenrollmenttype', label: 'Enrollment Type', required: true },
            { key: 'is_active', label: 'Is Active?', type: 'radio' },
        ],
    },
    {
        route: 'masters/legal-entities',
        title: 'Legal Entity Types',
        apiPath: 'legal-entity',
        queryKey: 'legal-entities',
        primaryKey: 'legal_entity_type_id',
        columns: [
            { key: 'legal_entity_type_id', label: 'ID' },
            { key: 'legal_entity_type', label: 'Legal Entity Type' },
            { key: 'legal_entity_type_abbreviation', label: 'Abbreviation' },
            { key: 'is_active', label: 'Status' },
        ],
        fields: [
            { key: 'legal_entity_type', label: 'Legal Entity Type', required: true },
            { key: 'legal_entity_type_abbreviation', label: 'Abbreviation' },
            { key: 'is_active', label: 'Is Active?', type: 'radio' },
        ],
    },
    {
        route: 'masters/industry-sectors',
        title: 'Industry Sectors',
        apiPath: 'industry-sector',
        queryKey: 'industry-sectors',
        primaryKey: 'industry_sector_id',
        columns: [
            { key: 'industry_sector_id', label: 'ID' },
            { key: 'industry_sector_type', label: 'Sector Type' },
            { key: 'industry_sector_type_abbreviation', label: 'Abbreviation' },
            { key: 'is_active', label: 'Status' },
        ],
        fields: [
            { key: 'industry_sector_type', label: 'Industry Sector Type', required: true },
            { key: 'industry_sector_type_abbreviation', label: 'Abbreviation' },
            { key: 'is_active', label: 'Is Active?', type: 'radio' },
        ],
    },
    {
        route: 'masters/industry-scales',
        title: 'Industry Scales',
        apiPath: 'industry-scale',
        queryKey: 'industry-scales',
        primaryKey: 'industry_scale_id',
        columns: [
            { key: 'industry_scale_id', label: 'ID' },
            { key: 'industry_scale', label: 'Scale' },
            { key: 'industry_scale_abbreviation', label: 'Abbreviation' },
            { key: 'is_active', label: 'Status' },
        ],
        fields: [
            { key: 'industry_scale', label: 'Industry Scale', required: true },
            { key: 'industry_scale_abbreviation', label: 'Abbreviation' },
            { key: 'is_active', label: 'Is Active?', type: 'radio' },
        ],
    },
    {
        route: 'masters/identifier-types',
        title: 'Identifier Types',
        apiPath: 'identifier-type',
        queryKey: 'identifier-types',
        primaryKey: 'identifier_type_id',
        columns: [
            { key: 'identifier_type_id', label: 'ID' },
            { key: 'identifier_type', label: 'Identifier Type' },
            { key: 'identifier_type_abbreviation', label: 'Abbreviation' },
            { key: 'is_active', label: 'Status' },
        ],
        fields: [
            { key: 'identifier_type', label: 'Identifier Type' },
            { key: 'identifier_type_abbreviation', label: 'Abbreviation (GSTIN/CIN/PAN/MSME)' },
            { key: 'is_active', label: 'Is Active?', type: 'radio' },
        ],
    },
    {
        route: 'masters/request-types',
        title: 'Request Types',
        apiPath: 'request-type',
        queryKey: 'request-types',
        primaryKey: 'request_type_id',
        columns: [
            { key: 'request_type_id', label: 'ID' },
            { key: 'request_type', label: 'Request Type' },
            { key: 'is_active', label: 'Status' },
        ],
        fields: [
            { key: 'request_type', label: 'Request Type', required: true },
            { key: 'is_active', label: 'Is Active?', type: 'radio' },
        ],
    },
    {
        route: 'masters/request-statuses',
        title: 'Request Statuses',
        apiPath: 'request-status',
        queryKey: 'request-statuses',
        primaryKey: 'request_status_id',
        columns: [
            { key: 'request_status_id', label: 'ID' },
            { key: 'request_status', label: 'Status' },
            { key: 'is_active', label: 'Status' },
        ],
        fields: [
            { key: 'request_status', label: 'Request Status', required: true },
            { key: 'is_active', label: 'Is Active?', type: 'radio' },
        ],
    },
];

function generatePageContent(pg) {
    return `'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = ${JSON.stringify(pg.columns, null, 2)};
const FIELDS = ${JSON.stringify(pg.fields, null, 2)};

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const openAdd = () => { setEditData(null); setModalOpen(true); };
  const openEdit = (row: any) => { setEditData(row); setModalOpen(true); };
  const onClose = () => setModalOpen(false);

  return (
    <>
      <CrudTable
        title="${pg.title}"
        apiPath="${pg.apiPath}"
        queryKey="${pg.queryKey}"
        columns={COLUMNS}
        primaryKey="${pg.primaryKey}"
        onAdd={openAdd}
        onEdit={openEdit}
      />
      {modalOpen && (
        <CrudModal
          title="${pg.title}"
          apiPath="${pg.apiPath}"
          queryKey="${pg.queryKey}"
          primaryKey="${pg.primaryKey}"
          fields={FIELDS}
          editData={editData}
          onClose={onClose}
        />
      )}
    </>
  );
}
`;
}

for (const pg of masterPages) {
    const dir = path.join(appDir, ...pg.route.split('/'));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'page.tsx'), generatePageContent(pg), 'utf8');
    console.log(`Generated page: ${pg.route}`);
}

console.log('\nAll pages generated!');
