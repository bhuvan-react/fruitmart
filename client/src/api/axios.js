import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Attach JWT to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fm_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Handle 401/403 globally: clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('fm_token');
      localStorage.removeItem('fm_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
