import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import CustomCaptcha from '../components/CustomCaptcha';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [wakeCountdown, setWakeCountdown] = useState(0);
  const [wakeStatus, setWakeStatus] = useState(''); // 'pinging' | 'awake' | 'error' | ''
  const wakeTimerRef = useRef(null);
  const captchaRef = useRef(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (wakeTimerRef.current) clearInterval(wakeTimerRef.current); };
  }, []);

  const handleWakeUp = useCallback(async () => {
    if (wakeCountdown > 0 || wakeStatus === 'pinging') return;
    setWakeStatus('pinging');
    try {
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      await fetch(`${baseURL}/ping`);
      setWakeStatus('awake');
    } catch {
      setWakeStatus('error');
    }
    // Start 60s countdown
    setWakeCountdown(60);
    wakeTimerRef.current = setInterval(() => {
      setWakeCountdown(prev => {
        if (prev <= 1) {
          clearInterval(wakeTimerRef.current);
          wakeTimerRef.current = null;
          setWakeStatus('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [wakeCountdown, wakeStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate CAPTCHA first
    if (captchaRef.current && !captchaRef.current.validate()) {
      return; // Stop if captcha fails
    }

    setLoading(true);
    const result = await login(email, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
      if (captchaRef.current) captchaRef.current.reset();
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="Snowy Ventas" className="login-logo" />
          <h1>Snowy Ventas</h1>
          <p>Ingresa a tu cuenta para continuar</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Correo electronico</label>
            <input
              id="email"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Contrasena</label>
            <input
              id="password"
              type="password"
              placeholder="Tu contrasena"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          
          <CustomCaptcha ref={captchaRef} />

          <button type="submit" className="btn login-btn" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {/* Easter egg: hidden wake-up button */}
        <div className="wake-easter">
          <button
            type="button"
            className={`wake-dot ${wakeStatus}`}
            onClick={handleWakeUp}
            aria-label="Despertar servidor"
            disabled={wakeCountdown > 0 || wakeStatus === 'pinging'}
          />
          {wakeCountdown > 0 && (
            <span className="wake-timer">{wakeCountdown}s</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
