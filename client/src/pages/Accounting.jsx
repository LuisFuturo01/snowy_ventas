import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Accounting.css';

const Accounting = () => {
  const [data, setData] = useState({ income: 0, outcome: 0, net: 0, recentExpenses: [] });
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', type: 'gasto_operativo' });
  const [modal, setModal] = useState({ open: false });
  const navigate = useNavigate();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { const res = await api.get('/api/finance/summary'); setData(res.data); }
    catch (error) { console.error(error); }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newExpense.description || !newExpense.amount) return;

    setModal({
      open: true, type: 'confirm', title: 'Registrar Gasto',
      message: 'Registrar egreso de Bs ' + newExpense.amount + ' por "' + newExpense.description + '"?',
      confirmText: 'Si, registrar', cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await api.post('/api/finance/expenses', newExpense);
          setNewExpense({ description: '', amount: '', type: 'gasto_operativo' });
          fetchData();
          setModal({ open: true, type: 'success', title: 'Registrado', message: 'Gasto registrado correctamente.',
            confirmText: 'Aceptar', onConfirm: () => setModal({ open: false }) });
        } catch (error) {
          setModal({ open: true, type: 'danger', title: 'Error', message: 'Error al registrar gasto.',
            confirmText: 'Cerrar', onConfirm: () => setModal({ open: false }) });
        }
      },
      onCancel: () => setModal({ open: false })
    });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const now = new Date().toLocaleDateString();

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SNOWY VENTAS - Reporte Contable', 14, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Generado: ' + now, 14, 28);
    doc.line(14, 31, 196, 31);

    // Resumen
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen Financiero', 14, 42);

    autoTable(doc, {
      startY: 46,
      head: [['Concepto', 'Monto (Bs)']],
      body: [
        ['Ingresos Totales (Ventas)', '+ ' + data.income.toFixed(2)],
        ['Egresos Totales (Gastos)', '- ' + data.outcome.toFixed(2)],
        ['Ganancia Neta', data.net.toFixed(2)],
      ],
      styles: { fontSize: 11 },
      headStyles: { fillColor: [0, 168, 232], textColor: 255 },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
    });

    // Detalle gastos
    const afterSummary = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalle de Gastos', 14, afterSummary);

    autoTable(doc, {
      startY: afterSummary + 4,
      head: [['Descripcion', 'Tipo', 'Monto (Bs)']],
      body: data.recentExpenses.map(exp => [
        exp.description,
        exp.type === 'compra_mercaderia' ? 'Mercaderia' : 'Operativo',
        '- ' + exp.amount
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [255, 77, 106], textColor: 255 },
      alternateRowStyles: { fillColor: [255, 245, 247] }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text('Snowy Ventas - Pagina ' + i + ' de ' + pageCount, 14, doc.internal.pageSize.height - 10);
    }

    doc.save('Contabilidad_Snowy_' + now.replace(/\//g, '-') + '.pdf');
    setModal({ open: true, type: 'success', title: 'PDF Generado', message: 'El reporte contable se descargo correctamente.',
      confirmText: 'Aceptar', onConfirm: () => setModal({ open: false }) });
  };

  return (
    <div className="accounting-page">
      <Modal {...modal} />
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', gap:'10px', flexWrap:'wrap'}}>
        <button className="btn-back" onClick={() => navigate('/dashboard')} style={{marginBottom:0}}>
          <Icon name="arrow-left" size={16} /> Volver
        </button>
        <button className="btn btn-sm" onClick={exportPDF} style={{width:'auto', margin: 0}}>
          <Icon name="printer" size={16} /> Exportar PDF
        </button>
      </div>

      <div className="page-header"><h2><Icon name="chart" size={24} /> Contabilidad General</h2></div>

      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-label">Ingresos Totales</div>
          <div className="stat-value">+ Bs {data.income.toFixed(2)}</div>
          <div className="stat-sub">Ventas completadas</div>
        </div>
        <div className="stat-card outcome">
          <div className="stat-label">Egresos / Gastos</div>
          <div className="stat-value">- Bs {data.outcome.toFixed(2)}</div>
          <div className="stat-sub">Gastos operativos y compras</div>
        </div>
        <div className="stat-card net">
          <div className="stat-label">Ganancia Neta</div>
          <div className="stat-value">Bs {data.net.toFixed(2)}</div>
          <div className="stat-sub">Balance en caja</div>
        </div>
      </div>

      <div className="content-split">
        <div className="card expense-form">
          <h3>Registrar Nuevo Gasto</h3>
          <form onSubmit={handleAddExpense}>
            <label>Descripcion</label>
            <input placeholder="Ej: Pago de Luz, Internet" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} required />
            <label>Monto (Bs)</label>
            <input type="number" step="0.01" placeholder="Monto del gasto" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} required />
            <label>Tipo de Gasto</label>
            <select value={newExpense.type} onChange={e => setNewExpense({...newExpense, type: e.target.value})}>
              <option value="gasto_operativo">Gasto Operativo</option>
              <option value="compra_mercaderia">Compra de Mercaderia</option>
            </select>
            <button className="btn btn-danger" type="submit" style={{marginTop:'16px'}}><Icon name="dollar" size={16} /> Registrar Egreso</button>
          </form>
        </div>

        <div className="card recent-list">
          <h3>Ultimos Gastos</h3>
          <ul>
            {data.recentExpenses.map(exp => (
              <li key={exp.id}>
                <div className="exp-info">
                  <span className="exp-desc">{exp.description}</span>
                  <span className="exp-type">{exp.type === 'compra_mercaderia' ? 'Mercaderia' : 'Operativo'}</span>
                </div>
                <span className="exp-amount">- Bs {exp.amount}</span>
              </li>
            ))}
            {data.recentExpenses.length === 0 && <p className="empty-state">No hay gastos registrados.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Accounting;
