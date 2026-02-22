import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import AppLayout from '../../components/layout/AppLayout';
import {
  getVulnerabilityByCode,
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

  console.log('progress fn:', getVulnerabilityProgress);


  useEffect(() => {
    async function load() {
      try {
        const vuln = await getVulnerabilityByCode(code);
        const ex = await getExercisesByCode(code);
        const prog = await getVulnerabilityProgress(code);

        setVulnerability(vuln);
        setExercises(ex);
        setProgress(prog);
      } catch (e) {
        console.error('Ошибка загрузки упражнений', e);
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

  if (!vulnerability) {
    return (
      <AppLayout>
        <div className="page-empty">Уязвимость не найдена</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="exercises-page">

        {/* HEADER */}
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

        {/* PROGRESS */}
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

        {/* VERTICAL LIST */}
        <section className="exercises-list">
          {exercises.map(ex => (
            <div key={ex.id} className="exercise-row">

              {/* LEFT */}
              <div className="exercise-left">
                <span className="exercise-order">
                  {ex.order_index}
                </span>
              </div>

              {/* CENTER */}
              <div className="exercise-main">
                <h3 className="exercise-title">
                  {ex.title}
                </h3>

                <p className="exercise-description">
                  {ex.description}
                </p>
              </div>

              {/* RIGHT */}
              <div className="exercise-right">
                <span className={`difficulty-badge difficulty-${ex.difficulty}`}>
                  {ex.difficulty}
                </span>

                <Button
                  size="sm"
                  onClick={() =>
                    navigate(`/exercises/${code}/${ex.order_index}`)
                  }
                >
                  Открыть
                </Button>
              </div>

            </div>
          ))}

          {exercises.length === 0 && (
            <div className="page-empty">
              Заданий пока нет
            </div>
          )}
        </section>

      </div>
    </AppLayout>
  );
}

export default ExercisesPage;
