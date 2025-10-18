// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_RENDER_URL ,
  withCredentials: true,
   timeout: 60000, 
});

export default api;
