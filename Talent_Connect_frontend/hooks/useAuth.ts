'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser, TokenPayload } from '@/lib/auth';

// ── Module-level cache so auth state survives re-renders on navigation ────────
// Without this, every pathname change causes AppShell → Sidebar → useAuth
// to re-run, setting loading=true briefly before the useEffect fires,
// causing a visible flicker on the page.
let _cachedUser: TokenPayload | null | undefined = undefined; // undefined = not yet loaded

/** Call this after storing/removing a token so useAuth re-reads localStorage */
export function clearAuthCache() {
    _cachedUser = undefined;
}

export function useAuth() {
    const router = useRouter();

    // If already cached, initialise synchronously (no loading flash)
    const [user, setUser] = useState<TokenPayload | null>(() =>
        _cachedUser !== undefined ? _cachedUser : null
    );
    const [loading, setLoading] = useState(_cachedUser === undefined);

    useEffect(() => {
        if (_cachedUser !== undefined) return; // already loaded
        const payload = getStoredUser();
        _cachedUser = payload;
        setUser(payload);
        setLoading(false);
    }, []);

    const logout = () => {
        _cachedUser = null;
        localStorage.removeItem('tc_token');
        router.push('/login');
    };

    return {
        user,
        loading,
        role: user?.role ?? null,
        isAdmin: user?.role === 'admin',
        isInstitute: user?.role === 'institute',
        isIndustry: user?.role === 'industry',
        logout,
    };
}
