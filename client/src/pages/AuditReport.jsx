import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './AuditReport.css';

const AuditReport = () => {
  const [data, setData] = useState({ expenses: [], sales: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState({ open: false });
  const navigate = useNavigate();

  useEffect(() => { fetchAudit(); }, []);

  const fetchAudit = async () => {
    try {
      const res = await api.get('/api/finance/audit');
      setData(res.data);
    } catch (err) {
      setError('Error cargando datos.');
    } finally { setLoading(false); }
  };

  const exportPDF = () => {
    const doc = new jsPDF('landscape');
    const now = new Date().toLocaleDateString();

    // Encabezado
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('SNOWY VENTAS - Reporte de Auditoria', 14, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Generado: ' + now, 14, 28);
    doc.line(14, 31, 280, 31);

    // Tabla de Gastos
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Salidas (Compras y Gastos)', 14, 40);

    autoTable(doc, {
      startY: 44,
      head: [['Fecha', 'Responsable', 'Rol', 'Concepto', 'Tipo', 'Monto (Bs)']],
      body: data.expenses.map(e => [
        new Date(e.date).toLocaleDateString(),
        e.responsable_name || '-',
        e.role_name || '-',
        e.description,
        e.type === 'compra_mercaderia' ? 'Mercaderia' : 'Operativo',
        '- ' + e.amount
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 168, 232], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 245, 250] },
      margin: { left: 14 }
    });

    // Tabla de Ventas
    const afterExpenses = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Historial de Ventas y Pedidos', 14, afterExpenses);

    autoTable(doc, {
      startY: afterExpenses + 4,
      head: [['Fecha', 'Cliente', 'Email', 'Atendido Por', 'Rol', 'Total (Bs)']],
      body: data.sales.map(s => [
        new Date(s.created_at).toLocaleDateString(),
        s.client_name || '-',
        s.client_email || '-',
        s.employee_name || 'Web/App',
        s.employee_role || 'Autoservicio',
        '+ ' + s.total_amount
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 214, 143], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 250, 245] },
      margin: { left: 14 }
    });

    // Pie de pagina
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text('Snowy Ventas - Pagina ' + i + ' de ' + pageCount, 14, doc.internal.pageSize.height - 10);
    }

    doc.save('Auditoria_Snowy_' + now.replace(/\//g, '-') + '.pdf');
    setModal({ open: true, type: 'success', title: 'PDF Generado', message: 'El reporte de auditoria se descargo correctamente.',
      confirmText: 'Aceptar', onConfirm: () => setModal({ open: false }) });
  };

  if (loading) return <div>Cargando datos...</div>;
  if (error) return <div className="alert-error">{error}</div>;

  return (
    <div className="audit-page">
      <Modal {...modal} />
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', gap:'10px', flexWrap:'wrap'}}>
        <button className="btn-back" onClick={() => navigate('/dashboard')} style={{marginBottom:0}}>
          <Icon name="arrow-left" size={16} /> Volver
        </button>
        <button className="btn btn-sm" onClick={exportPDF} style={{width:'auto', margin: 0}}>
          <Icon name="printer" size={16} /> Exportar PDF
        </button>
      </div>

      <div className="page-header"><h2><Icon name="search" size={24} /> Reporte de Auditoria</h2></div>

      <div className="audit-grid">
        <div className="card audit-panel">
          <h3><Icon name="dollar" size={18} /> Salidas ({data.expenses.length})</h3>
          <div className="table-responsive">
            <table>
              <thead><tr><th>Fecha</th><th>Responsable</th><th>Concepto</th><th>Monto</th></tr></thead>
              <tbody>
                {data.expenses.map(e => (
                  <tr key={e.id}>
                    <td>{new Date(e.date).toLocaleDateString()}</td>
                    <td><div className="cell-main">{e.responsable_name}</div><div className="cell-sub">{e.role_name}</div></td>
                    <td><div className="cell-main">{e.description}</div>
                      <span className={`badge ${e.type==='compra_mercaderia'?'badge-info':'badge-warning'}`}>{e.type==='compra_mercaderia'?'Mercaderia':'Operativo'}</span></td>
                    <td className="text-error">- Bs {e.amount}</td>
                  </tr>
                ))}
                {data.expenses.length === 0 && <tr><td colSpan="4" className="empty-state">Sin registros.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card audit-panel">
          <h3><Icon name="chart" size={18} /> Ventas ({data.sales.length})</h3>
          <div className="table-responsive">
            <table>
              <thead><tr><th>Fecha</th><th>Cliente</th><th>Atendido Por</th><th>Total</th></tr></thead>
              <tbody>
                {data.sales.map(s => (
                  <tr key={s.id}>
                    <td>{new Date(s.created_at).toLocaleDateString()}</td>
                    <td><div className="cell-main">{s.client_name}</div><div className="cell-sub">{s.client_email}</div></td>
                    <td>{s.employee_name ? (
                      <div className="employee-cell"><Icon name="user" size={14} /><div>
                        <div className="cell-main">{s.employee_name}</div>
                        <span className={`badge ${s.employee_role==='admin'?'badge-error':'badge-info'}`}>{s.employee_role}</span>
                      </div></div>
                    ) : (<div className="employee-cell"><Icon name="globe" size={14} /><div>
                        <div className="cell-main" style={{color:'#00d68f'}}>Web / App</div>
                        <div className="cell-sub">Autoservicio</div></div></div>
                    )}</td>
                    <td className="text-success">+ Bs {s.total_amount}</td>
                  </tr>
                ))}
                {data.sales.length === 0 && <tr><td colSpan="4" className="empty-state">Sin ventas.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditReport;
