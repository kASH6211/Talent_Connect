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
    { key: "sn", label: "S.No", render: (_: any, __: any, i: number) => i },
    { key: "institute_qualification_id", label: "ID" },
    ...(user?.role !== "institute"
      ? [
        {
          key: "instituteId",
          label: "Institute",
          render: (val: any, row: any) => (
            <div className="max-w-[200px] truncate" title={row.institute?.institute_name || val}>
              {row.institute?.institute_name || val}
            </div>
          ),
        },
      ]
      : []),
    {
      key: "qualificationid",
      label: "Qualification",
      render: (val: any, row: any) => row.qualification?.qualification || val,
    },
    {
      key: "stream_branch_Id",
      label: "Course",
      render: (val: any, row: any) => (
        <div className="max-w-[180px] truncate" title={row.streamBranch?.stream_branch_name || val}>
          {row.streamBranch?.stream_branch_name || val || "—"}
        </div>
      ),
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
    ...(user?.role !== "institute"
      ? [
        {
          key: "instituteId",
          label: "Institute",
          required: true,
          optionsApi: "institute",
          optionsValueKey: "institute_id",
          optionsLabelKey: "institute_name",
        },
      ]
      : []),
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
      optionsApi: "stream-branch",
      optionsValueKey: "stream_branch_Id",
      optionsLabelKey: "full_name",
      dependsOn: "qualificationid",
      dependsOnQueryKey: "qualification_id",
    },
    { key: "is_active", label: "Is Active?", type: "radio" },
  ];

  return (
    <>
      <CrudTable
        title="Institute ↔ Qualification Mapping"
        apiPath="institute-qualification-mapping"
        queryKey="institute-qualification-mapping"
        columns={COLUMNS}
        primaryKey="institute_qualification_id"
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
          title="Institute-Qualification Mapping"
          apiPath="institute-qualification-mapping"
          queryKey="institute-qualification-mapping"
          primaryKey="institute_qualification_id"
          fields={FIELDS}
          editData={editData}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
