// src/utils/statusHelper.js
export function calcStatus(stock, threshold = 10) {
  if (stock <= threshold) return "Low";
  if (stock <= 15) return "Medium";
  return "Good";
}
