import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Icon from './Icon';
import logo from '../assets/logo.png';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const roleId = user?.role_id;
  const isAdmin = roleId === 1;
  const isEmployee = roleId === 2;

  const getRoleName = () => {
    if (isAdmin) return 'Administrador';
    if (isEmployee) return 'Empleado';
    return 'Cliente';
  };

  const navItems = [
    { path: '/dashboard', icon: 'grid', label: 'Dashboard', show: true },
    { divider: true, label: 'Ventas', show: true },
    { path: '/pedido', icon: 'cart', label: 'Realizar Pedido', show: true },
    { path: '/cotizar', icon: 'clipboard', label: 'Cotizador', show: true },
    { divider: true, label: 'Operaciones', show: isEmployee || isAdmin },
    { path: '/pedidos-lista', icon: 'bell', label: 'Bandeja de Pedidos', show: isEmployee || isAdmin },
    { path: '/venta-directa', icon: 'lightning', label: 'Venta Directa', show: isEmployee || isAdmin },
    { path: '/compras', icon: 'truck', label: 'Comprar / Restock', show: isEmployee || isAdmin },
    { path: '/nuevo-cliente', icon: 'user-plus', label: 'Nuevo Cliente', show: isEmployee || isAdmin },
    { path: '/productos', icon: 'box', label: 'Productos', show: isEmployee || isAdmin },
    { divider: true, label: 'Administracion', show: isAdmin },
    { path: '/contabilidad', icon: 'chart', label: 'Contabilidad', show: isAdmin },
    { path: '/usuarios', icon: 'users', label: 'Usuarios', show: isAdmin },
    { path: '/logs-acceso', icon: 'clock', label: 'Logs de Acceso', show: isAdmin },
    { path: '/auditoria', icon: 'search', label: 'Auditoria', show: isAdmin },
  ];

  const handleNav = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src={logo} alt="Snowy Ventas" className="sidebar-logo" />
          <span className="sidebar-title">Snowy Ventas</span>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <Icon name="x" size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.filter(item => item.show).map((item, i) => {
            if (item.divider) {
              return <div key={`div-${i}`} className="nav-divider"><span>{item.label}</span></div>;
            }
            return (
              <button
                key={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => handleNav(item.path)}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <Icon name="user" size={18} />
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{getRoleName()}</span>
            </div>
          </div>
          <button className="nav-item theme-toggle" onClick={toggleTheme}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
            <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </button>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <Icon name="logout" size={18} />
            <span>Cerrar Sesion</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar no-print">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            <Icon name="menu" size={22} />
          </button>
          <div className="topbar-right">
            <button className="theme-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
            </button>
            <span className="topbar-greeting">Hola, {user?.name}</span>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
