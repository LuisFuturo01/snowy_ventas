import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import './OrderForm.css';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [modal, setModal] = useState({ open: false });

  useEffect(() => { fetchOrder(); }, [id]);

  const fetchOrder = async () => {
    try { const res = await api.get(`/api/orders/${id}`); setOrder(res.data); }
    catch (error) { console.error(error); }
  };

  const changeStatus = (newStatus) => {
    const isComplete = newStatus === 'completado';
    const isCancel = newStatus === 'cancelado';

    setModal({
      open: true,
      type: isCancel ? 'danger' : 'confirm',
      title: isComplete ? 'Completar Pedido' : 'Cancelar Pedido',
      message: isComplete
        ? `Marcar el pedido #${id} como completado? Se descontara el stock.`
        : `Cancelar el pedido #${id}? Esta accion no se puede deshacer.`,
      confirmText: isComplete ? 'Si, completar' : 'Si, cancelar',
      cancelText: 'Volver',
      onConfirm: async () => {
        try {
          await api.put(`/api/orders/${id}/status`, { status: newStatus });
          setModal({
            open: true, type: 'success',
            title: isComplete ? 'Completado' : 'Cancelado',
            message: isComplete
              ? 'Pedido completado y stock descontado.'
              : 'Pedido cancelado correctamente.',
            confirmText: 'Aceptar',
            onConfirm: () => { setModal({ open: false }); fetchOrder(); }
          });
        } catch (error) {
          setModal({
            open: true, type: 'danger', title: 'Error',
            message: error.response?.data?.message || 'Error al actualizar el pedido',
            confirmText: 'Cerrar',
            onConfirm: () => setModal({ open: false })
          });
        }
      },
      onCancel: () => setModal({ open: false })
    });
  };

  if (!order) return <div className="order-page"><p>Cargando...</p></div>;

  const getStatusBadge = () => {
    if (order.status === 'completado') return 'badge-success';
    if (order.status === 'cancelado') return 'badge-error';
    return 'badge-warning';
  };

  return (
    <div className="order-page">
      <Modal {...modal} />
      <div className="no-print" style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', gap:'10px'}}>
        <button className="btn-back" onClick={() => navigate('/pedidos-lista')}>
          <Icon name="arrow-left" size={16} /> Volver
        </button>
        <button className="btn btn-sm" onClick={() => window.print()} style={{width:'auto', margin:0}}>
          <Icon name="printer" size={16} /> Imprimir Ticket
        </button>
      </div>

      <div className="ticket-view card">
        <h2 style={{textAlign:'center', marginBottom:'8px'}}>ORDEN #{order.id}</h2>
        <p style={{textAlign:'center', color:'var(--text-secondary, #8b9bb0)'}}>Cliente: <strong>{order.client_name}</strong></p>
        <p style={{textAlign:'center', fontSize:'0.85rem', color:'var(--text-muted, #5a6e82)', marginBottom:'20px'}}>{new Date(order.created_at).toLocaleString()}</p>

        <div className="table-responsive">
          <table>
            <thead><tr><th>Producto</th><th>Cant.</th><th style={{textAlign:'right'}}>Total</th></tr></thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.product_name}</td>
                  <td>{item.quantity} {item.unit}</td>
                  <td style={{textAlign:'right'}}>Bs {(item.quantity * item.price_at_moment).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{textAlign:'right', fontSize:'1.3rem', fontWeight:'bold', marginTop:'16px', color:'var(--accent, #00A8E8)'}}>
          TOTAL: Bs {order.total_amount}
        </div>
      </div>

      <div className="no-print" style={{marginTop:'24px'}}>
        <p style={{marginBottom:'12px'}}>
          Estado actual:
          <span className={`badge ${getStatusBadge()}`} style={{marginLeft:'8px'}}>{order.status.toUpperCase()}</span>
        </p>
        {order.status === 'pendiente' && (
          <div style={{display:'flex', gap:'12px', flexWrap:'wrap'}}>
            <button onClick={() => changeStatus('completado')} className="btn btn-success" style={{flex:1, maxWidth:'300px'}}>
              <Icon name="check" size={16} /> Marcar como Completado
            </button>
            <button onClick={() => changeStatus('cancelado')} className="btn btn-danger" style={{flex:1, maxWidth:'300px'}}>
              <Icon name="x" size={16} /> Cancelar Pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
