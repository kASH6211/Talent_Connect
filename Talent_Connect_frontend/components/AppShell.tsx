'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/login';

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-base-100">
            <Sidebar />
            <main className="flex-1 ml-[260px] min-h-screen bg-base-100">
                <div className="p-6">{children}</div>
            </main>
        </div>
    );
}
