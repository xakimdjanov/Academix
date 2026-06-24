import { jwtDecode } from "jwt-decode";

export const getEditorIdFromToken = () => {
  // Check localStorage first
  const localId = localStorage.getItem("editorId");
  if (localId) return localId;

  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    
    // Token ichidagi editor ID ni topish
    // Qaysi fieldda kelayotganini tekshiring
    return decoded?.editorId || decoded?.id || decoded?.sub || null;
  } catch (e) {
    console.error("Token decode error:", e);
    return null;
  }
};