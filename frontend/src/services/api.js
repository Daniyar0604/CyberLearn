
const API_URL = 'http://localhost:5000/api';

export async function registerUser({ username, email, password }) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Registration failed');
  }
  return response.json();
}

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Login failed');
  }
  return response.json();
}

export const API = {
  // health и другие реальные методы
};

// Обновить bio пользователя
export async function updateUserBio(bio) {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}/auth/bio`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ bio })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Ошибка');
  }

  return res.json();
}

export async function getAllExercisesStatus() {
  const token = localStorage.getItem('token');

  const res = await fetch(
    `${API_URL}/exercises/status`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!res.ok) {
    throw new Error('Не удалось загрузить задания');
  }

  return res.json();
}


export async function uploadAvatar(userId, file) {
  const formData = new FormData();
  formData.append("userId", userId);
  formData.append("avatar", file);

  const res = await fetch("http://localhost:5000/api/upload/avatar", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Upload failed");
  }

  return res.json();
}

function getToken() {
  return localStorage.getItem("token");
}

export async function fetchUsers() {
  const res = await fetch(`${API_URL}/api/admin/users`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to load users");
  }
  return res.json();
}

export async function updateUserRole(id, role) {
  const res = await fetch(`${API_URL}/api/admin/users/${id}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ role }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update role");
  }
  return res.json();
}

export async function getVulnerabilities() {
  const res = await fetch(`${API_URL}/vulnerabilities`);
  if (!res.ok) {
    throw new Error('Ошибка загрузки уязвимостей');
  }
  return await res.json();
}

export async function getVulnerabilityByCode(code) {
  const res = await fetch(`${API_URL}/vulnerabilities/${code}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Не удалось загрузить уязвимость');
  }

  return data;
}



export async function getExercisesByCode(code) {
  const res = await fetch(`${API_URL}/exercises/${code}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error('Не удалось загрузить задания');
  }

  return Array.isArray(data) ? data : [];
}


export async function getExerciseByOrder(code, order) {
  const token = localStorage.getItem('token');

  const res = await fetch(
    `${API_URL}/exercises/${code}/${order}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Ошибка загрузки задания');
  }

  return res.json();
}


export async function getVulnerabilityProgress(code) {
  const token = localStorage.getItem('token');

  const res = await fetch(
    `http://localhost:5000/api/progress/vulnerability/${code}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!res.ok) {
    throw new Error('Не удалось загрузить прогресс');
  }

  return res.json();
}


export async function getMyXP() {
  const token = localStorage.getItem('token');

  const res = await fetch('http://localhost:5000/api/xp/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error('Не удалось загрузить XP');
  }

  return res.json();
}

export async function getMe() {
  const res = await fetch('http://localhost:5000/api/users/me', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!res.ok) {
    throw new Error('Failed to load user');
  }

  return res.json();
}

export async function getMyRating() {
  const res = await fetch('http://localhost:5000/api/users/rating', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!res.ok) {
    throw new Error('Failed to load rating');
  }

  return res.json();
}

export async function completeExercise(exerciseId) {
  return fetch(`/api/exercises/${exerciseId}/complete`, {
    method: 'POST',
    headers: authHeaders()
  });
}
