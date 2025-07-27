import axios from "axios";

const axiosClient = axios.create({
  // baseURL: 'http://localhost:3000', 
  baseURL:'https://bellespots.onrender.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Create custom event to trigger logout
      const event = new CustomEvent('unauthorized');
      window.dispatchEvent(event);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
