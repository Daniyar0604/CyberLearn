const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getToken() {
  return localStorage.getItem('token');
}

async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${getToken()}`
    }
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.message || 'Request failed');
  }

  return res.json();
}

export async function apiGetAdminStats() {
  return request(`${API_URL}/api/admin/stats`);
}

export async function apiGetContentFreezeOverview() {
  return request(`${API_URL}/api/admin/content-freeze`);
}

export async function apiSetCourseFrozen(courseId, is_frozen) {
  return request(`${API_URL}/api/admin/courses/${courseId}/freeze`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ is_frozen })
  });
}

export async function apiSetExerciseFrozen(exerciseId, is_frozen) {
  return request(`${API_URL}/api/admin/exercises/${exerciseId}/freeze`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ is_frozen })
  });
}
