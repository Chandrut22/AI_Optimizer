import { API } from "@/api/auth.js"; // ✅ Use correct import path for shared axios instance

// Get all users
export const fetchAllUsers = async () => {
  try {
    const response = await API.get("/admin/users");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch users" };
  }
};

// Promote a user to admin
export const promoteUser = async (userId) => {
  try {
    const response = await API.put(`/admin/promote/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to promote user" };
  }
};

// Demote an admin to user
export const demoteUser = async (userId) => {
  try {
    const response = await API.put(`/admin/users/${userId}/demote`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to demote user" };
  }
};

// Ban or unban user
export const toggleBanUser = async (userId) => {
  try {
    const response = await API.put(`/admin/users/${userId}/toggle-ban`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update user status" };
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await API.delete(`/admin/delete/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete user" };
  }
};