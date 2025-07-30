import axios from "axios"; 

const isBrowser = typeof window !== 'undefined'; 

const axiosClient = axios.create({
  baseURL: isBrowser ? 'https://bellespots.onrender.com' : 'http://localhost:3000',
  connectToDevTools: isBrowser,
  ssrMode: !isBrowser,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      const event = new CustomEvent('unauthorized');
      window.dispatchEvent(event);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
