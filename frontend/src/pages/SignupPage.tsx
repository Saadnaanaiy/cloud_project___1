import { Turnstile } from '@marsidev/react-turnstile';
import { ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleOptions = [
  { value: 'hr', label: 'HR Manager' },
  { value: 'manager', label: 'Department Manager' },
  { value: 'admin', label: 'Administrator' },
];

const SignupPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'hr' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!captchaToken) {
      toast.error('Please complete the CAPTCHA');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role, captchaToken);
      setShowSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed';
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
            Your Organization,<br />Perfectly Managed
          </h2>
          <p className="auth-hero-subtitle">
            Join thousands of managers who trust EmpManager for their daily operations.
          </p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="auth-form-side">
        <div className="auth-form-container">
          {showSuccess ? (
            <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.06)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <CheckCircle size={40} />
              </div>
              <h1 className="auth-v2-title">Registration Sent!</h1>
              <p className="auth-v2-subtitle" style={{ marginBottom: '32px' }}>
                Thank you for signing up. Your account is currently pending approval by an administrator.
              </p>
              <button onClick={() => navigate('/login')} className="auth-v2-btn">
                Back to Login <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '40px' }}>
                <h1 className="auth-v2-title">Create an account</h1>
                <p className="auth-v2-subtitle">
                  Already have an account? <Link to="/login" className="auth-v2-link">Log in</Link>
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="auth-v2-input-group">
                  <label className="auth-v2-label">Full Name</label>
                  <div className="auth-v2-input-wrapper">
                    <input
                      type="text"
                      className="auth-v2-input"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  {errors.name && <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.name}</span>}
                </div>

                <div className="auth-v2-input-group">
                  <label className="auth-v2-label">Email Address</label>
                  <div className="auth-v2-input-wrapper">
                    <input
                      type="email"
                      className="auth-v2-input"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="name@company.com"
                      required
                    />
                  </div>
                  {errors.email && <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.email}</span>}
                </div>

                <div className="auth-v2-input-group">
                  <label className="auth-v2-label">Role</label>
                  <div className="auth-v2-input-wrapper">
                    <select
                      className="auth-v2-input"
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                      style={{ appearance: 'none' }}
                    >
                      {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                </div>

                <div className="auth-v2-input-group">
                  <label className="auth-v2-label">Password</label>
                  <div className="auth-v2-input-wrapper">
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="auth-v2-input"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="Min. 6 characters"
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
                  {errors.password && <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.password}</span>}
                </div>

                <div className="auth-v2-input-group">
                  <label className="auth-v2-label">Confirm Password</label>
                  <div className="auth-v2-input-wrapper">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      className="auth-v2-input"
                      value={form.confirmPassword}
                      onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Repeat password"
                      required
                      style={{ paddingRight: '48px' }}
                    />
                    <button
                      type="button"
                      className="auth-v2-eye"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span style={{ fontSize: '12px', color: '#ef4444' }}>{errors.confirmPassword}</span>}
                </div>

                <div className="auth-v2-checkbox-group">
                  <input type="checkbox" className="auth-v2-checkbox" required id="terms" />
                  <label htmlFor="terms">I agree to the <span className="auth-v2-link" style={{ cursor: 'pointer' }}>Terms & Conditions</span></label>
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
                    <><div className="spinner" style={{ width: '18px', height: '18px', borderTopColor: '#fff' }} /> Creating account...</>
                  ) : (
                    <>Create account <ArrowRight size={18} /></>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
