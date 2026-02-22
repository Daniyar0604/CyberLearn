import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  BookOpen,
  Shield,
  TrendingUp,
  Plus,
  Edit,
  Lock,
  Unlock,
  Search
} from 'lucide-react';

import AppLayout from '../../components/layout/AppLayout';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Input/Input';
import ConfirmModal from '../../components/ui/ConfirmModal/ConfirmModal';
import { apiGetAdminStats } from '../../services/adminApi';
import './AdminPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getToken() {
  return localStorage.getItem('token');
}

async function apiGetAdminUsers() {
  const res = await fetch(`${API_URL}/api/admin/users`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiUpdateUserRole(userId, role) {
  const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ role })
  });
  if (!res.ok) throw new Error(await res.text());
}

async function apiSetUserBlocked(userId, is_blocked) {
  const res = await fetch(`${API_URL}/api/admin/users/${userId}/block`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({ is_blocked })
  });
  if (!res.ok) throw new Error(await res.text());
}


function AdminPage() {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState(null);

  const [editUser, setEditUser] = useState(null);
  const [newRole, setNewRole] = useState('user');
  const [savingRole, setSavingRole] = useState(false);

  const [blockingIds, setBlockingIds] = useState(new Set());
  const [confirmUser, setConfirmUser] = useState(null);

  async function loadUsers() {
    try {
      setUsersLoading(true);
      setUsersError('');

      const data = await apiGetAdminUsers();
      setUsers(
        (data.users || []).map(u => ({
          id: u.id,
          name: u.username,
          email: u.email,
          role: u.role === 'admin' ? 'admin' : 'user',
          is_blocked: Boolean(u.is_blocked),
        }))
      );
    } catch (e) {
      setUsersError(e.message || 'Ошибка загрузки');
    } finally {
      setUsersLoading(false);
    }
  }

  async function loadStats() {
    try {
      const s = await apiGetAdminStats();
      setStats(s);
    } catch (e) {
      // ignore for now
    }
  }

  useEffect(() => {
    loadUsers();
    loadStats();
  }, []);

  // enrich users with completed exercises count
  const usersWithExercises = useMemo(() => {
    if (!stats || !stats.userExerciseCounts) return users;
    return users.map(u => {
      const found = stats.userExerciseCounts.find(x => x.user_id === u.id);
      return { ...u, exercises: found ? found.completed_count : 0 };
    });
  }, [users, stats]);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return usersWithExercises.filter(u =>
      [u.name, u.email, u.role].some(v =>
        (v || '').toLowerCase().includes(q)
      )
    );
  }, [usersWithExercises, search]);

  async function handleSaveRole() {
    try {
      setSavingRole(true);
      await apiUpdateUserRole(editUser.id, newRole);
      setEditUser(null);
      await loadUsers();
    } finally {
      setSavingRole(false);
    }
  }

  async function confirmBlockUser() {
    const user = confirmUser;
    if (!user) return;

    setBlockingIds(prev => new Set(prev).add(user.id));
    try {
      await apiSetUserBlocked(user.id, !user.is_blocked);
      await loadUsers();
    } finally {
      setBlockingIds(prev => {
        const s = new Set(prev);
        s.delete(user.id);
        return s;
      });
      setConfirmUser(null);
    }
  }

  return (
    <AppLayout>
      {/* HEADER */}
      <header className="admin-header">
        <div>
          <h1 className="admin-title">Панель администратора</h1>
          <p className="admin-subtitle">Управление пользователями</p>
        </div>
        <Button leftIcon={<Plus size={16} />}>Создать курс</Button>
      </header>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card stat-violet">
          <div className="stat-icon"><Users size={24} /></div>
          <div>
            <div className="stat-value">{users.length}</div>
            <div className="stat-label">Пользователей</div>
          </div>
        </div>
        <div className="stat-card stat-emerald">
          <div className="stat-icon"><BookOpen size={24} /></div>
          <div>
            <div className="stat-value">{stats && typeof stats.courses_total === 'number' ? stats.courses_total : '—'}</div>
            <div className="stat-label">Курсов</div>
          </div>
        </div>
        <div className="stat-card stat-amber">
          <div className="stat-icon"><Shield size={24} /></div>
          <div>
            <div className="stat-value">{stats ? stats.exercises_total : '—'}</div>
            <div className="stat-label">Упражнений</div>
          </div>
        </div>
        <div className="stat-card stat-blue">
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div>
            <div className="stat-value">{stats ? stats.completed_total : '—'}</div>
            <div className="stat-label">Завершений</div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="admin-content">
        <div className="content-header">
          <Input
            placeholder="Поиск пользователя..."
            icon={<Search size={16} />}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Button variant="outline" onClick={loadUsers}>
            Обновить
          </Button>
        </div>

        {usersLoading && <div>Загрузка...</div>}
        {usersError && <div style={{ color: 'crimson' }}>{usersError}</div>}

        {!usersLoading && !usersError && (
          <table className="data-table">

            <thead>
              <tr>
                <th>Имя</th>
                <th>Email</th>
                <th className="role-col">Роль</th>
                <th className="exercises-col">Упражнения</th>
                <th className="actions-col">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td className="role-col">
                    <span className={`role-badge role-${u.role}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="exercises-col">{u.exercises}</td>
                  <td className="actions-col">
                    <div className="action-buttons">
                      <button
                        className="action-btn"
                        title="Изменить роль"
                        onClick={() => {
                          setEditUser(u);
                          setNewRole(u.role);
                        }}
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        className={`action-btn ${u.is_blocked ? 'success' : 'danger'}`}
                        title={u.is_blocked ? 'Разблокировать' : 'Заблокировать'}
                        onClick={() => setConfirmUser(u)}
                        disabled={blockingIds.has(u.id)}
                      >
                        {blockingIds.has(u.id)
                          ? '…'
                          : u.is_blocked
                            ? <Unlock size={16} />
                            : <Lock size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 16 }}>
                    Ничего не найдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ROLE MODAL */}
      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Изменить роль</h2>

            <select
              className="modal-select"
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>

            {newRole === 'admin' && (
              <p style={{ color: '#fbbf24', fontSize: 13, marginTop: 8 }}>
                ⚠ Администратор имеет полный доступ к системе
              </p>
            )}

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setEditUser(null)}>
                Отмена
              </button>
              <button
                className="btn-save"
                onClick={handleSaveRole}
                disabled={savingRole}
              >
                {savingRole ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM BLOCK */}
      <ConfirmModal
        open={!!confirmUser}
        danger
        title={
          confirmUser?.is_blocked
            ? 'Разблокировать пользователя'
            : 'Заблокировать пользователя'
        }
        description={`Вы уверены, что хотите ${
          confirmUser?.is_blocked ? 'разблокировать' : 'заблокировать'
        } пользователя ${confirmUser?.name}?`}
        confirmText={confirmUser?.is_blocked ? 'Разблокировать' : 'Заблокировать'}
        loading={blockingIds.has(confirmUser?.id)}
        onCancel={() => setConfirmUser(null)}
        onConfirm={confirmBlockUser}
      />
    </AppLayout>
  );
}

export default AdminPage;
