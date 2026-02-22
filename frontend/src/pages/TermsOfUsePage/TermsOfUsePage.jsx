import { useNavigate, Link } from "react-router-dom";
import { FileText, ArrowLeft, ShieldAlert, Shield } from "lucide-react";
import "./TermsOfUsePage.css";

export default function TermsOfUsePage() {
  const navigate = useNavigate();

  return (
    <div className="terms-page">
      <header className="terms-navbar">
        <div className="terms-navbar-container">
          <button className="terms-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            Назад
          </button>

          <div className="terms-logo" onClick={() => navigate("/")}>
            <div className="terms-logo-icon">
              <Shield size={20} />
            </div>
            <span className="terms-logo-text">CyberLearn</span>
          </div>

          <div className="terms-navbar-actions">
            <button className="terms-nav-btn" onClick={() => navigate("/login")}>
              Вход
            </button>
          </div>
        </div>
      </header>

      <main className="terms-main">
        <div className="terms-bg-glow" />

        <div className="terms-container">
          <div className="terms-header">
            <div className="terms-title-wrap">
              <div className="terms-title-icon">
                <FileText size={22} />
              </div>

              <div>
                <h1 className="terms-title">Условия использования</h1>
                <p className="terms-subtitle">
                  Правила использования CyberLearn. Пожалуйста, ознакомьтесь перед началом обучения.
                </p>
              </div>
            </div>

            <div className="terms-meta">
              <span className="terms-meta-badge">Актуально: Январь 2026</span>
            </div>
          </div>

          <section className="terms-card">
            <h2>1. Назначение платформы</h2>
            <p>
              CyberLearn — образовательная платформа для изучения основ кибербезопасности и этичного хакинга.
              Материалы и задания предназначены исключительно для учебных целей.
            </p>
          </section>

          <section className="terms-card">
            <h2>2. Учётная запись</h2>
            <p>
              При регистрации вы обязуетесь указывать корректные данные и соблюдать правила использования сервиса.
              Вы несёте ответственность за сохранность доступа к своей учётной записи.
            </p>
          </section>

          <section className="terms-card terms-warning">
            <div className="terms-warning-head">
              <ShieldAlert size={20} />
              <h2>3. Запрещённые действия</h2>
            </div>

            <p>Запрещается:</p>
            <ul>
              <li>пытаться нарушать работу сервиса (атаки, перегрузка, обход ограничений);</li>
              <li>использовать материалы платформы для незаконных действий на сторонних ресурсах;</li>
              <li>публиковать или распространять вредоносный контент;</li>
              <li>получать доступ к данным других пользователей без разрешения.</li>
            </ul>
          </section>

          <section className="terms-card">
            <h2>4. Учебные уязвимости</h2>
            <p>
              Некоторые задания могут содержать намеренно созданные уязвимости для обучения.
              Используйте эти знания только там, где у вас есть явное разрешение (например, в пределах CyberLearn).
            </p>
          </section>

          <section className="terms-card">
            <h2>5. Ограничение ответственности</h2>
            <p>
              Администрация платформы не несёт ответственности за любые последствия, связанные с использованием
              материалов пользователем вне платформы, а также за ущерб, возникший из-за неправильного применения знаний.
            </p>
          </section>

          <section className="terms-card">
            <h2>6. Блокировка и ограничения</h2>
            <p>
              При нарушении условий доступ к аккаунту может быть ограничен или заблокирован. Решение принимается
              администрацией платформы.
            </p>
          </section>

          <section className="terms-card">
            <h2>7. Изменения условий</h2>
            <p>
              Условия могут обновляться. Продолжая использовать платформу после изменений, вы соглашаетесь с актуальной версией.
            </p>
          </section>

          <div className="terms-bottom-actions">
            <Link className="terms-secondary-link" to="/privacy-policy">
              Назад к политике конфиденциальности
            </Link>

            <button className="terms-primary" onClick={() => navigate("/")}>
              Понятно, на главную
            </button>
          </div>
        </div>
      </main>

      <footer className="terms-footer">
        <div className="terms-footer-container">
          <div className="terms-footer-bottom">
            <p>© 2024 CyberLearn. Все права защищены.</p>

            <div className="terms-footer-legal">
              <Link to="/privacy-policy">Политика конфиденциальности</Link>
              <Link to="/terms-of-use">Условия использования</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
