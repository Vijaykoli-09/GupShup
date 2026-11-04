import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post, setToken, USE_MOCK } from '../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onLogin = async () => {
    if (!email.trim() || !password) return setError('Enter email and password');
    setBusy(true);
    try {
      const res = await post<{ accessToken: string }>('/api/admin/auth/login', {
        email: email.trim(),
        password,
      });
      setToken(res.accessToken);
      navigate('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="card login-card">
        <div className="brand" style={{ padding: 0, marginBottom: 6 }}>GUPSHUP</div>
        <p className="muted" style={{ marginTop: 0 }}>Admin sign in</p>
        <input
          placeholder="Email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(''); }}
          onKeyDown={e => e.key === 'Enter' && onLogin()}
        />
        {error && <div className="error">{error}</div>}
        <button style={{ width: '100%' }} onClick={onLogin} disabled={busy}>
          {busy ? 'Signing in...' : 'Login'}
        </button>
        {USE_MOCK && (
          <p className="muted" style={{ fontSize: 12 }}>
            Demo mode: admin@gupshup.com / admin123
          </p>
        )}
      </div>
    </div>
  );
}
