import { Turnstile } from '@marsidev/react-turnstile';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaToken) {
      toast.error('Please complete the CAPTCHA');
      return;
    }
    setLoading(true);
    try {
      await login(email, password, captchaToken);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
      setCaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              marginBottom: '6px',
              color: 'var(--text-primary)',
            }}
          >
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
            Enter your credentials to access your dashboard
          </p>
        </div>

        <div className="auth-card" style={{ padding: '28px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                htmlFor="email"
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="form-control auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                htmlFor="password"
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="form-control auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
              <Turnstile
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                onSuccess={(token) => setCaptchaToken(token)}
                options={{ theme: 'dark', size: 'normal' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary auth-btn"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? (
                <>
                  <div
                    className="spinner"
                    style={{ width: '16px', height: '16px', borderTopColor: 'var(--brand-text)' }}
                  />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                </>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border)',
              textAlign: 'center',
              fontSize: '14px',
              color: 'var(--text-muted)',
            }}
          >
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
