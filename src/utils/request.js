import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/';
export const request = axios.create({
  baseURL,
  timeout: 1 * 60 * 1000,
});
