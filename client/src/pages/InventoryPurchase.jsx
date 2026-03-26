import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import './InventoryPurchase.css';

const InventoryPurchase = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product_id: '', quantity: '', total_cost: '' });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/products').then(res => setProducts(res.data)).catch(err => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.product_id) {
      setModal({ open: true, type: 'warning', title: 'Producto no seleccionado', message: 'Selecciona un producto para reponer.',
        confirmText: 'Entendido', onConfirm: () => setModal({ open: false }) });
      return;
    }

    const productName = products.find(p => p.id == form.product_id)?.name;

    setModal({
      open: true, type: 'confirm', title: 'Confirmar Compra',
      message: `Registrar compra de ${form.quantity} unidades de "${productName}" por Bs ${form.total_cost}?`,
      confirmText: 'Si, registrar', cancelText: 'Cancelar',
      onConfirm: () => processPurchase(productName),
      onCancel: () => setModal({ open: false })
    });
  };

  const processPurchase = async (productName) => {
    setModal({ open: false });
    try {
      setLoading(true);
      await api.post('/api/inventory/purchase', {
        ...form,
        description: `Compra Stock: ${productName} (${form.quantity} unid.)`
      });
      setModal({ open: true, type: 'success', title: 'Compra Registrada',
        message: 'Stock actualizado y gasto vinculado correctamente.',
        confirmText: 'Aceptar', onConfirm: () => setModal({ open: false }) });
      setForm({ product_id: '', quantity: '', total_cost: '' });
      const res = await api.get('/api/products');
      setProducts(res.data);
    } catch (error) {
      setModal({ open: true, type: 'danger', title: 'Error',
        message: error.response?.data?.message || 'Error desconocido',
        confirmText: 'Cerrar', onConfirm: () => setModal({ open: false }) });
    } finally { setLoading(false); }
  };

  return (
    <div className="purchase-page">
      <Modal {...modal} />
      <button className="btn-back" onClick={() => navigate('/dashboard')}>
        <Icon name="arrow-left" size={16} /> Volver
      </button>
      <div className="page-header"><h2><Icon name="truck" size={24} /> Registrar Compra de Mercaderia</h2></div>
      <p className="register-info">Registrando como: <strong>{user.name}</strong> ({user.role_id === 1 ? 'Admin' : 'Empleado'})</p>

      <div className="card form-card">
        <form onSubmit={handleSubmit}>
          <label>Producto a reponer:</label>
          <select value={form.product_id} onChange={e => setForm({...form, product_id: e.target.value})} required>
            <option value="">-- Seleccionar --</option>
            {products.map(p => (<option key={p.id} value={p.id}>{p.name} (Stock actual: {p.stock || 0})</option>))}
          </select>
          <label>Cantidad Comprada:</label>
          <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="Ej: 50" required />
          <label>Costo Total de la Compra (Bs):</label>
          <input type="number" step="0.01" value={form.total_cost} onChange={e => setForm({...form, total_cost: e.target.value})} placeholder="Cuanto dinero salio de caja?" required />
          <button className="btn btn-success" type="submit" disabled={loading} style={{marginTop:'20px'}}>
            <Icon name="check" size={16} /> {loading ? 'Procesando...' : 'Registrar Egreso y Subir Stock'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InventoryPurchase;
