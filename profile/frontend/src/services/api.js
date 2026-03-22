import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost/Campus-Skill-Exchange-Platform/profile/backend/api/",
  withCredentials: true,
});

export const getSession     = ()     => API.get('session.php');
export const logout         = ()     => API.get('logout_api.php');
export const deleteAccount  = (data) => API.post('delete_account.php', data);
export const changePassword = (data) => API.post('change_password.php', data);
export const getProfile     = (userId) => API.get(`profile.php?user_id=${userId}`);
export const getEditProfile = (userId) => API.get(`edit_profile.php?user_id=${userId}`);
export const updateProfile  = (data)   => API.post('edit_profile.php', data);
export const sendEmailOtp   = (data)   => API.post('edit_profile.php', { ...data, action: 'send_otp' });
export const verifyEmailOtp = (data)   => API.post('edit_profile.php', { ...data, action: 'verify_otp' });
export const getDashboard   = (userId) => API.get(`dashboard.php?user_id=${userId}`);
export const getMyProjects  = (userId) => API.get(`my_projects.php?user_id=${userId}`);
export const updateProject  = (data)   => API.post('update_project.php', data);
export const getApplications   = (userId, type) => API.get(`applications.php?user_id=${userId}&type=${type}`);
export const manageApplication = (data) => API.post('manage_application.php', data);
export const getProjectDetails = (projectId, userId) =>
  API.get(`project_details.php?project_id=${projectId}&user_id=${userId}`);
export const applyToProject = (data) => API.post('apply.php', data);
export const submitRating   = (data) => API.post('submit_rating.php', data);
export const browseProjects = (params) => API.get('browse_projects.php', { params });
export const postProject    = (data)   => API.post('post_project.php', data);

const NOTIF_BASE = "http://localhost/Campus-Skill-Exchange-Platform/profile/backend/notifications/backend/";
export const getNotifications     = () =>
  axios.get(NOTIF_BASE + 'get_notifications.php', { withCredentials: true });
export const markNotificationRead = (data) =>
  axios.post(NOTIF_BASE + 'mark_read.php', data, { withCredentials: true });
