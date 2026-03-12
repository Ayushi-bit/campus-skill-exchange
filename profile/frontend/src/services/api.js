// ============================================================
//  API SERVICE
//  File: src/services/api.js
// ============================================================

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost/backend/api/",
});

export const getProfile     = (userId) => API.get(`profile.php?user_id=${userId}`);
export const getEditProfile = (userId) => API.get(`edit_profile.php?user_id=${userId}`);
export const updateProfile  = (data)   => API.post(`edit_profile.php`, data);
export const getDashboard   = (userId) => API.get(`dashboard.php?user_id=${userId}`);
