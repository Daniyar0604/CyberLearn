import { useNavigate, useLocation } from 'react-router-dom';

function Sidebar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'admin';

  async function logout() {
    const token = localStorage.getItem('token');
    const start = localStorage.getItem('session_start');

    if (token && start) {
      const diffMs = Date.now() - Number(start);
      const minutes = Math.floor(diffMs / 60000);

      if (minutes > 0) {
        try {
          await fetch('/api/users/add-study-time', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ minutes }),
            keepalive: true,
          });
        } catch (e) {
          // даже если запрос упал — logout всё равно должен отработать
          console.error('Failed to save study time on logout', e);
        }
      }
    }

    // очищаем локальные данные ПОСЛЕ сохранения времени
    localStorage.removeItem('session_start');
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    navigate('/login');
  }

  function isActive(path) {
    return location.pathname.startsWith(path);
  }

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">🛡️</div>
          <span>CyberLearn</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
        >
          Дашборд
        </button>

        <button
          className={`nav-item ${isActive('/vulnerabilities') ? 'active' : ''}`}
          onClick={() => navigate('/vulnerabilities')}
        >
          Уязвимости
        </button>

        <button
          className={`nav-item ${isActive('/theory') ? 'active' : ''}`}
          onClick={() => navigate('/theory')}
        >
          Теория
        </button>

        <button
          className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
        >
          Профиль
        </button>

        {isAdmin && (
          <button
            className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
            onClick={() => navigate('/admin')}
          >
            Админ-панель
          </button>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout" onClick={logout}>
          Выйти
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
