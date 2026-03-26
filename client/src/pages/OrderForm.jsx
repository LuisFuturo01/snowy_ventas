import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import './OrderForm.css';

const OrderForm = ({ mode }) => {
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false });

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
    if (mode === 'venta-directa') loadClients();
  }, [mode]);

  const loadProducts = async () => {
    try {
      const res = await api.get('/api/products');
      setProducts(res.data);
      const initialCart = {};
      res.data.forEach(p => initialCart[p.id] = 0);
      setCart(initialCart);
    } catch (error) { console.error(error); }
  };

  const loadClients = async () => {
    try {
      const res = await api.get('/api/users/clients-list');
      setClients(res.data);
    } catch (error) { console.error(error); }
  };

  const updateQty = (id, delta) => {
    const product = products.find(p => p.id === id);
    setCart(prev => {
      const newQty = Math.max(0, (prev[id] || 0) + delta);
      // Validar stock en venta directa
      if (mode === 'venta-directa' && newQty > (product?.stock || 0)) {
        setModal({ open: true, type: 'warning', title: 'Stock Insuficiente',
          message: `Solo hay ${product.stock} unidades de "${product.name}" disponibles.`,
          confirmText: 'Entendido', onConfirm: () => setModal({ open: false }) });
        return prev;
      }
      return { ...prev, [id]: newQty };
    });
  };

  const calculateTotal = () => products.reduce((acc, p) => acc + (p.price * (cart[p.id] || 0)), 0);

  const handleAction = () => {
    const items = products.filter(p => cart[p.id] > 0).map(p => ({ id: p.id, quantity: cart[p.id], price: p.price, name: p.name }));
    if (items.length === 0) {
      setModal({ open: true, type: 'warning', title: 'Carrito Vacio', message: 'Agrega al menos un producto antes de continuar.',
        confirmText: 'Entendido', onConfirm: () => setModal({ open: false }) });
      return;
    }
    if (mode === 'cotizar') { window.print(); return; }
    if (mode === 'venta-directa' && !selectedClient) {
      setModal({ open: true, type: 'warning', title: 'Sin Cliente', message: 'Selecciona un cliente para la venta directa.',
        confirmText: 'Entendido', onConfirm: () => setModal({ open: false }) });
      return;
    }

    const actionLabel = mode === 'venta-directa' ? 'Registrar esta venta' : 'Enviar este pedido';
    setModal({
      open: true, type: 'confirm', title: 'Confirmar Accion',
      message: `${actionLabel} por Bs ${calculateTotal().toFixed(2)}?`,
      confirmText: 'Si, confirmar', cancelText: 'Cancelar',
      onConfirm: () => processOrder(items), onCancel: () => setModal({ open: false })
    });
  };

  const processOrder = async (items) => {
    setModal({ open: false });
    let finalClientId = user.id;
    let status = 'pendiente';
    if (mode === 'venta-directa') { finalClientId = selectedClient; status = 'completado'; }
    try {
      setLoading(true);
      await api.post('/api/orders', { client_id: finalClientId, items, total: calculateTotal(), status });
      setModal({ open: true, type: 'success', title: 'Exito!',
        message: mode === 'venta-directa' ? 'Venta registrada y stock descontado.' : 'Pedido enviado correctamente.',
        confirmText: 'Ir al Dashboard', onConfirm: () => navigate('/dashboard') });
    } catch (error) {
      setModal({ open: true, type: 'danger', title: 'Error',
        message: error.response?.data?.message || error.message,
        confirmText: 'Cerrar', onConfirm: () => setModal({ open: false }) });
    } finally { setLoading(false); }
  };

  const getTitle = () => {
    if (mode === 'pedido') return 'Nuevo Pedido';
    if (mode === 'cotizar') return 'Cotizador Rapido';
    return 'Punto de Venta (POS)';
  };
  const getIcon = () => {
    if (mode === 'pedido') return 'cart';
    if (mode === 'cotizar') return 'clipboard';
    return 'lightning';
  };

  return (
    <div className="order-page">
      <Modal {...modal} />
      <button className="btn-back no-print" onClick={() => navigate('/dashboard')}>
        <Icon name="arrow-left" size={16} /> Volver
      </button>
      <div className="page-header no-print"><h2><Icon name={getIcon()} size={24} /> {getTitle()}</h2></div>

      {mode === 'venta-directa' && (
        <div className="client-selector card no-print">
          <label><Icon name="user" size={16} /> Seleccionar Cliente:</label>
          <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)}>
            <option value="">-- Elige un cliente --</option>
            {clients.map(c => (<option key={c.id} value={c.id}>{c.name} ({c.email})</option>))}
          </select>
          <div className="client-link">
            <span onClick={() => navigate('/nuevo-cliente')}>Cliente nuevo? Registralo aqui</span>
          </div>
        </div>
      )}

      <div className="product-list">
        {products.map(p => (
          <div key={p.id} className={`product-card ${cart[p.id] > 0 ? 'has-items' : ''}`}>
            <div className="info">
              <h4>{p.name}</h4>
              <span className="price">Bs {p.price} <small>x {p.unit}</small></span>
              {mode === 'venta-directa' && (
                <div className={`stock-badge ${p.stock < 10 ? 'low' : ''}`}>Stock: {p.stock}</div>
              )}
            </div>
            <div className="controls">
              <button className="ctrl-btn minus" onClick={() => updateQty(p.id, -1)}>-</button>
              <span className="qty">{cart[p.id] || 0}</span>
              <button className="ctrl-btn plus" onClick={() => updateQty(p.id, 1)}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="floating-footer no-print">
        <div className="total">Total: Bs {calculateTotal().toFixed(2)}</div>
        <button className="btn" style={{width: 'auto', margin: 0}} onClick={handleAction} disabled={loading}>
          {loading ? 'Procesando...' : (
            <><Icon name={mode === 'cotizar' ? 'printer' : 'check'} size={16} />
              {mode === 'cotizar' ? 'Imprimir' : (mode === 'venta-directa' ? 'Cobrar y Finalizar' : 'Enviar Pedido')}</>
          )}
        </button>
      </div>
    </div>
  );
};

export default OrderForm;
