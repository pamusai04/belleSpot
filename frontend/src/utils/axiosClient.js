import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://bellespot.onrender.com',
  // baseURL : 'http://localhost:3000',
  withCredentials: true, 
  timeout: 10000,
});

axiosClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;