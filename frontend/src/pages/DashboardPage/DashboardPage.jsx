import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';

import AppLayout from '../../components/layout/AppLayout';
import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';

import './DashboardPage.css';

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

  const courses = [
    {
      title: 'SQL Injection',
      description: 'Внедрение вредоносного SQL-кода в запросы к базе данных.',
      progress: 33,
      modules: 12,
      completed: 4,
      difficulty: 'Medium',
      color: 'blue',
      path: '/exercises/sql'
    },
    {
      title: 'Cross-Site Scripting',
      description: 'Внедрение вредоносных скриптов на веб-страницы.',
      progress: 13,
      modules: 15,
      completed: 2,
      difficulty: 'Easy',
      color: 'emerald',
      path: '/exercises/xss'
    },
    {
      title: 'Remote Code Execution',
      description: 'Удаленное выполнение кода на сервере.',
      progress: 0,
      modules: 10,
      completed: 0,
      difficulty: 'Hard',
      color: 'red',
      path: '/exercises/rce'
    }
  ];

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

      {/* COURSES */}
      <section className="courses-section">
        <div className="section-header">
          <h2>Активные задачи</h2>
          <button className="view-all-btn">Все категории</button>
        </div>

        <div className="courses-grid">
          {courses.map((course, i) => (
            <div key={i} className={`course-card course-${course.color}`}>
              <div className="course-header">
                <h3>{course.title}</h3>
                <span
                  className={`difficulty difficulty-${course.difficulty.toLowerCase()}`}
                >
                  {course.difficulty}
                </span>
              </div>

              <p className="course-description">{course.description}</p>

              <div className="course-progress">
                <div className="progress-info">
                  <span>
                    {course.completed}/{course.modules} модулей
                  </span>
                  <span>{course.progress}%</span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              <Button size="sm" onClick={() => navigate(course.path)}>
                {course.progress > 0 ? 'Продолжить' : 'Начать'}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* ACTIVITY */}
      <section className="activity-section">
        <h2>Последняя активность</h2>

        <div className="activity-list">
          {[
            {
              action: 'Завершен модуль',
              title: 'SQL Injection Basics',
              time: '2 часа назад',
              type: 'success'
            },
            {
              action: 'Начат курс',
              title: 'XSS Fundamentals',
              time: '5 часов назад',
              type: 'info'
            },
            {
              action: 'Получено достижение',
              title: 'First Blood',
              time: '1 день назад',
              type: 'achievement'
            }
          ].map((activity, i) => (
            <div
              key={i}
              className={`activity-item activity-${activity.type}`}
            >
              <div className="activity-icon" />
              <div className="activity-content">
                <div className="activity-title">
                  {activity.action}: {activity.title}
                </div>
                <div className="activity-time">{activity.time}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppLayout>
  );
}

export default DashboardPage;
