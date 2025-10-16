import axios from "axios";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL ||"http://localhost:5000";
axios.defaults.withCredentials = true; // important to send/receive cookies
export default axios;
