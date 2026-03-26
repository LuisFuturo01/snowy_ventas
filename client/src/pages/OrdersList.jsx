import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import './OrdersList.css';

const OrdersList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pendiente: 'badge-warning',
      completado: 'badge-success',
      cancelado: 'badge-error',
      cotizacion: 'badge-info',
      preparando: 'badge-info',
    };
    return map[status] || 'badge-info';
  };

  return (
    <div className="orders-page">
      <button className="btn-back" onClick={() => navigate('/dashboard')}>
        <Icon name="arrow-left" size={16} /> Volver
      </button>

      <div className="page-header">
        <h2><Icon name="bell" size={24} /> Pedidos Recibidos</h2>
      </div>

      <div className="orders-grid">
        {orders.map(order => (
          <div key={order.id} className="order-card" onClick={() => navigate(`/pedidos/${order.id}`)}>
            <div className="order-header">
              <span className="order-id">#{order.id}</span>
              <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
            </div>

            <h3 className="order-client">{order.client_name}</h3>

            <div className="order-footer">
              <span className="order-total">Bs {order.total_amount}</span>
              <span className={`badge ${getStatusBadge(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
          </div>
        ))}

        {orders.length === 0 && <p className="empty-state">No hay pedidos registrados.</p>}
      </div>
    </div>
  );
};

export default OrdersList;
