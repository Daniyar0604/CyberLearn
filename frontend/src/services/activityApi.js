const API_URL = 'http://localhost:5000/api/activity';

export async function getActivityFeed() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/feed`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) {
    throw new Error('Ошибка загрузки ленты активности');
  }
  return res.json();
}
