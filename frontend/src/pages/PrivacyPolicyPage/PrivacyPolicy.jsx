import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Mail } from 'lucide-react';
import './PrivacyPolicy.css';

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="privacy-page">
      <header className="privacy-navbar">
        <div className="privacy-navbar-container">
          <button className="privacy-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
            Назад
          </button>

          <div className="privacy-logo" onClick={() => navigate('/')}>
            <div className="privacy-logo-icon">
              <Shield size={20} />
            </div>
            <span className="privacy-logo-text">CyberLearn</span>
          </div>

          <div className="privacy-navbar-actions">
            <button className="privacy-nav-btn" onClick={() => navigate('/login')}>
              Вход
            </button>
          </div>
        </div>
      </header>

      <main className="privacy-main">
        <div className="privacy-bg-glow" />

        <div className="privacy-container">
          <div className="privacy-header">
            <div className="privacy-title-wrap">
              <div className="privacy-title-icon">
                <Shield size={22} />
              </div>
              <div>
                <h1 className="privacy-title">Политика конфиденциальности</h1>
                <p className="privacy-subtitle">
                  Ниже описано, какие данные может собирать CyberLearn и как они используются.
                </p>
              </div>
            </div>

            <div className="privacy-meta">
              <span className="privacy-meta-badge">Актуально: Январь 2026</span>
            </div>
          </div>

          <section className="privacy-card">
            <h2>1. Общие положения</h2>
            <p>
              Настоящая Политика конфиденциальности объясняет, как платформа CyberLearn
              собирает, использует и защищает данные пользователей при регистрации и использовании сервиса.
            </p>
          </section>

          <section className="privacy-card">
            <h2>2. Какие данные мы собираем</h2>
            <p>В рамках работы платформы мы можем собирать следующие данные:</p>
            <ul>
              <li>имя пользователя (username);</li>
              <li>адрес электронной почты (email);</li>
              <li>пароль (хранится в зашифрованном/хешированном виде);</li>
              <li>данные профиля (например: аватар, описание «О себе»);</li>
              <li>данные активности (прогресс, достижения, выполненные задания).</li>
            </ul>
          </section>

          <section className="privacy-card">
            <h2>3. Как мы используем данные</h2>
            <p>Собранные данные используются для:</p>
            <ul>
              <li>создания и управления учетной записью;</li>
              <li>предоставления доступа к функционалу платформы;</li>
              <li>отображения прогресса и результатов обучения;</li>
              <li>улучшения качества сервиса и пользовательского опыта;</li>
              <li>обеспечения безопасности и предотвращения злоупотреблений.</li>
            </ul>
          </section>

          <section className="privacy-card">
            <h2>4. Хранение и защита</h2>
            <p>
              Мы принимаем разумные меры для защиты данных от несанкционированного доступа,
              изменения или утечки. Пароли не хранятся в открытом виде.
            </p>
          </section>

          <section className="privacy-card">
            <h2>5. Передача третьим лицам</h2>
            <p>
              Мы не продаём и не передаём персональные данные третьим лицам, за исключением случаев,
              когда это требуется по закону.
            </p>
          </section>

          <section className="privacy-card">
            <h2>6. Cookie и технические данные</h2>
            <p>
              Сайт может использовать cookie и аналогичные технологии для корректной работы,
              авторизации и улучшения пользовательского опыта.
            </p>
          </section>

          <section className="privacy-card">
            <h2>7. Изменения политики</h2>
            <p>
              Политика может обновляться. Актуальная версия всегда доступна на этой странице.
            </p>
          </section>

          <section className="privacy-card privacy-contact">
            <h2>8. Контакты</h2>
            <p>Если у вас есть вопросы по обработке данных, свяжитесь с нами:</p>
            <a className="privacy-email" href="mailto:support@cyberlearn.io">
              <Mail size={18} />
              support@cyberlearn.io
            </a>
          </section>

          <div className="privacy-bottom-actions">
            <button className="privacy-secondary" onClick={() => navigate('/')}>
              На главную
            </button>
            <button className="privacy-primary" onClick={() => navigate('/terms-of-use')}>
              Перейти к условиям использования
            </button>
          </div>
        </div>
      </main>

      <footer className="privacy-footer">
        <div className="privacy-footer-container">
          <div className="privacy-footer-bottom">
            <p>© 2024 CyberLearn. Все права защищены.</p>
            <div className="privacy-footer-legal">
              <button onClick={() => navigate('/privacy-policy')}>Политика конфиденциальности</button>
              <button onClick={() => navigate('/terms-of-use')}>Условия использования</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
