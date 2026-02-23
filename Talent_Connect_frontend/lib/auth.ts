/**
 * Client-side JWT utilities (no verification — payload reading only)
 */

export interface TokenPayload {
    sub: number;
    username: string;
    role: 'admin' | 'institute' | 'industry' | string;
    institute_id?: number | null;
    industry_id?: number | null;
    iat?: number;
    exp?: number;
}

export function decodeToken(token: string): TokenPayload | null {
    try {
        const payload = token.split('.')[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded) as TokenPayload;
    } catch {
        return null;
    }
}

export function isTokenExpired(payload: TokenPayload): boolean {
    if (!payload.exp) return false;
    return Date.now() / 1000 > payload.exp;
}

export function getStoredUser(): TokenPayload | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('tc_token');
    if (!token) return null;
    const payload = decodeToken(token);
    if (!payload || isTokenExpired(payload)) {
        localStorage.removeItem('tc_token');
        return null;
    }
    return payload;
}
