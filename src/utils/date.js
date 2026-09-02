export const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// Fecha local YYYY-MM-DD sin desfases de zona horaria (no usa toISOString,
// que convierte a UTC y puede mostrar el día equivocado).
export function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateStr(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { y, m, d };
}

export function formatDateShort(dateStr) {
  const { y, m, d } = parseDateStr(dateStr);
  return `${String(d).padStart(2, "0")} ${MONTHS[m - 1]} ${y}`;
}

export function dateLabel(dateStr) {
  const today = todayStr();
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, "0")}-${String(y.getDate()).padStart(2, "0")}`;
  if (dateStr === today) return "Hoy";
  if (dateStr === yesterday) return "Ayer";
  return formatDateShort(dateStr);
}

export function monthKey(dateStr) {
  return dateStr.slice(0, 7); // YYYY-MM
}

export function currentMonthKey() {
  return todayStr().slice(0, 7);
}

export function prevMonthKey() {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
