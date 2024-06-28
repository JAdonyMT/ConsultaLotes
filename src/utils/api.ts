// api.ts
import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_FACTURED,
  timeout: 12000,
});

export default api;
