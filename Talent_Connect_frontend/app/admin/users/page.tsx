'use client';

import CrudTable from '@/components/CrudTable';
import { Users, Shield, CheckCircle, XCircle } from 'lucide-react';

const COLUMNS = [
    { key: 'sn', label: 'S.No', render: (_: any, __: any, i: number) => i },
    { key: 'id', label: 'ID' },
    { key: 'username', label: 'Username', wrap: true },
    { key: 'email', label: 'Email', wrap: true },
    {
        key: 'role',
        label: 'Role',
        render: (role: string) => (
            <div className="flex items-center gap-1.5">
                <Shield size={14} className="text-primary/60" />
                <span className="capitalize font-medium">{role.replace('_', ' ')}</span>
            </div>
        )
    },
    {
        key: 'is_active',
        label: 'Status',
        render: (status: string) => (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${status === 'Y' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                {status === 'Y' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                {status === 'Y' ? 'Active' : 'Inactive'}
            </div>
        )
    },
    {
        key: 'created_date',
        label: 'Created At',
        render: (date: string) => date ? new Date(date).toLocaleDateString() : '—'
    },
];

export default function UsersPage() {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <CrudTable
                title="User Management"
                icon={<Users size={24} />}
                apiPath="users"
                queryKey="users"
                columns={COLUMNS}
                primaryKey="id"
                pagination={false} // Local array response
                onAdd={() => alert('User registration is handled via Auth/SSO or Institute Import.')}
                onEdit={() => alert('User editing feature is coming soon.')}
            />
        </div>
    );
}
