// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL:"http://54.160.180.195:5000" ,
  withCredentials: true,
  timeout: 15000,
});

export default api;
