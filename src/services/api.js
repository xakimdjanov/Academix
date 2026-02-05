import axiosInstance from './axiosInstance';

// --- ADMIN VA USERS SERVISLARI ---
export const adminService = {
  register: (data) => axiosInstance.post('/admin/register', data), //
  login: (credentials) => axiosInstance.post('/admin/login', credentials), //
  getAll: () => axiosInstance.get('/admin/getAdmin'), //
  getById: (id) => axiosInstance.get(`/admin/getAdminById/${id}`), //
  update: (id, data) => axiosInstance.put(`/admin/updateAdmin/${id}`, data), //
  delete: (id) => axiosInstance.delete(`/admin/deleteAdmin/${id}`), //
};

// --- MAQOLALAR (ARTICLES) SERVISLARI ---
export const articleService = {
  create: (data) => axiosInstance.post('/article/create', data), //
  getAll: () => axiosInstance.get('/article/getAll'), //
  getFiltered: (params) => axiosInstance.get('/article/get', { params }), //
  getById: (id) => axiosInstance.get(`/article/getById/${id}`), //
  update: (id, data) => axiosInstance.put(`/article/update/${id}`, data), //
  delete: (id) => axiosInstance.delete(`/article/delete/${id}`), //
};

// --- JURNALLAR (JOURNALS) SERVISLARI ---
export const journalService = {
  create: (data) => axiosInstance.post('/journal/create', data), //
  getAll: () => axiosInstance.get('/journal/getAll'), //
  getById: (id) => axiosInstance.get(`/journal/getById/${id}`), //
  update: (id, data) => axiosInstance.put(`/journal/update/${id}`, data), //
};

// --- KOMMENTARIYALAR (COMMENTS) ---
export const commentService = {
  create: (data) => axiosInstance.post('/comment/create', data), //
  getComments: () => axiosInstance.get('/comment/getComments'), //
  update: (id, data) => axiosInstance.put(`/comment/updateComment/${id}`, data), //
};

// --- JURNAL SOZLAMALARI (SETTINGS) ---
export const settingsService = {
  create: (data) => axiosInstance.post('/journalSettings/create', data), //
  getAll: () => axiosInstance.get('/journalSettings/all'), //
  getById: (id) => axiosInstance.get(`/journalSettings/${id}`), //
  update: (id, data) => axiosInstance.put(`/journalSettings/update/${id}`, data), //
};

// --- BILDIRISHNOMALAR (NOTIFICATIONS) ---
export const notificationService = {
  getAll: () => axiosInstance.get('/notifications'), //
  create: (data) => axiosInstance.post('/notifications/create', data), //
  update: (id, data) => axiosInstance.put(`/notifications/${id}`, data), //
};

// --- AUDIT LOGS ---
export const auditLogService = {
  getAll: () => axiosInstance.get('/audit-logs'), //
  create: (data) => axiosInstance.post('/audit-logs', data), //
};