import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Icon from '../../components/Icon';
import './AccessLogs.css';

const AccessLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      // Asumimos que el token se maneja globalmente en los interceptores de Axios
      // Si usas localStorage directamente, asegúrate de enviarlo, ej: headers: { Authorization: `Bearer ${token}` }
      const token = localStorage.getItem('token');
      const response = await api.get('/api/logs/access', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(response.data);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Error al cargar los registros de acceso. Asegúrate de tener permisos de administrador.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getBrowserIcon = (userAgent) => {
    const ua = userAgent?.toLowerCase() || '';
    if (ua.includes('chrome')) return 'chrome';
    if (ua.includes('firefox')) return 'firefox';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'compass';
    if (ua.includes('edge')) return 'edge';
    return 'globe'; // fallback icon
  };

  const shortenUserAgent = (userAgent) => {
    if (!userAgent) return 'Desconocido';
    // Extraer solo la parte principal del navegador para que no ocupe tanto espacio
    const match = userAgent.match(/(firefox|msie|chrome|safari|trident|edge)\/?\s*(\d+)/i);
    if (match) {
        return `${match[1]} ${match[2]}`;
    }
    return userAgent.length > 30 ? userAgent.substring(0, 30) + '...' : userAgent;
  };

  return (
    <div className="access-logs-container">
      <div className="page-header">
        <div>
          <h1>Registro de Accesos</h1>
          <p>Supervisa los inicios y cierres de sesión del sistema</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchLogs} disabled={loading}>
          <Icon name="refresh-cw" size={16} className={loading ? 'spinning' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {error && (
        <div className="alert-error">
          <Icon name="alert-circle" size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="table-card">
        {loading ? (
          <div className="loading-state">
            <Icon name="loader" size={32} className="spinning" />
            <p>Cargando registros...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <Icon name="database" size={48} />
            <p>No hay registros de acceso disponibles.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Evento</th>
                  <th>Fecha y Hora</th>
                  <th>Dirección IP</th>
                  <th>Navegador / Dispositivo</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-small">
                          {log.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-info">
                          <span className="user-name">{log.user_name}</span>
                          <span className="user-email">{log.user_email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${log.event_type}`}>
                        {log.event_type === 'login' ? 'Ingreso' : 'Salida'}
                      </span>
                    </td>
                    <td className="date-cell">{formatDate(log.created_at)}</td>
                    <td className="ip-cell">
                      <code>{log.ip_address === '::1' ? '127.0.0.1 (Local)' : log.ip_address}</code>
                    </td>
                    <td>
                      <div className="browser-cell" title={log.browser}>
                        <Icon name={getBrowserIcon(log.browser)} size={16} />
                        <span>{shortenUserAgent(log.browser)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessLogs;
