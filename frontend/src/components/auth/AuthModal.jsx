import { useCallback, useState } from 'react';
import { login, register } from '../../api/authApi';

export function AuthModal({ authMode, setAuthMode, closeAuth, enterDashboard, addToast }) {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const updateField = useCallback((field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setAuthError('');
    setAuthSuccess('');
  }, []);

  const switchMode = useCallback((mode) => {
    setAuthMode(mode);
    setAuthError('');
    setAuthSuccess('');
  }, [setAuthMode]);

  const submitAuth = useCallback(async (event) => {
    event.preventDefault();
    const username = form.username.trim();
    if (!username || !form.password) {
      setAuthError('Username and password are required.');
      return;
    }
    if (authMode === 'signup' && form.password !== form.confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');
    try {
      const result = authMode === 'signin'
        ? await login({ username, password: form.password })
        : await register({ username, password: form.password });
      addToast({ type: 'success', title: authMode === 'signin' ? 'Signed in' : 'Account created', message: 'Banking session is ready.' });
      enterDashboard(result.user || { username });
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed.');
    } finally {
      setAuthLoading(false);
    }
  }, [addToast, authMode, enterDashboard, form.confirmPassword, form.password, form.username]);

  return <div className="auth-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) closeAuth(); }}><section className="auth-modal glass" aria-modal="true" role="dialog"><button className="auth-close" onClick={closeAuth} type="button" aria-label="Close authentication modal">x</button><div className="auth-header"><div><h2>Welcome Back</h2><p>Sign in to continue to Zephyr.</p></div><div className="auth-tabs" role="tablist" aria-label="Authentication mode"><button className={authMode === 'signin' ? 'active' : ''} onClick={() => switchMode('signin')} type="button" role="tab" aria-selected={authMode === 'signin'}>Sign In</button><button className={authMode === 'signup' ? 'active' : ''} onClick={() => switchMode('signup')} type="button" role="tab" aria-selected={authMode === 'signup'}>Sign Up</button></div></div><div className="auth-panel" data-mode={authMode}><form className="auth-form" onSubmit={submitAuth}><label>Username<input type="text" value={form.username} onChange={(event) => updateField('username', event.target.value)} placeholder="wajih" autoComplete="username" /></label><label>Password<input type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} placeholder="Password" autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'} /></label>{authMode === 'signup' && <label>Confirm Password<input type="password" value={form.confirmPassword} onChange={(event) => updateField('confirmPassword', event.target.value)} placeholder="Confirm password" autoComplete="new-password" /></label>}{authMode === 'signin' && <div className="auth-row"><label className="check-row"><input type="checkbox" /> Remember me</label><span>JWT session</span></div>}{authError && <p className="auth-message error">{authError}</p>}{authSuccess && <p className="auth-message success">{authSuccess}</p>}<button className="btn btn-primary btn-auth-primary full-width" disabled={authLoading} type="submit"><span>{authLoading ? 'Working...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}</span><span className="btn-arrow" aria-hidden="true">&gt;</span></button><button className="btn btn-auth-secondary full-width" disabled type="button"><span className="google-icon" aria-hidden="true">G</span><span>Password auth</span></button><p className="auth-switch">{authMode === 'signin' ? 'New to Zephyr?' : 'Already have an account?'} <button onClick={() => switchMode(authMode === 'signin' ? 'signup' : 'signin')} type="button">{authMode === 'signin' ? 'Create an account' : 'Sign in'}</button></p></form></div></section></div>;
}
