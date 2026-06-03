import axios from "axios";

const API = axios.create({
  baseURL: "https://taskmanagementsystem-production-9ab1.up.railway.app",
});

export default API;