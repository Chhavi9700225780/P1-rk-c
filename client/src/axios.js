import axios from "axios";

axios.defaults.baseURL = "http://54.160.180.195:5000";
axios.defaults.withCredentials = true; // important to send/receive cookies
export default axios;
