// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://p1-rk-c2.onrender.com",
  withCredentials: true,
  timeout: 10000, // Reduced from 120s to 10s. If it sleeps, we want to fail fast and retry.
});

// Add a Response Interceptor to handle retries automatically
api.interceptors.response.use(
  (response) => response, // Return successful responses directly
  async (error) => {
    const originalRequest = error.config;

    // Check if we have retried already or if it's not a timeout/network error
    if (
      originalRequest._retry || 
      (!error.message.includes("timeout") && error.response)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true; // Mark as retried
    
    // Wait 2 seconds (Render takes about 30s-60s to wake up, so we might need a longer loop)
    // But for a simple retry:
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("Retrying request due to timeout...");
    return api(originalRequest); // Retry the request
  }
);

export default api;