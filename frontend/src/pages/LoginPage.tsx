import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLang();
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
              <label className="auth-v2-label">Email Address</label>
              <div className="auth-v2-input-wrapper">
                <input 
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
              <label className="auth-v2-label">Password</label>
              <div className="auth-v2-input-wrapper">
                <input 
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

          <div className="auth-v2-divider">Or continue with</div>

          <div className="auth-v2-social-grid">
            <button className="auth-v2-social-btn">
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" width="18" height="18" alt="Google" />
              Google
            </button>
            <button className="auth-v2-social-btn">
              <svg width="18" height="18" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
              Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
