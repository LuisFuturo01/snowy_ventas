import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

const generateRandomString = (length) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const CustomCaptcha = forwardRef(({ onValidate }, ref) => {
  const canvasRef = useRef(null);
  const [captchaText, setCaptchaText] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState(false);

  const drawCaptcha = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const text = generateRandomString(6);
    setCaptchaText(text);
    
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Background
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Noise Lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255}, 0.5)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }

    // Noise Dots
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${Math.random()*255},${Math.random()*255},${Math.random()*255}, 0.5)`;
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Text
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw characters with slight rotation
    for (let i = 0; i < text.length; i++) {
      ctx.save();
      ctx.translate(20 + i * 20, canvas.height / 2);
      ctx.rotate((Math.random() - 0.5) * 0.4);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
  };

  useEffect(() => {
    drawCaptcha();
  }, []);

  useImperativeHandle(ref, () => ({
    validate: () => {
      if (inputValue === captchaText) {
        setError(false);
        return true;
      }
      setError(true);
      drawCaptcha();
      setInputValue('');
      return false;
    },
    reset: () => {
      drawCaptcha();
      setInputValue('');
      setError(false);
    }
  }));

  return (
    <div className="captcha-container" style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
        Verificacion de Seguridad
      </label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
        <canvas 
          ref={canvasRef} 
          width="140" 
          height="40" 
          style={{ borderRadius: '8px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
          onClick={drawCaptcha}
          title="Click para cambiar"
        />
        <button 
          type="button" 
          onClick={drawCaptcha}
          className="btn btn-secondary btn-sm"
          style={{ margin: 0, padding: '8px' }}
          title="Recargar Captcha"
        >
          ↻
        </button>
      </div>
      <input
        type="text"
        placeholder="Ingrese el codigo"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={{ borderColor: error ? '#ef4444' : undefined }}
        required
      />
      {error && <span style={{ fontSize: '12px', color: '#ef4444' }}>Codigo incorrecto. Intente de nuevo.</span>}
    </div>
  );
});

export default CustomCaptcha;
