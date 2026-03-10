// ============================================================
//  API SERVICE
//  File: src/services/api.js
//  Handles all backend communication
// ============================================================

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost/backend/api/",
});

// Fetch full profile data for a user
export const getProfile = (userId) => {
  return API.get(`profile.php?user_id=${userId}`);
};

// Fetch current user data for edit form (includes domains dropdown)
export const getEditProfile = (userId) => {
  return API.get(`edit_profile.php?user_id=${userId}`);
};

// Save updated profile data
export const updateProfile = (data) => {
  return API.post(`edit_profile.php`, data);
};
