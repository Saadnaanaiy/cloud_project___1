import { Turnstile } from '@marsidev/react-turnstile';
import { ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignupPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
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
      const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`;
      await register(fullName, form.email, form.password, undefined, captchaToken);
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
    <div className="auth-container">
      <div className="auth-glow-1" />
      <div className="auth-glow-2" />

      {showSuccess ? (
        <div style={{ width: '100%', maxWidth: '480px', animation: 'fadeIn 0.5s ease' }}>
          <div className="auth-card" style={{ padding: '48px 40px', textAlign: 'center' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px', border: '2px solid rgba(16, 185, 129, 0.2)',
            }}>
              <CheckCircle size={40} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>
              Registration Sent!
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
              Thank you for signing up, <strong>{form.firstName}</strong>. Your account has been created and is currently{' '}
              <span style={{ color: 'var(--brand)', fontWeight: 600 }}>pending approval</span> by an administrator.
              <br /><br />
              We will notify you once you are cleared to log in.
            </p>

            <div style={{
              padding: '16px', borderRadius: '12px',
              background: 'var(--bg-main)', border: '1px solid var(--border)',
              marginBottom: '32px', textAlign: 'left',
            }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Account Email</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{form.email}</div>
            </div>

            <button onClick={() => navigate('/login')} className="btn btn-primary auth-btn" style={{ width: '100%', justifyContent: 'center' }}>
              Back to Login <ArrowRight size={18} style={{ marginLeft: '8px' }} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
              Create Account
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.5' }}>
              Register to manage your organization
            </p>
          </div>

          <div className="auth-card" style={{ padding: '32px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* First + Last name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    First name
                  </label>
                  <input
                    type="text"
                    className="form-control auth-input"
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    placeholder="Tyler"
                    style={{ borderColor: errors.firstName ? 'var(--red)' : undefined }}
                  />
                  {errors.firstName && <span style={{ fontSize: '12px', color: 'var(--red)', marginTop: '2px' }}>{errors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Last name
                  </label>
                  <input
                    type="text"
                    className="form-control auth-input"
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Durden"
                    style={{ borderColor: errors.lastName ? 'var(--red)' : undefined }}
                  />
                  {errors.lastName && <span style={{ fontSize: '12px', color: 'var(--red)', marginTop: '2px' }}>{errors.lastName}</span>}
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  className="form-control auth-input"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="projectmayhem@fc.com"
                  style={{ borderColor: errors.email ? 'var(--red)' : undefined }}
                />
                {errors.email && <span style={{ fontSize: '12px', color: 'var(--red)', marginTop: '2px' }}>{errors.email}</span>}
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-control auth-input"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    style={{ paddingRight: '44px', borderColor: errors.password ? 'var(--red)' : undefined }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                    }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span style={{ fontSize: '12px', color: 'var(--red)', marginTop: '2px' }}>{errors.password}</span>}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className="form-control auth-input"
                    value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    style={{ paddingRight: '44px', borderColor: errors.confirmPassword ? 'var(--red)' : undefined }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                    }}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <span style={{ fontSize: '12px', color: 'var(--red)', marginTop: '2px' }}>{errors.confirmPassword}</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
                <Turnstile
                  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                  onSuccess={(token) => setCaptchaToken(token)}
                  options={{ theme: 'dark' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-btn"
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
              >
                {loading ? (
                  <>
                    <div className="spinner" style={{ width: '18px', height: '18px', borderTopColor: 'var(--brand-text)' }} />
                    Creating account...
                  </>
                ) : (
                  <>
                    Sign up <ArrowRight size={18} style={{ marginLeft: '6px' }} />
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--purple)', fontWeight: 600, textDecoration: 'none' }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;
