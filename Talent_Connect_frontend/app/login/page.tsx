'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { clearAuthCache } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components2/ThemeToggle';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/auth/login', { username, password });
            localStorage.setItem('tc_token', res.data.access_token);
            clearAuthCache();
            router.push('/');
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-base-100 to-secondary/5 flex items-center justify-center p-4">
            {/* Theme toggle in top-right corner */}
            <div className="fixed top-4 right-4">
                <ThemeToggle />
            </div>

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-xl shadow-primary/20 mb-4">
                        <GraduationCap size={32} className="text-primary-content" />
                    </div>
                    <h1 className="text-2xl font-bold text-base-content">Talent Connect</h1>
                    <p className="text-base-content/50 text-sm mt-1">Placement Portal — Sign in to continue</p>
                </div>

                {/* Card */}
                <div className="bg-base-200 border border-base-300 rounded-2xl shadow-2xl p-8">
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-1.5">
                                Username
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="admin"
                                required
                                autoFocus
                                className="input input-bordered w-full rounded-xl text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-base-content/60 uppercase tracking-wider mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="input input-bordered w-full rounded-xl text-sm"
                            />
                        </div>

                        {error && (
                            <div className="alert alert-error text-sm py-2.5">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full rounded-xl gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            {loading ? 'Signing in…' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 p-3 bg-base-300 rounded-xl text-xs text-base-content/50 space-y-1">
                        <p className="font-semibold text-base-content/70 mb-2">Demo Credentials:</p>
                        <p>👤 Admin: <span className="font-mono text-base-content/80">admin / admin123</span></p>
                        <p>🏫 Institute: <span className="font-mono text-base-content/80">institute_pit / institute123</span></p>
                        <p>🏢 Industry: <span className="font-mono text-base-content/80">industry_ts / industry123</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
