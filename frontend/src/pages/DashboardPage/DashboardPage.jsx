import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

import AppLayout from '../../components/layout/AppLayout';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';

import './DashboardPage.css';
import { getActivityFeed } from '../../services/activityApi';
import { getAllExercisesStatus } from '../../services/api';

function getUserFromStorage() {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch {
    return {};
  }
}

function DashboardPage() {
  const navigate = useNavigate();
  const user = getUserFromStorage();
  const [activityFeed, setActivityFeed] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [feedError, setFeedError] = useState(null);

  const [exercises, setExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(true);
  const [sortBy, setSortBy] = useState('order'); // 'order' | 'difficulty'
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    async function fetchFeed() {
      setLoadingFeed(true);
      setFeedError(null);
      try {
        const feedData = await getActivityFeed();
        const allActivities = (feedData.feed || []).map(item => {
          if (item.type === 'module') {
            return {
              type: 'module',
              action: 'Завершен модуль',
              title: item.title,
              course: item.course_title,
              time: item.completed_at
            };
          } else {
            return {
              type: 'course',
              action: 'Завершен курс',
              title: item.course_title,
              time: item.completed_at
            };
          }
        });
        setActivityFeed(allActivities);
      } catch (e) {
        setFeedError(e.message);
      } finally {
        setLoadingFeed(false);
      }
    }
    fetchFeed();
  }, []);

  useEffect(() => {
    async function loadExercises() {
      setLoadingExercises(true);
      try {
        const data = await getAllExercisesStatus();
        setExercises(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load exercises:", e);
        setExercises([]);
      } finally {
        setLoadingExercises(false);
      }
    }
    loadExercises();
  }, []);

  const {
    username = '',
    completed_courses = 0,
    level = 0,
    experience = 0,
    study_hours = 0,
    avatar
  } = user;

  const stats = [
    { label: 'Завершено курсов', value: completed_courses, color: 'violet' },
    { label: 'Текущий уровень', value: level, color: 'emerald' },
    { label: 'Опыт (XP)', value: experience, color: 'amber' },
    { label: 'Часов обучения', value: study_hours, color: 'blue' }
  ];

  // Logic for exercises table
  // Filter only incomplete exercises (is_completed === 0)
  const incompleteExercises = exercises.filter(ex => !ex.is_completed);

  const getDifficultyKey = (diff) => {
    if (!diff) return 'unknown';
    const d = diff.toLowerCase();
    if (d === 'easy' || d === 'beginner') return 'easy';
    if (d === 'medium' || d === 'intermediate') return 'medium';
    if (d === 'hard' || d === 'advanced') return 'hard';
    return 'unknown';
  };

  const difficultyRu = {
    'easy': 'Легкий',
    'medium': 'Средний',
    'hard': 'Сложный',
    'unknown': 'Неизвестно'
  };

  const difficultyOrder = {
    'easy': 1,
    'medium': 2,
    'hard': 3,
    'unknown': 99
  };

  const sortedExercises = [...incompleteExercises].sort((a, b) => {
    if (sortBy === 'difficulty') {
      const da = difficultyOrder[getDifficultyKey(a.difficulty)];
      const db = difficultyOrder[getDifficultyKey(b.difficulty)];
      return da - db;
    }
    // Default: by order (Backend returns sorted by vulnerability ID and order_index)
    // We can rely on original index if we want absolute stability or just keep array order
    return 0;
  });

  return (
    <AppLayout>
      {/* HEADER */}
      <header className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Привет, {username}! 👋</h1>
          <p className="dashboard-subtitle">
            Готов продолжить обучение кибербезопасности?
          </p>
        </div>

        <div className="header-actions">
          <div className="search-wrapper">
            <Input
              placeholder="Поиск курсов..."
              icon={<Search size={16} />}
            />
          </div>

          <button className="notification-btn">
            <Bell size={20} />
            <span className="notification-badge" />
          </button>

          <div className="user-avatar">
            <img
              src={`http://localhost:5000/uploads/avatars/${avatar || 'default-avatar.png'}`}
              alt="avatar"
            />
          </div>
        </div>
      </header>

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

      {/* EXERCISES TABLE SECTION */}
      <section className="courses-section">
        <div className="section-header">
          <h2>Активные задачи</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Сортировать по:</span>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="order">Порядку</option>
                <option value="difficulty">Сложности</option>
              </select>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Свернуть' : 'Показать все'}
            </Button>
          </div>
        </div>

        {loadingExercises ? (
          <div style={{ color: '#94a3b8' }}>Загрузка задач...</div>
        ) : incompleteExercises.length === 0 ? (
          <div className="congrats-message">
            🎉 Поздравляем! Все задачи выполнены!
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="exercises-table">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Категория</th>
                  <th>Сложность</th>
                  <th>Действие</th>
                </tr>
              </thead>
              <tbody>
                {(showAll ? sortedExercises : sortedExercises.slice(0, 3)).map((ex) => (
                  <tr key={ex.id}>
                    <td>{ex.title}</td>
                    <td>{ex.vulnerability_title}</td>
                    <td>
                      <span className={`difficulty difficulty-${getDifficultyKey(ex.difficulty)}`}>
                        {difficultyRu[getDifficultyKey(ex.difficulty)] || ex.difficulty}
                      </span>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/exercises/${ex.vulnerability_code}/${ex.order_index}`)}
                      >
                        Начать
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ACTIVITY */}
      <section className="activity-section">
        <h2>Последняя активность</h2>
        <div className="activity-list">
          {loadingFeed ? (
            <div className="activity-item">Загрузка...</div>
          ) : feedError ? (
            <div className="activity-item activity-error">{feedError}</div>
          ) : activityFeed.length === 0 ? (
            <div className="activity-item">Нет активности</div>
          ) : (
            activityFeed.map((activity, i) => (
              <div
                key={i}
                className={`activity-item activity-${activity.type}`}
              >
                <div className="activity-icon" />
                <div className="activity-content">
                  <div className="activity-title">
                    {activity.action}: {activity.title}
                    {activity.type === 'module' && activity.course ? (
                      <span style={{ color: '#94a3b8', marginLeft: 4 }}>
                        ({activity.course})
                      </span>
                    ) : null}
                  </div>
                  <div className="activity-time">
                    {(() => {
                      const d = new Date(activity.time);
                      return d.toLocaleString(undefined, {
                        hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                      });
                    })()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </AppLayout>
  );
}

export default DashboardPage;
