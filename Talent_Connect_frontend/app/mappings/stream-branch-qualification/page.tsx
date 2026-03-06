"use client";
import { useState } from "react";
import CrudTable from "@/components/CrudTable";
import CrudModal from "@/components/CrudModal";
import { useAuth } from "@/lib/AuthProvider";

export default function Page() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const COLUMNS = [
    { key: "stream_branch_qualification_id", label: "ID" },
    {
      key: "qualificationid",
      label: "Qualification",
      render: (val: any, row: any) => row.qualification?.qualification || val,
    },
    {
      key: "stream_branch_Id",
      label: "Course",
      render: (val: any, row: any) =>
        row.streamBranch?.stream_branch_name || val,
    },
    {
      key: "affiliating_body_id",
      label: "Affiliation Body",
      render: (_: any, row: any) =>
        row.streamBranch?.affiliation?.affiliating_body || "—",
    },
    {
      key: "nsqfid",
      label: "NSQF Level",
      render: (_: any, row: any) =>
        row.streamBranch?.nsqf?.nsqf_level || "—",
    },
    {
      key: "coursedurationid",
      label: "Course Duration",
      render: (_: any, row: any) =>
        row.streamBranch?.courseDuration?.courseduration || "—",
    },
    { key: "is_active", label: "Status" },
  ];

  const FIELDS = [
    {
      key: "qualificationid",
      label: "Qualification",
      required: true,
      optionsApi: "qualification",
      optionsValueKey: "qualificationid",
      optionsLabelKey: "qualification",
    },
    {
      key: "stream_branch_Id",
      label: "Course",
      required: true,
      optionsApi: "stream-branch",
      optionsValueKey: "stream_branch_Id",
      optionsLabelKey: "stream_branch_name",
      dependsOn: "qualificationid",
      dependsOnQueryKey: "qualification_id",
    },
    { key: "is_active", label: "Is Active?", type: "radio" },
  ];

  return (
    <>
      <CrudTable
        title="Qualification ↔ Course Mapping"
        apiPath="stream-branch-qualification-mapping"
        queryKey="stream-branch-qualification-mapping"
        columns={COLUMNS}
        primaryKey="stream_branch_qualification_id"
        onAdd={() => {
          setEditData(null);
          setModalOpen(true);
        }}
        onEdit={(r) => {
          setEditData(r);
          setModalOpen(true);
        }}
      />
      {modalOpen && (
        <CrudModal
          title="Qualification-Course Mapping"
          apiPath="stream-branch-qualification-mapping"
          queryKey="stream-branch-qualification-mapping"
          primaryKey="stream_branch_qualification_id"
          fields={FIELDS}
          editData={editData}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
