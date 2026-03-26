import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import Icon from '../components/Icon';
import api from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chartData, setChartData] = useState([]);

  const roleId = user?.role_id;
  const isAdmin = roleId === 1;
  const isEmployee = roleId === 2;

  useEffect(() => {
    if (isAdmin) {
      api.get('/api/finance/summary')
        .then(res => {
          setChartData([
            { 
              name: 'Balance Global', 
              Ingresos: res.data.income || 0, 
              Gastos: res.data.outcome || 0 
            }
          ]);
        })
        .catch(console.error);
    }
  }, [isAdmin]);

  const menuItems = [
    {
      section: 'Ventas y Pedidos',
      show: true,
      items: [
        { icon: 'cart', title: 'Realizar Pedido', desc: 'Hacer un pedido oficial a la empresa', path: '/pedido', color: '#00A8E8' },
        { icon: 'clipboard', title: 'Cotizador', desc: 'Consultar precios y calcular total', path: '/cotizar', color: '#8b5cf6' },
      ]
    },
    {
      section: 'Operaciones',
      show: isEmployee || isAdmin,
      items: [
        { icon: 'bell', title: 'Bandeja de Pedidos', desc: 'Ver pedidos entrantes', path: '/pedidos-lista', color: '#f59e0b' },
        { icon: 'lightning', title: 'Venta Directa', desc: 'Registrar venta en mostrador', path: '/venta-directa', color: '#10b981' },
        { icon: 'truck', title: 'Comprar / Restock', desc: 'Registrar compra de productos', path: '/compras', color: '#6366f1' },
        { icon: 'user-plus', title: 'Nuevo Cliente', desc: 'Registrar y dar acceso', path: '/nuevo-cliente', color: '#ec4899' },
        { icon: 'box', title: 'Productos', desc: 'Gestionar catalogo', path: '/productos', color: '#14b8a6' },
      ]
    },
    {
      section: 'Administracion',
      show: isAdmin,
      items: [
        { icon: 'chart', title: 'Contabilidad', desc: 'Ver reporte de ingresos/egresos', path: '/contabilidad', color: '#22c55e' },
        { icon: 'users', title: 'Usuarios', desc: 'Gestionar empleados y clientes', path: '/usuarios', color: '#3b82f6' },
        { icon: 'search', title: 'Auditoria', desc: 'Ver quien registro cada movimiento', path: '/auditoria', color: '#a855f7' },
      ]
    }
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <h1>Bienvenido, {user?.name}</h1>
        <p>Selecciona una opcion para comenzar</p>
      </div>

      {isAdmin && chartData.length > 0 && (
        <div className="dashboard-section">
          <h3 className="section-title">Resumen Financiero</h3>
          <div className="card" style={{ height: 300, padding: '20px', marginBottom: '24px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} 
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
                <Legend />
                <Bar dataKey="Ingresos" fill="var(--success)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Gastos" fill="var(--error)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {menuItems.filter(s => s.show).map((section, i) => (
        <div key={i} className="dashboard-section">
          <h3 className="section-title">{section.section}</h3>
          <div className="dashboard-grid">
            {section.items.map((item, j) => (
              <div
                key={j}
                className="menu-card"
                onClick={() => navigate(item.path)}
              >
                <div className="card-icon" style={{ background: `${item.color}15` }}>
                  <Icon name={item.icon} size={24} />
                </div>
                <div className="card-body">
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
                <div className="card-arrow">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
