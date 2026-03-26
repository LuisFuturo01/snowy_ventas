import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon';
import { checkPasswordStrength } from '../utils/passwordStrength';
import './ProductManager.css';

const RegisterClient = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [created, setCreated] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({ label: '', color: 'transparent', width: '0%' });

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%&*_-+=';
    const all = uppercase + lowercase + numbers + special;

    // Garantizar al menos 1 de cada tipo
    let pass = '';
    pass += uppercase[Math.floor(Math.random() * uppercase.length)];
    pass += lowercase[Math.floor(Math.random() * lowercase.length)];
    pass += numbers[Math.floor(Math.random() * numbers.length)];
    pass += special[Math.floor(Math.random() * special.length)];

    // Rellenar hasta 12 caracteres
    for (let i = 4; i < 12; i++) {
      pass += all[Math.floor(Math.random() * all.length)];
    }

    // Mezclar los caracteres
    pass = pass.split('').sort(() => Math.random() - 0.5).join('');
    setForm({ ...form, password: pass });
    setPasswordStrength(checkPasswordStrength(pass));
  };

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
      alert('La contrasena no cumple los requisitos:\n- ' + pwdErrors.join('\n- '));
      return;
    }

    try {
      await api.post('/api/users/create-client', form);
      setCreated(form);
      setForm({ name: '', email: '', password: '', phone: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Error al crear cliente');
    }
  };

  const copyToClipboard = () => {
    const text = `Hola ${created.name}, bienvenido a Snowy Ventas.\nTus credenciales son:\nUsuario: ${created.email}\nContrasena: ${created.password}\n\nIngresa al login para comenzar.`;
    navigator.clipboard.writeText(text);
    alert('Datos copiados! Ahora pegalos en WhatsApp o Correo.');
  };

  return (
    <div className="manager-page">
      <button className="btn-back" onClick={() => navigate('/dashboard')}>
        <Icon name="arrow-left" size={16} /> Volver
      </button>

      <div className="page-header">
        <h2><Icon name="user-plus" size={24} /> Registrar Nuevo Cliente</h2>
      </div>

      {!created && (
        <div className="card form-card">
          <form onSubmit={handleSubmit}>
            <label>Nombre del Cliente / Empresa:</label>
            <input
              value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              required placeholder="Ej: Restaurante El Sol"
            />

            <label>Correo Electronico (Usuario):</label>
            <input
              type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
              required placeholder="cliente@gmail.com"
            />

            <label>Telefono (Opcional):</label>
            <input
              type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
              placeholder="Para contacto WhatsApp"
            />

            <label>Contrasena:</label>
            <div style={{display:'flex', gap:'10px', alignItems: 'flex-start'}}>
              <div style={{flex: 1}}>
                <input
                  type="text" value={form.password}
                  onChange={e => { setForm({...form, password: e.target.value}); setPasswordStrength(checkPasswordStrength(e.target.value)); }}
                  required placeholder="Min. 8, mayusc., minusc., #, 123"
                  style={{margin: 0}}
                />
                {form.password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div className="strength-fill" style={{ width: passwordStrength.width, background: passwordStrength.color }} />
                    </div>
                    <div className="strength-text" style={{ color: passwordStrength.color, fontWeight: 'bold' }}>
                      {passwordStrength.label}
                    </div>
                  </div>
                )}
              </div>
              <button type="button" onClick={generatePassword} className="btn btn-sm" style={{width:'auto', marginTop: 0, whiteSpace: 'nowrap'}}>
                <Icon name="dice" size={14} /> Generar
              </button>
            </div>

            <div className="password-rules" style={{fontSize: '0.75rem', color: '#5a6e82', marginTop: '8px'}}>
              Requisitos: min. 8 caracteres, 1 mayuscula, 1 minuscula, 1 numero, 1 caracter especial
            </div>

            <button type="submit" className="btn btn-success" style={{marginTop:'20px'}}>
              Registrar Cliente
            </button>
          </form>
        </div>
      )}

      {created && (
        <div className="card" style={{textAlign:'center', borderColor: 'var(--success, #00d68f)'}}>
          <h3 style={{color: '#00d68f', marginBottom: '12px'}}>Cliente Registrado con Exito!</h3>
          <p style={{color: '#8b9bb0', marginBottom: '20px'}}>Envia estos datos al cliente para que pueda ingresar:</p>

          <div className="card" style={{textAlign:'left', margin:'20px 0'}}>
            <p><strong>Nombre:</strong> {created.name}</p>
            <p style={{marginTop: '8px'}}><strong>Usuario/Email:</strong> {created.email}</p>
            <p style={{marginTop: '8px'}}><strong>Contrasena:</strong> {created.password}</p>
          </div>

          <div style={{display:'flex', gap:'10px', justifyContent:'center', flexWrap: 'wrap'}}>
            <button onClick={copyToClipboard} className="btn" style={{flex: 1, minWidth: '150px'}}>
              <Icon name="copy" size={16} /> Copiar Credenciales
            </button>
            <button onClick={() => setCreated(null)} className="btn btn-secondary" style={{flex: 1, minWidth: '150px'}}>
              Registrar Otro
            </button>
            <button onClick={() => navigate('/venta-directa')} className="btn btn-success" style={{flex: 1, minWidth: '150px'}}>
              <Icon name="cart" size={16} /> Ir a Venderle
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterClient;
