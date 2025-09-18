import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://bellespots.onrender.com',
  // baseURL: 'https://bellespot.onrender.com',
  // baseURL: 'http://localhost:3000',
  withCredentials: true, 
  timeout: 0, 
});

axiosClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default axiosClient;
