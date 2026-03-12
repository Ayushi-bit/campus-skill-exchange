// ============================================================
//  API SERVICE
//  File: src/services/api.js
// ============================================================

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost/backend/api/",
});

// ── Existing ──────────────────────────────────────────────
export const getProfile     = (userId) => API.get(`profile.php?user_id=${userId}`);
export const getEditProfile = (userId) => API.get(`edit_profile.php?user_id=${userId}`);
export const updateProfile  = (data)   => API.post(`edit_profile.php`, data);
export const getDashboard   = (userId) => API.get(`dashboard.php?user_id=${userId}`);

// ── New: Project Detail & Apply ───────────────────────────
export const getProjectDetails = (projectId, userId) =>
  API.get(`project_details.php?project_id=${projectId}&user_id=${userId}`);

export const applyToProject = (data) => API.post(`apply.php`, data);
