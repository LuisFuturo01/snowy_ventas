export const checkPasswordStrength = (password) => {
  if (!password) return { label: '', color: 'transparent', width: '0%' };
  
  const hasNum = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasSym = /[^A-Za-z0-9]/.test(password);

  if (password.length >= 8 && hasNum && hasUpper && hasSym) {
    return { label: 'Fuerte', color: 'var(--success)', width: '100%' };
  } else if (password.length >= 8 && hasNum) {
    return { label: 'Medio', color: 'var(--warning)', width: '66%' };
  } else {
    return { label: 'Debil', color: 'var(--error)', width: '33%' };
  }
};
