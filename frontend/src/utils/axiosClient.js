import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? 'https://bellespot.onrender.com' : 'http://localhost:3000',
  
  withCredentials: true, 
  timeout: 10000,
});

axiosClient.interceptors.request.use(
  (config) => {
    console.log('Axios request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      cookies: document.cookie, 
    });
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