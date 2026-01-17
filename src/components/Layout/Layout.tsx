import { NavLink, Outlet } from 'react-router-dom';
import { FileText, LayoutTemplate, Home } from 'lucide-react';
import './Layout.css';

export function Layout() {
  return (
    <div className="app-layout">
      <header className="header">
        <div className="container header-inner">
          <NavLink to="/" className="logo">
            <img src="/logo.png" alt="ContractDesk" className="logo-img" />
            <span>ContractDesk</span>
          </NavLink>

          <nav className="nav" aria-label="Main navigation">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Home size={18} />
              Dashboard
            </NavLink>
            <NavLink to="/blueprints" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <LayoutTemplate size={18} />
              Blueprints
            </NavLink>
            <NavLink to="/contracts" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} />
              Contracts
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p className="footer-text">© 2026 ContractDesk. Built by Shah Faisal</p>
        </div>
      </footer>
    </div>
  );
}
