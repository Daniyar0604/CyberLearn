// Получение расширенной статистики для админки
export async function apiGetAdminStats() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/api/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
