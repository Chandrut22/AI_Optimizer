import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true, // needed if your Spring Boot uses cookies for auth
});

export default API;
