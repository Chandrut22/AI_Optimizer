import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

export const loginUser = async (email, password) => {
  const response = await API.post("/auth/login", {
    email,
    password,
  });
  return response.data;
};

export const registerUser = async ({ name, email, password }) => {
  const response = await API.post("/auth/register", {
    name,
    email,
    password,
  });
  return response.data;
};