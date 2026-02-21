import { jwtDecode } from "jwt-decode";

export const getUserIdFromToken = () => {
  const token = localStorage.getItem("token"); // sizda qayerda saqlansa o‘sha
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);

    // Token payload ichida qaysi field bo‘lsa shuni oling:
    // masalan: { id: 1 } yoki { userId: 1 } yoki { sub: 1 }
    return decoded?.id ?? decoded?.userId ?? decoded?.sub ?? null;
  } catch (e) {
    return null;
  }
};