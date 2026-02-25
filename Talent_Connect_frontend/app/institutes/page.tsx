'use client';
import { useState } from 'react';
import CrudTable from '@/components/CrudTable';
import CrudModal from '@/components/CrudModal';

import { Upload } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import api from '@/lib/api';

const COLUMNS = [
    { key: 'institute_id', label: 'ID' },
    { key: 'institute_name', label: 'Name' },
    { key: 'address', label: 'Address' },
    { key: 'is_active', label: 'Status' },
];

const FIELDS = [
    { key: 'institute_name', label: 'Institute Name', required: true },
    {
        key: 'institute_type_id', label: 'Institute Type', required: true,
        optionsApi: 'institute-type', optionsValueKey: 'institute_type_id', optionsLabelKey: 'institute_type',
    },
    {
        key: 'institute_sub_type_id', label: 'Institute Sub Type',
        optionsApi: 'institute-sub-type', optionsValueKey: 'institute_sub_type_id', optionsLabelKey: 'institute_sub_type',
    },
    {
        key: 'institute_ownership_type_id', label: 'Ownership Type',
        optionsApi: 'institute-ownership-type', optionsValueKey: 'institute_ownership_type_id', optionsLabelKey: 'institute_type',
    },
    {
        key: 'affiliating_body_id', label: 'Affiliation Body',
        optionsApi: 'affiliation', optionsValueKey: 'affiliating_body_id', optionsLabelKey: 'affiliating_body',
    },
    {
        key: 'regulatory_body_id', label: 'Regulatory Body',
        optionsApi: 'regulatory', optionsValueKey: 'regulatory_body_id', optionsLabelKey: 'regulatory_body',
    },
    {
        key: 'university_board_id', label: 'University / Board',
        optionsApi: 'board', optionsValueKey: 'university_board_id', optionsLabelKey: 'university_board_name',
    },
    {
        key: 'lgdstateId', label: 'State',
        optionsApi: 'state', optionsValueKey: 'lgdstateid', optionsLabelKey: 'statename',
    },
    {
        key: 'lgddistrictId', label: 'District',
        optionsApi: 'district', optionsValueKey: 'lgddistrictId', optionsLabelKey: 'districtname',
    },
    { key: 'pincode', label: 'Pincode', type: 'number' },
    { key: 'address', label: 'Address', type: 'textarea' },
    { key: 'emailId', label: 'Email', type: 'email' },
    { key: 'mobileno', label: 'Mobile No.' },
    { key: 'url', label: 'Website URL' },
    {
        key: 'institute_enrollment_id', label: 'Enrollment Type',
        optionsApi: 'institute-enrollment', optionsValueKey: 'institute_enrollment_id', optionsLabelKey: 'instituteenrollmenttype',
    },
    {
        key: 'training_type_id', label: 'Training Type',
        optionsApi: 'training-type', optionsValueKey: 'training_type_id', optionsLabelKey: 'training_type',
    },
    { key: 'is_active', label: 'Is Active?', type: 'radio' },
];

function ExcelUploadButton() {
    const qc = useQueryClient();
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post(`institute/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                responseType: 'arraybuffer' // Ensure we can read the binary data if an error Excel comes back
            });

            // If success, response won't have the attachment disposition usually, it will just be JSON
            // But since responseType is arraybuffer, we have to parse the JSON manually if it's text
            let isJson = false;
            let resData: any = {};
            try {
                const text = new TextDecoder().decode(res.data);
                resData = JSON.parse(text);
                isJson = true;
            } catch (err) {
                isJson = false;
            }

            if (isJson) {
                alert(resData.message || 'Institutes imported successfully!');
            } else {
                // It returned a file (error)
                const message = decodeURIComponent(res.headers['x-import-message'] || 'Some rows failed to import.');
                alert(message + ' Downloading error report...');

                const blob = new Blob([res.data], { type: res.headers['content-type'] });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const filenameMatch = res.headers['content-disposition']?.match(/filename="?([^"]+)"?/);
                a.download = filenameMatch ? filenameMatch[1] : 'ImportErrors.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            }

            qc.invalidateQueries({ queryKey: ['institute'] });
        } catch (error: any) {
            console.error('Upload Error:', error);

            // If the error response itself is a buffer, try parsing it as JSON to show the error
            let errMsg = 'Failed to upload Excel file.';
            if (error.response?.data) {
                try {
                    const text = new TextDecoder().decode(error.response.data);
                    const eJson = JSON.parse(text);
                    errMsg = eJson.error || eJson.message || errMsg;
                } catch (e) {
                    // ignore
                }
            }
            alert(errMsg);
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset file input
        }
    };

    return (
        <div className="relative">
            <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                disabled={uploading}
                title="Upload Excel Database"
            />
            <button className="btn btn-secondary btn-sm gap-2" disabled={uploading}>
                {uploading ? (
                    <span className="loading loading-spinner loading-xs"></span>
                ) : (
                    <Upload size={16} />
                )}
                <span className="hidden sm:inline">{uploading ? 'Uploading...' : 'Upload Excel'}</span>
            </button>
        </div>
    );
}

export default function Page() {
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);
    return (
        <>
            <CrudTable title="Institutes" apiPath="institute" queryKey="institute" columns={COLUMNS} primaryKey="institute_id"
                extraActions={<ExcelUploadButton />}
                onAdd={() => { setEditData(null); setModalOpen(true); }}
                onEdit={(r) => { setEditData(r); setModalOpen(true); }} />
            {modalOpen && <CrudModal title="Institute" apiPath="institute" queryKey="institute" primaryKey="institute_id" fields={FIELDS} editData={editData} onClose={() => setModalOpen(false)} />}
        </>
    );
}
