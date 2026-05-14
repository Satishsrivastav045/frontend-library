import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // ✅ TOKEN REMOVE
    localStorage.removeItem('adminToken');

    // ✅ REDIRECT TO LOGIN
    navigate('/admin');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">Library Name</div>

      <NavLink to="/student-booking" className="sidebar__cta">
        <span className="sidebar__icon">＋</span>
        <span>Add Student</span>
      </NavLink>

      <nav className="sidebar__nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <span className="sidebar__icon">⌂</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/students"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <span className="sidebar__icon">▣</span>
          <span>Students</span>
        </NavLink>

        <NavLink
          to="/shifts"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <span className="sidebar__icon">▤</span>
          <span>Shifts</span>
        </NavLink>

        <NavLink
          to="/seats"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <span className="sidebar__icon">▥</span>
          <span>Seats</span>
        </NavLink>

        <NavLink
          to="/bookings"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <span className="sidebar__icon">◫</span>
          <span>Bookings</span>
        </NavLink>

        <NavLink
          to="/payments"
          className={({ isActive }) =>
            `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
          }
        >
          <span className="sidebar__icon">₹</span>
          <span>Payments</span>
        </NavLink>
      </nav>

      <div className="sidebar__footer">
        <button onClick={handleLogout} className="sidebar__logout">
          <span className="sidebar__icon">↪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
