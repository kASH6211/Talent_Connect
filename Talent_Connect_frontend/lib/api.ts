import axios from 'axios';

// In the browser, use relative /api path so Next.js rewrites proxy to the backend.
// In server-side rendering, use the full backend URL.
const BASE_URL =
    typeof window !== 'undefined'
        ? '/api'
        : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api');

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT token ──────────────────────────────────
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('tc_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }
    return config;
});

// ── Response interceptor: redirect to /login on 401 ───────────────────────
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err?.response?.status === 401 && typeof window !== 'undefined') {
            if (!window.location.pathname.startsWith('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(err);
    },
);

export default api;

// Generic CRUD helpers
export const getAll = (path: string) => api.get(path).then(r => r.data);
export const getOne = (path: string, id: number) => api.get(`${path}/${id}`).then(r => r.data);
export const createOne = (path: string, data: any) => api.post(path, data).then(r => r.data);
export const updateOne = (path: string, id: number, data: any) => api.patch(`${path}/${id}`, data).then(r => r.data);
export const deleteOne = (path: string, id: number) => api.delete(`${path}/${id}`).then(r => r.data);
