import { jwtDecode } from "jwt-decode";

export const getEditorIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    console.log("Decoded token:", decoded); // Tokenni tekshirish uchun
    
    // Token ichidagi editor ID ni topish
    // Qaysi fieldda kelayotganini tekshiring
    return decoded?.editorId || decoded?.id || decoded?.sub || null;
  } catch (e) {
    console.error("Token decode error:", e);
    return null;
  }
};