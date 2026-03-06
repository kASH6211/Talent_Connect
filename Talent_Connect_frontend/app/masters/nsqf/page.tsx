'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

const COLUMNS = [
    {
        "key": "nsqfid",
        "label": "ID"
    },
    {
        "key": "nsqf_level",
        "label": "NSQF Level"
    },
    {
        "key": "is_active",
        "label": "Status"
    }
];

const FIELDS = [
    {
        "key": "nsqf_level",
        "label": "NSQF Level (e.g. 4.5)",
        "type": "number",
        "step": "0.1",
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
                title="NSQF Levels"
                apiPath="master-nsqf"
                queryKey="master-nsqf"
                columns={COLUMNS}
                primaryKey="nsqfid"
                pagination={false}
                onAdd={openAdd}
                onEdit={openEdit}
            />
            {modalOpen && (
                <CrudModal
                    title="NSQF Levels"
                    apiPath="master-nsqf"
                    queryKey="master-nsqf"
                    primaryKey="nsqfid"
                    fields={FIELDS}
                    editData={editData}
                    onClose={onClose}
                />
            )}
        </div>
    );
}
