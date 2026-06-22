/**
 * Formats a string to sentence case (first letter uppercase, rest lowercase).
 * Useful for journal and article titles as requested.
 * 
 * @param {string} str 
 * @returns {string}
 */
export const formatTitle = (str) => {
  if (!str || typeof str !== "string") return str || "";
  const trimmed = str.trim();
  if (trimmed.length === 0) return "";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};
