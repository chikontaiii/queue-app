import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export default function Login({ theme, toggleTheme }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function handleLogin() {
    setErr(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      if (e.code === 'auth/popup-blocked') {
        setErr('Браузер заблокировал popup. Разреши всплывающие окна.');
      } else if (e.code !== 'auth/popup-closed-by-user') {
        setErr(e.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen" style={{ position: 'relative' }}>
      {/* Кнопка темы в правом верхнем углу */}
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        style={{ position: 'absolute', top: '20px', right: '20px' }}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      <div className="login-card">
        <div className="login-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="24" height="24">
            <path d="M4 6h16M4 12h10M4 18h6" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="login-title">Очередь на занятие</h1>
        <p className="login-sub">Войди через Google-аккаунт, чтобы занять место</p>

        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? <span className="btn-spinner" /> : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity="0.85"/>
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" opacity="0.7"/>
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity="0.55"/>
              </svg>
              Войти через Google
            </>
          )}
        </button>
        {err && <p className="error">{err}</p>}
      </div>
    </div>
  );
}