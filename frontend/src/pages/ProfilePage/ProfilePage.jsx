import React, { useState, useEffect } from 'react';
import { Calendar, Edit2 } from 'lucide-react';

import AppLayout from '../../components/layout/AppLayout';
import { Button } from '../../components/ui/Button/Button';
import {
  updateUserBio,
  uploadAvatar,
  getMe,
} from '../../services/api';

import './ProfilePage.css';

function getUserFromStorage() {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch {
    return {};
  }
}

function ProfilePage() {
  const [user, setUser] = useState(getUserFromStorage());

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [profile, setProfile] = useState({
    name: user.username || '',
    email: user.email || '',
    bio: user.bio || '',
    joinDate: user.created_at
      ? new Date(user.created_at).toLocaleDateString('ru-RU')
      : '',
  });

  /* ===== LOAD USER ===== */

  useEffect(() => {
    async function loadMe() {
      try {
        const freshUser = await getMe();

        setUser(freshUser);
        setProfile(prev => ({
          ...prev,
          bio: freshUser.bio || '',
          name: freshUser.username,
          email: freshUser.email,
          joinDate: freshUser.created_at
            ? new Date(freshUser.created_at).toLocaleDateString('ru-RU')
            : '',
        }));

        localStorage.setItem('user', JSON.stringify(freshUser));
      } catch (e) {
        console.error('Failed to load user', e);
      }
    }

    loadMe();
  }, []);

  /* ===== STUDY TIME ===== */

  const totalMinutes = user.study_hours || 0;
  const studyHours = Math.floor(totalMinutes / 60);
  const studyMinutes = totalMinutes % 60;

  const studyTimeLabel =
    studyHours > 0
      ? `${studyHours} ч ${studyMinutes} мин`
      : `${studyMinutes} мин`;

  /* ===== STATS ===== */

  const stats = [
    {
      label: 'Выполнено упражнений',
      value: user.completed_exercises || 0,
      color: 'violet',
    },
    {
      label: 'Уровень',
      value: user.level || '',
      color: 'emerald',
    },
    {
      label: 'Время обучения',
      value: studyTimeLabel,
      color: 'blue',
    },
  ];

  /* ===== BIO ===== */

  const handleSaveBio = async () => {
    setSaving(true);
    try {
      await updateUserBio(profile.bio);

      const updated = { ...user, bio: profile.bio };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));

      setIsEditing(false);
    } catch (e) {
      alert(e.message || 'Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  /* ===== AVATAR ===== */

  const handleAvatarChange = async e => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const data = await uploadAvatar(user.id, file);

      const updated = { ...user, avatar: data.avatar };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    } catch (e) {
      alert(e.message || 'Ошибка загрузки аватара');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout>
      {/* HEADER */}
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrapper">
            <img
              src={`http://localhost:5000/uploads/avatars/${user.avatar || 'default-avatar.png'}`}
              alt="avatar"
              className="profile-avatar-img"
            />

            <label className="avatar-change-btn">
              Сменить аватар
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAvatarChange}
                className="avatar-file-input"
              />
            </label>

            {uploading && (
              <span className="avatar-loading">Загрузка...</span>
            )}
          </div>

          <div className="profile-info">
            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-email">{profile.email}</p>
            <div className="profile-meta">
              <Calendar size={16} />
              <span>Присоединился {profile.joinDate}</span>
            </div>
          </div>
        </div>

        {isEditing ? (
          <Button
            variant="outline"
            leftIcon={<Edit2 size={16} />}
            onClick={handleSaveBio}
            disabled={saving}
          >
            {saving ? 'Сохраняю...' : 'Сохранить'}
          </Button>
        ) : (
          <Button
            variant="outline"
            leftIcon={<Edit2 size={16} />}
            onClick={() => setIsEditing(true)}
          >
            Редактировать
          </Button>
        )}
      </div>

      {/* STATS */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div key={i} className={`stat-card stat-${stat.color}`}>
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* BIO */}
      {isEditing ? (
        <div className="edit-section">
          <div className="edit-card">
            <h2>Редактировать профиль</h2>
            <div className="edit-form">
              <label className="input-label">О себе</label>
              <textarea
                className="profile-textarea"
                rows="4"
                value={profile.bio}
                onChange={e =>
                  setProfile({ ...profile, bio: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bio-card" style={{ margin: '32px auto 24px' }}>
          <h2>О себе</h2>
          <p style={{ whiteSpace: 'pre-line' }}>
            {profile.bio || (
              <span style={{ color: '#555' }}>Нет информации</span>
            )}
          </p>
        </div>
      )}
    </AppLayout>
  );
}

export default ProfilePage;
