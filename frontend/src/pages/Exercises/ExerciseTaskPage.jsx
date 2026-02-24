import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import AppLayout from '../../components/layout/AppLayout';
import { getExerciseByOrder } from '../../services/api';
import { Button } from '../../components/ui/Button/Button';

import './ExerciseTaskPage.css';

function ExerciseTaskPage() {
  const { code, order } = useParams();

  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [startingLab, setStartingLab] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setLoadError('');

      try {
        const data = await getExerciseByOrder(code, order);
        setExercise(data);
        setCompleted(Boolean(data.completed));
      } catch (e) {
        console.error('Ошибка загрузки задания', e);
        setLoadError(e.message || 'Задание недоступно');
        setExercise(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [code, order]);

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

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Не удалось запустить лабораторию');
      }

      if (data.status === 'success') {
        window.open(data.url, '_blank');
        return;
      }

      throw new Error(data.message || 'Не удалось запустить лабораторию');
    } catch (e) {
      console.error(e);
      alert(e.message || 'Ошибка сети');
    } finally {
      setStartingLab(false);
    }
  };

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

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Не удалось засчитать задание');
      }

      if (data.status === 'success') {
        setCompleted(true);
        return;
      }

      throw new Error(data.message || 'Не удалось засчитать задание');
    } catch (e) {
      console.error('Ошибка зачёта задания:', e);
      alert(e.message || 'Ошибка сети');
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
        <div className="page-empty">{loadError || 'Задание не найдено'}</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="exercise-task-page">
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

        <div className="exercise-task-content">
          <section className="task-card">
            <h2>Задание</h2>
            <p>{exercise.description}</p>
          </section>

          <section className="theory-card">
            <h2>Теория</h2>
            <p style={{ whiteSpace: 'pre-line' }}>
              {exercise.theory}
            </p>
          </section>

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
                ? 'Задание выполнено'
                : completing
                  ? 'Засчитываю...'
                  : 'Я выполнил задание'}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default ExerciseTaskPage;
