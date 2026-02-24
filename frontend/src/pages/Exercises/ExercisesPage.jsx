import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import AppLayout from '../../components/layout/AppLayout';
import { getVulnerabilityByCode,
  getExercisesByCode,
  getVulnerabilityProgress
} from '../../services/api';
import { Button } from '../../components/ui/Button/Button';

import './ExercisesPage.css';

function ExercisesPage() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [vulnerability, setVulnerability] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setLoadError('');

      try {
        const vuln = await getVulnerabilityByCode(code);
        setVulnerability(vuln);

        if (Number(vuln?.is_frozen) === 1) {
          setExercises([]);
          setProgress({ completed: 0, total: 0, percent: 0 });
          return;
        }

        const [ex, prog] = await Promise.all([
          getExercisesByCode(code),
          getVulnerabilityProgress(code)
        ]);

        setExercises(Array.isArray(ex) ? ex : []);
        setProgress(prog);
      } catch (e) {
        console.error('Ошибка загрузки упражнений', e);
        setLoadError(e.message || 'Не удалось загрузить упражнения');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [code]);

  if (loading) {
    return (
      <AppLayout>
        <div className="page-loading">Загрузка упражнений...</div>
      </AppLayout>
    );
  }

  if (loadError) {
    return (
      <AppLayout>
        <div className="page-empty">{loadError}</div>
      </AppLayout>
    );
  }

  if (!vulnerability) {
    return (
      <AppLayout>
        <div className="page-empty">Уязвимость не найдена</div>
      </AppLayout>
    );
  }

  const courseFrozen = Number(vulnerability.is_frozen) === 1;

  return (
    <AppLayout>
      <div className="exercises-page">
        <header className="exercises-header">
          <span className="category-badge">
            {vulnerability.code.toUpperCase()}
          </span>

          <h1 className="exercises-title">
            {vulnerability.title}
          </h1>

          <p className="exercises-description">
            {vulnerability.description}
          </p>
        </header>

        {courseFrozen && (
          <div className="course-maintenance-banner">
            Курс временно заморожен. Доступ к упражнениям будет открыт после завершения техработ.
          </div>
        )}

        {progress && (
          <div className="vulnerability-progress">
            <div className="progress-info">
              <span>
                Выполнено {progress.completed} из {progress.total}
              </span>
              <span>{progress.percent}%</span>
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}

        <section className="exercises-list">
          {exercises.map(ex => {
            const moduleFrozen = Number(ex.is_frozen) === 1;

            return (
              <div
                key={ex.id}
                className={`exercise-row ${moduleFrozen ? 'exercise-row-frozen' : ''}`}
              >
                <div className="exercise-left">
                  <span className="exercise-order">
                    {ex.order_index}
                  </span>
                </div>

                <div className="exercise-main">
                  <h3 className="exercise-title">
                    {ex.title}
                  </h3>

                  <p className="exercise-description">
                    {ex.description}
                  </p>
                </div>

                <div className="exercise-right">
                  <span className={`difficulty-badge difficulty-${ex.difficulty}`}>
                    {ex.difficulty}
                  </span>

                  <Button
                    size="sm"
                    disabled={courseFrozen || moduleFrozen}
                    onClick={() =>
                      navigate(`/exercises/${code}/${ex.order_index}`)
                    }
                  >
                    {moduleFrozen ? 'Заморожено' : 'Открыть'}
                  </Button>
                </div>
              </div>
            );
          })}

          {exercises.length === 0 && (
            <div className="page-empty">
              {courseFrozen ? 'Курс временно недоступен' : 'Заданий пока нет'}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

export default ExercisesPage;
