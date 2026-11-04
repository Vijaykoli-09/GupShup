import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearToken } from '../api';

export default function Layout() {
  const navigate = useNavigate();
  const logout = () => {
    clearToken();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">GUPSHUP</div>
        <nav className="nav">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/users">Users</NavLink>
          <NavLink to="/reports">Reports</NavLink>
          <NavLink to="/messages">Messages</NavLink>
        </nav>
        <div className="spacer" />
        <button className="outline" onClick={logout}>Logout</button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
