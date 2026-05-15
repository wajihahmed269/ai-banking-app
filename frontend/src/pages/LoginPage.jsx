import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/authApi.js';
import { useAuth } from '../auth/AuthContext.jsx';
import AlertMessage from '../components/AlertMessage.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegisterMode = mode === 'register';

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    const nextUsername = username.trim();
    const nextPassword = password.trim();

    if (!nextUsername || !nextPassword) {
      setError('Username and password are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = isRegisterMode
        ? await register(nextUsername, nextPassword)
        : await login(nextUsername, nextPassword);

      if (!response.success) {
        setError(response.message || 'Authentication failed.');
        return;
      }

      signIn(nextUsername);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleMode() {
    setMode(isRegisterMode ? 'login' : 'register');
    setError('');
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-header">
          <p className="auth-brand">Zephyr</p>
          <h1 id="auth-title">{isRegisterMode ? 'Create account' : 'Sign in'}</h1>
        </div>

        <AlertMessage message={error} type="error" />

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field" htmlFor="username">
            <span>Username</span>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
            />
          </label>

          <label className="form-field" htmlFor="password">
            <span>Password</span>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
            />
          </label>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Please wait...'
              : isRegisterMode
                ? 'Create Account'
                : 'Login'}
          </button>
        </form>

        <button className="text-button" type="button" onClick={toggleMode}>
          {isRegisterMode
            ? 'Already have an account? Login'
            : 'Need an account? Register'}
        </button>
      </section>
    </main>
  );
}
