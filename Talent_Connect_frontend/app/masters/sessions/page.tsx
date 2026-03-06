'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
    {
        "key": "sessionid",
        "label": "ID"
    },
    {
        "key": "session",
        "label": "Session"
    },
    {
        "key": "is_active",
        "label": "Status"
    }
];

const FIELDS = [
    {
        "key": "session",
        "label": "Session (e.g. 2023-2024)",
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
                title="Master Sessions"
                apiPath="master-session"
                queryKey="master-sessions"
                columns={COLUMNS}
                primaryKey="sessionid"
                pagination={false}
                onAdd={openAdd}
                onEdit={openEdit}
            />
            {modalOpen && (
                <CrudModal
                    title="Master Sessions"
                    apiPath="master-session"
                    queryKey="master-sessions"
                    primaryKey="sessionid"
                    fields={FIELDS}
                    editData={editData}
                    onClose={onClose}
                />
            )}
        </div>
    );
}
