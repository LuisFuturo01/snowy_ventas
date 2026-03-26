import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import './ProductManager.css';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', unit: '', buy_price: '' });
  const [editingId, setEditingId] = useState(null);
  const [modal, setModal] = useState({ open: false });
  const navigate = useNavigate();

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const res = await api.get('/api/products');
    setProducts(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/api/products/${editingId}`, form);
        setModal({ open: true, type: 'success', title: 'Actualizado', message: 'Producto actualizado correctamente.',
          confirmText: 'Aceptar', onConfirm: () => setModal({ open: false }) });
      } else {
        await api.post('/api/products', form);
        setModal({ open: true, type: 'success', title: 'Creado', message: 'Producto creado exitosamente.',
          confirmText: 'Aceptar', onConfirm: () => setModal({ open: false }) });
      }
      setForm({ name: '', price: '', unit: '', buy_price: '' });
      setEditingId(null);
      fetchProducts();
    } catch (error) {
      setModal({ open: true, type: 'danger', title: 'Error', message: 'Error al guardar producto.',
        confirmText: 'Cerrar', onConfirm: () => setModal({ open: false }) });
    }
  };

  const handleEdit = (product) => {
    setForm({ name: product.name, price: product.price, unit: product.unit, buy_price: product.buy_price || '' });
    setEditingId(product.id);
  };

  const handleDelete = (id, name) => {
    setModal({
      open: true, type: 'danger', title: 'Eliminar Producto',
      message: `Estas seguro de eliminar "${name}"? Esta accion no se puede deshacer.`,
      confirmText: 'Si, eliminar', cancelText: 'Cancelar',
      onConfirm: async () => {
        await api.delete(`/api/products/${id}`);
        setModal({ open: true, type: 'success', title: 'Eliminado', message: 'Producto eliminado correctamente.',
          confirmText: 'Aceptar', onConfirm: () => setModal({ open: false }) });
        fetchProducts();
      },
      onCancel: () => setModal({ open: false })
    });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Reporte de Inventario - Snowy Ventas', 14, 20);
    doc.setFontSize(11);
    doc.text(`Fecha de generacion: ${new Date().toLocaleString()}`, 14, 28);

    const tableColumn = ["Nombre", "Unidad", "Costo (Bs)", "Precio (Bs)", "Stock Libre"];
    const tableRows = [];

    products.forEach(p => {
      const row = [
        p.name,
        p.unit,
        p.buy_price || '0.00',
        p.price,
        p.stock || '0'
      ];
      tableRows.push(row);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 168, 232] }
    });

    doc.save('Inventario_Snowy.pdf');
  };

  return (
    <div className="manager-page">
      <Modal {...modal} />
      <button className="btn-back" onClick={() => navigate('/dashboard')}>
        <Icon name="arrow-left" size={16} /> Volver
      </button>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2><Icon name="box" size={24} /> Gestion de Productos</h2>
        <button onClick={exportPDF} className="btn btn-outline" style={{ width: 'auto', marginTop: 0 }}>
          <Icon name="printer" size={16} /> Exportar Inventario (PDF)
        </button>
      </div>

      <div className="form-card card">
        <h3>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div><label>Nombre</label><input placeholder="Ej: Silla Gamer" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
            <div><label>Unidad</label><input placeholder="kg, unid, bolsa" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} required /></div>
          </div>
          <div className="grid-2">
            <div><label>Precio Venta (Bs)</label><input type="number" step="0.01" min="0" placeholder="Precio venta" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required /></div>
            <div><label>Precio Costo (Bs)</label><input type="number" step="0.01" min="0" placeholder="Precio compra" value={form.buy_price} onChange={e => setForm({...form, buy_price: e.target.value})} /></div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-success">{editingId ? 'Actualizar' : 'Guardar'}</button>
            {editingId && <button type="button" className="btn btn-secondary" onClick={() => {setEditingId(null); setForm({name:'', price:'', unit:'', buy_price:''});}}>Cancelar</button>}
          </div>
        </form>
      </div>

      <div className="table-responsive">
        <table>
          <thead><tr><th>Nombre</th><th>Unidad</th><th>Costo</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.name}</td><td>{p.unit}</td><td>Bs {p.buy_price || '-'}</td><td>Bs {p.price}</td>
                <td><span className={`badge ${p.stock < 10 ? 'badge-error' : 'badge-success'}`}>{p.stock || 0}</span></td>
                <td>
                  <button className="action-btn edit" onClick={() => handleEdit(p)}><Icon name="edit" size={16} /></button>
                  <button className="action-btn delete" onClick={() => handleDelete(p.id, p.name)}><Icon name="trash" size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManager;
