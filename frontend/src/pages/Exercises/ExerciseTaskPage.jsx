import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import AppLayout from '../../components/layout/AppLayout';
import { getExerciseByOrder } from '../../services/api';
import { Button } from '../../components/ui/Button/Button';

import './ExerciseTaskPage.css';

function ExerciseTaskPage() {
  const { code, order } = useParams();

  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);

  const [startingLab, setStartingLab] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // 🔹 Загрузка задания + статуса выполнения
  useEffect(() => {
    async function load() {
      try {
        const data = await getExerciseByOrder(code, order);
        setExercise(data);
        setCompleted(Boolean(data.completed)); // ⬅️ КЛЮЧЕВОЕ МЕСТО
      } catch (e) {
        console.error('Ошибка загрузки задания', e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [code, order]);

  // 🔹 Запуск лабораторной
  const handleStartLab = async () => {
    if (!exercise) return;

    setStartingLab(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        'http://localhost:5000/api/lab/start-lab',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ exerciseId: exercise.id })
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
        window.open(data.url, '_blank');
      } else {
        alert(data.message || 'Не удалось запустить лабораторную');
      }
    } catch (e) {
      console.error(e);
      alert('Ошибка сети');
    } finally {
      setStartingLab(false);
    }
  };

  // 🔹 Засчитать выполнение
  const handleCompleteExercise = async () => {
  if (!exercise) return;

  setCompleting(true);
  try {
    const token = localStorage.getItem('token');

    const response = await fetch(
      `http://localhost:5000/api/exercises/${exercise.id}/complete`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    const data = await response.json();

    if (data.status === 'success') {
      setCompleted(true); // ✅ сразу обновляем UI
    } else {
      alert(data.message || 'Не удалось засчитать задание');
    }
  } catch (e) {
    console.error('Ошибка засчёта задания:', e);
    alert('Ошибка сети');
  } finally {
    setCompleting(false);
  }
};

  if (loading) {
    return (
      <AppLayout>
        <div className="page-loading">Загрузка задания...</div>
      </AppLayout>
    );
  }

  if (!exercise) {
    return (
      <AppLayout>
        <div className="page-empty">Задание не найдено</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="exercise-task-page">

        {/* HEADER */}
        <header className="exercise-task-header">
          <span className="exercise-order-badge">
            {code.toUpperCase()} · Задание {exercise.order_index}
          </span>

          <h1 className="exercise-task-title">
            {exercise.title}
          </h1>

          <p className="exercise-task-description">
            {exercise.description}
          </p>
        </header>

        {/* CONTENT */}
        <div className="exercise-task-content">

          {/* TASK */}
          <section className="task-card">
            <h2>📌 Задание</h2>
            <p>{exercise.description}</p>
          </section>

          {/* THEORY */}
          <section className="theory-card">
            <h2>📖 Теория</h2>
            <p style={{ whiteSpace: 'pre-line' }}>
              {exercise.theory}
            </p>
          </section>

          {/* ACTIONS */}
          <div className="exercise-task-actions">

            <Button
              size="lg"
              onClick={handleStartLab}
              disabled={startingLab}
            >
              {startingLab ? 'Запуск...' : 'Перейти к практике'}
            </Button>

            <Button
              size="lg"
              variant="success"
              onClick={handleCompleteExercise}
              disabled={completed || completing}
              style={{ marginLeft: '12px' }}
            >
              {completed
                ? '✅ Задание выполнено'
                : completing
                  ? 'Засчитываю...'
                  : '✅ Я выполнил задание'}
            </Button>

          </div>

        </div>

      </div>
    </AppLayout>
  );
}

export default ExerciseTaskPage;
