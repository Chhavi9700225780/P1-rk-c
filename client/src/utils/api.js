// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL:"process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL",

  //  process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_API_URL || process.env.REACT_APP_RENDER_URL ,
  withCredentials: true,
   timeout: 120000, 
});
async function requestWithRetry(config, retries = 3, delayMs = 2000) {
  for (let i = 0; i <= retries; i++) {
    try {
      return await api(config);
    } catch (err) {
      const isTimeout = err.code === "ECONNABORTED" || err.message?.includes("timeout");
      const isNetwork = !err.response;
      if (i === retries || (!isTimeout && !isNetwork)) throw err;
      // exponential backoff
      await new Promise((r) => setTimeout(r, delayMs * Math.pow(2, i)));
    }
  }
}

export { api, requestWithRetry };
export default api;


