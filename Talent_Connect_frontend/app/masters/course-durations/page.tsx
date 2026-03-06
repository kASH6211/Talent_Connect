'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
    {
        "key": "coursedurationid",
        "label": "ID"
    },
    {
        "key": "courseduration",
        "label": "Course Duration"
    },
    {
        "key": "is_active",
        "label": "Status"
    }
];

const FIELDS = [
    {
        "key": "courseduration",
        "label": "Course Duration (e.g. 1 Year, 6 Months)",
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
        <div className="p-4 sm:p-6 lg:p-8">
            <CrudTable
                title="Course Durations"
                apiPath="master-course-duration"
                queryKey="master-course-duration"
                columns={COLUMNS}
                primaryKey="coursedurationid"
                pagination={false}
                onAdd={openAdd}
                onEdit={openEdit}
            />
            {modalOpen && (
                <CrudModal
                    title="Course Durations"
                    apiPath="master-course-duration"
                    queryKey="master-course-duration"
                    primaryKey="coursedurationid"
                    fields={FIELDS}
                    editData={editData}
                    onClose={onClose}
                />
            )}
        </div>
    );
}
