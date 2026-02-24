import Sidebar from './Sidebar';

function getUserFromStorage() {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch {
    return {};
  }
}

function AppLayout({ children }) {
  const user = getUserFromStorage();

  return (
    <div className="dashboard-page">
      <Sidebar user={user} />
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}

export default AppLayout;
