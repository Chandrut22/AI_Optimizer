import { API } from "@/api/auth.js"; 
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
    const response = await API.put(`/admin/users/promote/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to promote user" };
  }
};

// Demote an admin to user
export const demoteUser = async (userId) => {
  try {
    const response = await API.put(`/admin/users/depromote/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to demote user" };
  }
};


// Delete user
export const deleteUser = async (userId) => {
  try {
    const response = await API.delete(`/admin/users/delete/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete user" };
  }
};