import axios from "axios";

const BASE_URL =
  typeof window !== "undefined"
    ? "http://10.147.8.138:3001/api"
    : process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// attach JWT token if exists
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("tc_token");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== "undefined") {
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

export default api;

// Generic CRUD helpers
export const getAll = (path: string) => api.get(path).then((r) => r.data);
export const getOne = (path: string, id: number) =>
  api.get(`${path}/${id}`).then((r) => r.data);
export const createOne = (path: string, data: any) =>
  api.post(path, data).then((r) => r.data);
export const updateOne = (path: string, id: number, data: any) =>
  api.patch(`${path}/${id}`, data).then((r) => r.data);
export const deleteOne = (path: string, id: number) =>
  api.delete(`${path}/${id}`).then((r) => r.data);
