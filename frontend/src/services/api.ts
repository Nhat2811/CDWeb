import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (message === 'Invalid credentials') return 'Email hoặc mật khẩu không đúng.';
    return Array.isArray(message) ? message.join(', ') : message ?? error.message;
  }
  return error instanceof Error ? error.message : 'Unexpected error';
}
