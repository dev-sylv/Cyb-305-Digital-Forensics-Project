import axios from "axios";

let token: string | null = null;

export const setToken = (t: string | null) => {
  token = t;
};
export const getToken = () => token;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

export default api;
