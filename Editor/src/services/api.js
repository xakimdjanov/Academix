import axiosInstance from "./axiosInstance";

// --- 1. ADMIN SERVISI ---
export const adminService = {
  login: (credentials) => axiosInstance.post("/admin/login", credentials),
  register: (data) => axiosInstance.post("/admin/register", data),
  getAll: () => axiosInstance.get("/admin/getAdmin"),
  getById: (id) => axiosInstance.get(`/admin/getAdminById/${id}`),
  update: (id, data) => axiosInstance.put(`/admin/updateAdmin/${id}`, data),
  delete: (id) => axiosInstance.delete(`/admin/deleteAdmin/${id}`),
};

// --- 2. JOURNAL ADMIN SERVISI ---
export const journalAdminService = {
  register: (data) =>
    axiosInstance.post("/JournalAdmin/register", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  forgotPassword: (data) => axiosInstance.post("/JournalAdmin/forgot-password", data),
  resetPassword: (data) => axiosInstance.post("/JournalAdmin/reset-password", data),
  login: (credentials) => axiosInstance.post("/JournalAdmin/login", credentials),
  getAll: () => axiosInstance.get("/JournalAdmin/getJournalAdmin"),
  getById: (id) => axiosInstance.get(`/JournalAdmin/getJournalAdminById/${id}`),
  update: (id, data) => axiosInstance.put(`/JournalAdmin/updateJournalAdmin/${id}`, data),
  delete: (id) => axiosInstance.delete(`/JournalAdmin/deleteJournalAdmin/${id}`),
};

// --- 3. EDITOR SERVISI ---
export const editorService = {
  register: (data) => axiosInstance.post("/editor/register", data),
  login: (credentials) => axiosInstance.post("/editor/login", credentials),
  getAll: () => axiosInstance.get("/editor/getEditor"),
  getById: (id) => axiosInstance.get(`/editor/getEditorById/${id}`),
  update: (id, data) => axiosInstance.put(`/editor/updateEditor/${id}`, data),
  delete: (id) => axiosInstance.delete(`/editor/deleteEditor/${id}`),
};

// --- 4. MAQOLALAR (ARTICLES) ---
export const articleService = {
  create: (data) =>
    axiosInstance.post("/article/create", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getAll: () => axiosInstance.get("/article/getAll"),
  getById: (id) => axiosInstance.get(`/article/getById/${id}`),
  search: (query) => axiosInstance.get(`/article/search`, { params: { query } }),
  update: (id, data) => axiosInstance.put(`/article/update/${id}`, data),
  delete: (id) => axiosInstance.delete(`/article/delete/${id}`),
};

// --- 5. JURNALLAR (JOURNALS) ---
export const journalService = {
  create: (data) => axiosInstance.post("/journal/create", data),
  getAll: () => axiosInstance.get("/journal/getAll"),
  getById: (id) => axiosInstance.get(`/journal/getById/${id}`),
  update: (id, data) => axiosInstance.put(`/journal/update/${id}`, data),
  delete: (id) => axiosInstance.delete(`/journal/delete/${id}`),
};

// --- 6. JURNAL SOZLAMALARI ---
export const settingsService = {
  create: (data) => axiosInstance.post("/journalSettings/create", data),
  getAll: () => axiosInstance.get("/journalSettings/all"),
  getById: (id) => axiosInstance.get(`/journalSettings/${id}`),
  update: (id, data) => axiosInstance.put(`/journalSettings/update/${id}`, data),
  delete: (id) => axiosInstance.delete(`/journalSettings/delete/${id}`),
};

// --- 7. KOMMENTARIYALAR ---
export const commentService = {
  create: (data) => axiosInstance.post("/comment/create", data),
  getAll: () => axiosInstance.get("/comment/getComments"),
  update: (id, data) => axiosInstance.put(`/comment/updateComment/${id}`, data),
  delete: (id) => axiosInstance.delete(`/comment/deleteComment/${id}`),
};

// --- 8. NOTIFICATIONS ---
export const notificationService = {
  create: (data) => axiosInstance.post("/notifications/create", data),
  getAll: () => axiosInstance.get("/notifications"),
  getById: (id) => axiosInstance.get(`/notifications/${id}`),
  update: (id, data) => axiosInstance.put(`/notifications/${id}`, data),
  delete: (id) => axiosInstance.delete(`/notifications/${id}`),
};

// --- 9. AUDIT LOGS ---
export const auditLogService = {
  create: (data) => axiosInstance.post("/audit-logs", data),
  getAll: () => axiosInstance.get("/audit-logs"),
  getByUser: (userId) => axiosInstance.get(`/audit-logs/user/${userId}`),
  search: (query) => axiosInstance.get("/audit-logs/search", { params: { query } }),
  delete: (id) => axiosInstance.delete(`/audit-logs/${id}`),
};

// --- 10. USERS ---
export const userService = {
  register: (data) =>
    axiosInstance.post("/users/register", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  forgotPassword: (data) => axiosInstance.post("/users/forgot-passvwrd", data),
  resetPassword: (data) => axiosInstance.post("/users/reset-passvwrd", data),
  login: (credentials) => axiosInstance.post("/users/login", credentials),
  getAll: () => axiosInstance.get("/users/getUser"),
  getById: (id) => axiosInstance.get(`/users/getUserById/${id}`),

  // ✅ swagger update: application/json
  update: (id, data) => axiosInstance.put(`/users/updateUser/${id}`, data),

  // ✅ swagger avatar: PUT /users/:id/avatar + multipart + avatar_url
  imgUpdate: (id, data) =>
    axiosInstance.put(`/users/${id}/avatar`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id) => axiosInstance.delete(`/users/deleteUser/${id}`),
};

// 11 ReviewAssignments
export const ReviewAssignments = {
  create: (data) => axiosInstance.post("/reviews/create", data),
  getAll: () => axiosInstance.get("/reviews"),
  getById: (id) => axiosInstance.get(`/reviews/${id}`),
  update: (id, data) => axiosInstance.put(`/reviews/${id}`, data),
  delete: (id) => axiosInstance.delete(`/reviews/${id}`),
};

// 12 Review
export const Review = {
  create: (data) => axiosInstance.post("/review", data),
  getAll: () => axiosInstance.get("/review"),
  getById: (id) => axiosInstance.get(`/review/${id}`),
  update: (id, data) => axiosInstance.put(`/review/${id}`, data),
  delete: (id) => axiosInstance.delete(`/review/${id}`),
};

//Chat
export const chatService = {
  send: (data) => {
    return axiosInstance.post("/chat/send", data, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },

  // Ikki kishi o'rtasidagi chatni olish (user va editor)
  getChat: (userId, editorId) => {
    return axiosInstance.get("/chat", {
      params: {
        userId: userId,
        editorId: editorId
      }
    });
  },

  // Editorning barcha chatlarini olish (frontendda filter qilamiz)
  getEditorAllChats: async (editorId) => {
    try {
      // Avval editor ga tegishli barcha userlarni olish kerak
      // Bu yerda sizning boshqa service'laringizdan foydalanamiz
      const assignmentsRes = await ReviewAssignments.getAll();
      const assignments = assignmentsRes.data || [];
      
      const editorAssignments = assignments.filter(
        a => Number(a.editor_id) === Number(editorId)
      );
      
      // Har bir user uchun chatlarni alohida yuklash
      const allChats = [];
      
      for (const assignment of editorAssignments) {
        const userId = assignment.article?.user_id;
        if (userId) {
          try {
            // Har bir user-editor juftligi uchun chatni olish
            const chatRes = await axiosInstance.get("/chat", {
              params: {
                userId: userId,
                editorId: editorId
              }
            });
            
            if (chatRes.data && chatRes.data.length > 0) {
              allChats.push(...chatRes.data);
            }
          } catch (e) {
            console.log(`No chat for user ${userId}`, e);
          }
        }
      }
      
      // Barcha xabarlarni vaqt bo'yicha sort qilish
      allChats.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );
      
      return { data: allChats };
      
    } catch (error) {
      console.error("Error getting editor chats:", error);
      throw error;
    }
  },

  // Foydalanuvchining barcha chatlari
  getUserChatList: (userId) => {
    return axiosInstance.get(`/chat/userChatList/${userId}`);
  },

  updateStatus: (id, data) => {
    return axiosInstance.put(`/chat/updateStatus/${id}`, data);
  },

  delete: (id) => {
    return axiosInstance.delete(`/chat/delete/${id}`);
  },
};