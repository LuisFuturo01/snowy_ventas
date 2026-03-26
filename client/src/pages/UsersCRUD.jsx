import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { checkPasswordStrength } from '../utils/passwordStrength';
import './ProductManager.css';

const UsersCRUD = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role_id: '2' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role_id: '', phone: '', currentPassword: '', newPassword: '' });
  const [passwordStrength, setPasswordStrength] = useState({ label: '', color: 'transparent', width: '0%' });
  const [modal, setModal] = useState({ open: false });
  const navigate = useNavigate();

  useEffect(() => { fetchUsers(); }, []);
  const fetchUsers = async () => { const res = await api.get('/api/users'); setUsers(res.data); };

  const validatePassword = (pwd) => {
    const errors = [];
    if (pwd.length < 8) errors.push('Minimo 8 caracteres');
    if (!/[A-Z]/.test(pwd)) errors.push('Al menos 1 mayuscula');
    if (!/[a-z]/.test(pwd)) errors.push('Al menos 1 minuscula');
    if (!/[0-9]/.test(pwd)) errors.push('Al menos 1 numero');
    if (!/[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]/.test(pwd)) errors.push('Al menos 1 caracter especial');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pwdErrors = validatePassword(form.password);
    if (pwdErrors.length > 0) {
      setModal({ open: true, type: 'warning', title: 'Contrasena Debil',
        message: 'Requisitos no cumplidos:\n- ' + pwdErrors.join('\n- '),
        confirmText: 'Entendido', onConfirm: () => setModal({ open: false }) });
      return;
    }
    try {
      await api.post('/api/users', form);
      setModal({ open: true, type: 'success', title: 'Usuario Creado', message: 'El usuario se creo exitosamente.',
        confirmText: 'Aceptar', onConfirm: () => setModal({ open: false }) });
      setForm({ name: '', email: '', password: '', role_id: '2' });
      setPasswordStrength({ label: '', color: 'transparent', width: '0%' });
      fetchUsers();
    } catch (error) {
      setModal({ open: true, type: 'danger', title: 'Error', message: error.response?.data?.message || 'Error al crear',
        confirmText: 'Cerrar', onConfirm: () => setModal({ open: false }) });
    }
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setEditForm({ name: u.name, email: u.email, role_id: u.role_id, phone: u.phone || '', currentPassword: '', newPassword: '' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (editForm.newPassword) {
      const pwdErrors = validatePassword(editForm.newPassword);
      if (pwdErrors.length > 0) {
        setModal({ open: true, type: 'warning', title: 'Contrasena Debil',
          message: 'La nueva contrasena no cumple:\n- ' + pwdErrors.join('\n- '),
          confirmText: 'Entendido', onConfirm: () => setModal({ open: false }) });
        return;
      }
      if (!editForm.currentPassword) {
        setModal({ open: true, type: 'warning', title: 'Verificacion Requerida',
          message: 'Para cambiar la contrasena, debes ingresar la contrasena actual.',
          confirmText: 'Entendido', onConfirm: () => setModal({ open: false }) });
        return;
      }
    }
    try {
      await api.put(`/api/users/${editingId}`, editForm);
      setModal({ open: true, type: 'success', title: 'Actualizado', message: 'Usuario actualizado correctamente.',
        confirmText: 'Aceptar', onConfirm: () => setModal({ open: false }) });
      setEditingId(null);
      fetchUsers();
    } catch (error) {
      setModal({ open: true, type: 'danger', title: 'Error', message: error.response?.data?.message || 'Error al actualizar',
        confirmText: 'Cerrar', onConfirm: () => setModal({ open: false }) });
    }
  };

  const handleDelete = (id, name) => {
    setModal({
      open: true, type: 'danger', title: 'Eliminar Usuario',
      message: `Eliminar a "${name}"? Esta accion no se puede deshacer.`,
      confirmText: 'Si, eliminar', cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await api.delete(`/api/users/${id}`);
          setModal({ open: true, type: 'success', title: 'Eliminado', message: 'Usuario eliminado.',
            confirmText: 'Aceptar', onConfirm: () => setModal({ open: false }) });
          fetchUsers();
        } catch (error) {
          setModal({ open: true, type: 'danger', title: 'Error', message: error.response?.data?.message || 'Error',
            confirmText: 'Cerrar', onConfirm: () => setModal({ open: false }) });
        }
      },
      onCancel: () => setModal({ open: false })
    });
  };

  const getRoleName = (id) => { if(id===1) return 'Admin'; if(id===2) return 'Empleado'; return 'Cliente'; };
  const getRoleBadge = (id) => { if(id===1) return 'badge-error'; if(id===2) return 'badge-info'; return 'badge-success'; };

  return (
    <div className="manager-page">
      <Modal {...modal} />
      <button className="btn-back" onClick={() => navigate('/dashboard')}><Icon name="arrow-left" size={16} /> Volver</button>
      <div className="page-header"><h2><Icon name="users" size={24} /> Gestion de Usuarios</h2></div>

      {/* Formulario edicion */}
      {editingId && (
        <div className="card form-card" style={{borderColor: '#00A8E8', marginBottom: '24px'}}>
          <h3>Editar Usuario (ID: {editingId})</h3>
          <form onSubmit={handleUpdate}>
            <div className="grid-2">
              <div><label>Nombre</label><input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required /></div>
              <div><label>Rol</label>
                <select value={editForm.role_id} onChange={e => setEditForm({...editForm, role_id: parseInt(e.target.value)})}>
                  <option value="1">Administrador</option><option value="2">Empleado</option><option value="3">Cliente</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div><label>Email</label><input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} required /></div>
              <div><label>Telefono</label><input value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} placeholder="Opcional" /></div>
            </div>
            <hr style={{border: 'none', borderTop: '1px solid #2a3a4a', margin: '16px 0'}} />
            <p style={{fontSize: '0.85rem', color: '#8b9bb0', marginBottom: '8px'}}>Cambiar contrasena (opcional):</p>
            <div className="grid-2">
              <div><label>Contrasena Actual</label><input type="password" value={editForm.currentPassword} onChange={e => setEditForm({...editForm, currentPassword: e.target.value})} placeholder="Requerida para cambio" /></div>
              <div><label>Nueva Contrasena</label>
                <input type="text" value={editForm.newPassword}
                  onChange={e => { setEditForm({...editForm, newPassword: e.target.value}); setPasswordStrength(checkPasswordStrength(e.target.value)); }}
                  placeholder="Min. 8, A-z, #, 123" />
                {editForm.newPassword && (
                  <div className="password-strength">
                    <div className="strength-bar"><div className="strength-fill" style={{width: passwordStrength.width, background: passwordStrength.color}} /></div>
                    <div className="strength-text" style={{color: passwordStrength.color, fontWeight: 'bold'}}>{passwordStrength.label}</div>
                  </div>
                )}
              </div>
            </div>
            <div className="btn-group">
              <button type="submit" className="btn btn-success">Guardar Cambios</button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingId(null)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Formulario nuevo */}
      {!editingId && (
        <div className="card form-card">
          <h3>Registrar Nuevo Usuario</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div><label>Nombre Completo</label><input placeholder="Nombre" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div><label>Rol</label>
                <select value={form.role_id} onChange={e => setForm({...form, role_id: parseInt(e.target.value)})}>
                  <option value="1">Administrador</option><option value="2">Empleado</option><option value="3">Cliente</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div><label>Email</label><input type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required /></div>
              <div><label>Contrasena</label>
                <input type="text" placeholder="Min. 8, A-z, #, 123" value={form.password}
                  onChange={e => { setForm({...form, password: e.target.value}); setPasswordStrength(checkPasswordStrength(e.target.value)); }} required />
                {form.password && (
                  <div className="password-strength">
                    <div className="strength-bar"><div className="strength-fill" style={{width: passwordStrength.width, background: passwordStrength.color}} /></div>
                    <div className="strength-text" style={{color: passwordStrength.color, fontWeight: 'bold'}}>{passwordStrength.label}</div>
                  </div>
                )}
              </div>
            </div>
            <button type="submit" className="btn btn-success" style={{marginTop:'16px'}}>Crear Usuario</button>
          </form>
        </div>
      )}

      <div className="table-responsive">
        <table>
          <thead><tr><th>ID</th><th>Nombre</th><th>Rol</th><th>Email</th><th>Acciones</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td><td>{u.name}</td>
                <td><span className={`badge ${getRoleBadge(u.role_id)}`}>{getRoleName(u.role_id)}</span></td>
                <td>{u.email}</td>
                <td>
                  <button className="action-btn edit" onClick={() => startEdit(u)}><Icon name="edit" size={16} /></button>
                  <button className="action-btn delete" onClick={() => handleDelete(u.id, u.name)}><Icon name="trash" size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersCRUD;
