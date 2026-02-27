"use client";
import { useState } from "react";
import CrudTable from "@/components/CrudTable";
import CrudModal from "@/components/CrudModal";
import { Building2 } from "lucide-react";
import JobDetailModal from "@/views/sent-offer/view/JobDetailModal";

const COLUMNS = [
  { key: "industry_request_id", label: "ID" },
  { key: "industryId", label: "Industry ID" },
  { key: "instituteId", label: "Institute ID" },
  { key: "request_type_id", label: "Request Type" },
  { key: "request_status_id", label: "Status" },
  { key: "is_active", label: "Active" },
];

const FIELDS = [
  {
    key: "industryId",
    label: "Company (Industry)",
    required: true,
    optionsApi: "industry",
    optionsValueKey: "industryId",
    optionsLabelKey: "industryname",
  },
  {
    key: "instituteId",
    label: "Institute",
    required: true,
    optionsApi: "institute",
    optionsValueKey: "instituteId",
    optionsLabelKey: "institutename",
  },
  {
    key: "request_type_id",
    label: "Request Type",
    required: true,
    optionsApi: "request-type",
    optionsValueKey: "request_type_id",
    optionsLabelKey: "request_type",
  },
  {
    key: "request_status_id",
    label: "Request Status",
    optionsApi: "request-status",
    optionsValueKey: "request_status_id",
    optionsLabelKey: "request_status",
  },
  {
    key: "programId",
    label: "Program",
    optionsApi: "program",
    optionsValueKey: "programId",
    optionsLabelKey: "program_name",
  },
  {
    key: "stream_branch_Id",
    label: "Stream / Branch",
    optionsApi: "stream-branch",
    optionsValueKey: "stream_branch_Id",
    optionsLabelKey: "stream_branch_name",
  },
  { key: "request_date", label: "Request Date", type: "date" },
  { key: "vacancies", label: "No. of Vacancies", type: "number" },
  { key: "request_description", label: "Description", type: "textarea" },
  { key: "is_active", label: "Is Active?", type: "radio" },
];

const dummyJob = {
  id: "101",
  title: "React Developer",
  company: "Nekasu Technologies",
  description:
    "We are hiring a React developer to build scalable web applications using Next.js and modern UI practices.",
  salary: "₹8,00,000 - ₹12,00,000",
  location: "Chandigarh (Hybrid)",
  type: "Full-time",
  department: "Engineering",
  postedDate: "1 day ago",
  applicants: 12,
  requirements: [
    "Strong React fundamentals",
    "Experience with Next.js",
    "Redux or Zustand knowledge",
    "API integration experience",
  ],
  benefits: [
    "Flexible work hours",
    "Performance bonus",
    "Learning budget",
    "Remote flexibility",
  ],
};

export default function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  //dummydata for modal
  const [open, setOpen] = useState(true);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Table Section */}
      <div className="max-w-7xl mx-auto">
        <CrudTable
          title="Industry Requests"
          icon={<Building2 />}
          apiPath="industry-request"
          queryKey="industry-request"
          columns={COLUMNS}
          primaryKey="industry_request_id"
          onAdd={() => {
            setEditData(null);
            setModalOpen(true);
          }}
          onEdit={(r) => {
            setEditData(r);
            setModalOpen(true);
          }}
        />
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4 sm:px-6 lg:px-8 overflow-auto">
          <CrudModal
            title="Industry Request"
            apiPath="industry-request"
            queryKey="industry-request"
            primaryKey="industry_request_id"
            fields={FIELDS}
            editData={editData}
            onClose={() => setModalOpen(false)}
          />
        </div>
      )}
      {/* <JobDetailModal
        open={true}
        setOpen={setOpen}
        job={dummyJob}
      /> */}
    </div>
  );
}
