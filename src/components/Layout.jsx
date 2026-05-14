import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
