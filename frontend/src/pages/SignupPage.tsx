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
      {showSuccess ? (
        <div style={{ width: '100%', maxWidth: '420px', animation: 'fadeIn 0.4s ease' }}>
          <div className="auth-card" style={{ padding: '40px 32px', textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.08)',
                color: 'var(--teal)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}
            >
              <CheckCircle size={32} />
            </div>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: 700,
                marginBottom: '10px',
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
              }}
            >
              Registration Sent
            </h1>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '28px',
              }}
            >
              Thank you for signing up, <strong>{form.firstName}</strong>. Your account is{' '}
              <span style={{ color: 'var(--teal)', fontWeight: 600 }}>pending approval</span> by an administrator.
              We'll notify you once you're cleared to log in.
            </p>

            <div
              style={{
                padding: '14px',
                borderRadius: '10px',
                background: 'var(--bg-main)',
                border: '1px solid var(--border)',
                marginBottom: '28px',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Account Email
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {form.email}
              </div>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary auth-btn"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Back to Login <ArrowRight size={16} style={{ marginLeft: '6px' }} />
            </button>
          </div>
        </div>
      ) : (
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
              Create Account
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
              Fill in your details to get started
            </p>
          </div>

          <div className="auth-card" style={{ padding: '28px' }}>
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              {/* First + Last name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label
                    htmlFor="firstName"
                    style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className="form-control auth-input"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    placeholder="Tyler"
                    autoComplete="given-name"
                    style={{ borderColor: errors.firstName ? 'var(--red)' : undefined }}
                  />
                  {errors.firstName && (
                    <span style={{ fontSize: '12px', color: 'var(--red)' }}>{errors.firstName}</span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label
                    htmlFor="lastName"
                    style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className="form-control auth-input"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Durden"
                    autoComplete="family-name"
                    style={{ borderColor: errors.lastName ? 'var(--red)' : undefined }}
                  />
                  {errors.lastName && (
                    <span style={{ fontSize: '12px', color: 'var(--red)' }}>{errors.lastName}</span>
                  )}
                </div>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label
                  htmlFor="email"
                  style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-control auth-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                  autoComplete="email"
                  style={{ borderColor: errors.email ? 'var(--red)' : undefined }}
                />
                {errors.email && (
                  <span style={{ fontSize: '12px', color: 'var(--red)' }}>{errors.email}</span>
                )}
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label
                  htmlFor="password"
                  style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}
                >
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    className="form-control auth-input"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    style={{
                      paddingRight: '42px',
                      borderColor: errors.password ? 'var(--red)' : undefined,
                    }}
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
                {errors.password && (
                  <span style={{ fontSize: '12px', color: 'var(--red)' }}>{errors.password}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label
                  htmlFor="confirmPassword"
                  style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}
                >
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    className="form-control auth-input"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    style={{
                      paddingRight: '42px',
                      borderColor: errors.confirmPassword ? 'var(--red)' : undefined,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
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
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span style={{ fontSize: '12px', color: 'var(--red)' }}>
                    {errors.confirmPassword}
                  </span>
                )}
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Sign up <ArrowRight size={16} style={{ marginLeft: '6px' }} />
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
              Already have an account?{' '}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;
