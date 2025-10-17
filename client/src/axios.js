import axios from "axios";

axios.defaults.baseURL = process.env.REACT_APP_API_URL || process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_RENDER_URL;
axios.defaults.withCredentials = true; // important to send/receive cookies
export default axios;
