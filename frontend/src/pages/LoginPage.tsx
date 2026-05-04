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

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    (e as React.FormEvent<HTMLFormElement>).preventDefault();
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
    <div className="auth-container-v2">
      {/* Left Side: Hero */}
      <div className="auth-hero-side">
        <img src="/auth-hero.png" alt="EmpManager Hero" className="auth-hero-image" />
        <div className="auth-hero-content">
          <h2 className="auth-hero-title">
            Empowering Teams,<br />Driving Excellence
          </h2>
          <p className="auth-hero-subtitle">
            Experience the next generation of workforce management. Secure, scalable, and intuitive.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          <div style={{ marginBottom: '40px' }}>
            <h1 className="auth-v2-title">Welcome back</h1>
            <p className="auth-v2-subtitle">
              New to EmpManager? <Link to="/signup" className="auth-v2-link">Create an account</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="auth-v2-input-group">
              <label htmlFor="email" className="auth-v2-label">Email Address</label>
              <div className="auth-v2-input-wrapper">
                <input
                  id="email"
                  type="email"
                  className="auth-v2-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="auth-v2-input-group">
              <label htmlFor="password" className="auth-v2-label">Password</label>
              <div className="auth-v2-input-wrapper">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="auth-v2-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{ paddingRight: '48px' }}
                />
                <button
                  type="button"
                  className="auth-v2-eye"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
              <Turnstile
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                onSuccess={(token) => setCaptchaToken(token)}
                options={{ theme: 'dark' }}
              />
            </div>

            <button type="submit" className="auth-v2-btn" disabled={loading}>
              {loading ? (
                <><div className="spinner" style={{ width: '18px', height: '18px', borderTopColor: '#fff' }} /> Signing in...</>
              ) : (
                <>Sign in <ArrowRight size={18} /></>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
