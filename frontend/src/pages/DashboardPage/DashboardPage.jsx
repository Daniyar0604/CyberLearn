import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
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

function getUserFromStorage() {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch {
    return {};
  }
}

import {
  getVulnerabilities,
  getExercisesByCode,
  getVulnerabilityProgress
} from '../../services/api';

function DashboardPage() {
  const navigate = useNavigate();
  const user = getUserFromStorage();
  const [activityFeed, setActivityFeed] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [feedError, setFeedError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      setLoadingFeed(true);
      setFeedError(null);
      try {
        const feedData = await getActivityFeed();
        // Backend now returns feed array already sorted
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
    async function loadCourses() {
      setLoadingCourses(true);
      try {
        const data = await getVulnerabilities();
        const safeData = Array.isArray(data) ? data : [];
        const token = localStorage.getItem('token');

        const UI_MAP = {
          sql: {
            color: 'blue',
            difficulty: 'Medium',
          },
          xss: {
            color: 'emerald',
            difficulty: 'Easy',
          },
          csrf: {
            color: 'amber',
            difficulty: 'Medium',
          },
          rce: {
            color: 'red',
            difficulty: 'Hard',
          }
        };

        const withProgress = await Promise.all(
          safeData.map(async vuln => {
            const ui = UI_MAP[vuln.code] || { color: 'gray', difficulty: 'Medium' };
            let modules = 0;
            let completed = 0;
            let progress = 0;
            try {
              const exercises = await getExercisesByCode(vuln.code);
              modules = exercises.length;
              if (token) {
                const prog = await getVulnerabilityProgress(vuln.code);
                completed = Number(prog.completed) || 0;
                if (prog.progress !== undefined && prog.progress !== null) {
                  progress = Number(prog.progress) || 0;
                } else if (prog.total) {
                  progress = Math.round((completed / prog.total) * 100);
                } else if (modules > 0) {
                  progress = Math.round((completed / modules) * 100);
                } else {
                  progress = 0;
                }
              }
            } catch (e) {
              // fallback: no progress
            }
            return {
              title: vuln.title,
              description: vuln.description,
              progress,
              modules,
              completed,
              difficulty: ui.difficulty,
              color: ui.color,
              path: `/exercises/${vuln.code}`
            };
          })
        );
        setCourses(withProgress);
      } catch (e) {
        setCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    }
    loadCourses();
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
                    {/* Only show course name for module completion */}
                    {activity.type === 'module' && activity.course ? (
                      <span style={{ color: '#94a3b8', marginLeft: 4 }}>
                        ({activity.course})
                      </span>
                    ) : null}
                  </div>
                  <div className="activity-time">
                    {(() => {
                      const d = new Date(activity.time);
                      // Remove seconds
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
