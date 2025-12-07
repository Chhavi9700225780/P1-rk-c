import axios from "axios";

const api = axios.create({
  baseURL: "/api", 
  withCredentials: true,
  timeout: 20000, 
});

// Add this retry logic to handle wake-ups automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If it times out, try one more time automatically
    if (error.code === 'ECONNABORTED' && !originalRequest._retry) {
      console.log("Server sleeping? Retrying request...");
      originalRequest._retry = true;
      originalRequest.timeout = 90000; // 90 seconds for retry
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

export default api;