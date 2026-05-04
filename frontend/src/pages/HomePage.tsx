import React, { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
    ArrowRight,
    BarChart3,
    Clock,
    MessageSquare,
    ShieldCheck,
    TrendingUp,
    User,
    Users,
    Zap,
    LayoutDashboard,
    LogOut,
} from "lucide-react"

const APP_NAME = "EmpManager"
const PLATFORM_VERSION = "V2.0"

const HomePage: React.FC = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = useCallback(() => {
        logout()
        navigate("/login")
    }, [logout, navigate])

    const handleNavigate = useCallback(
        (path: string) => {
            navigate(path)
        },
        [navigate],
    )

    const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: #f1f5f9;
    }

    .hp-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    }

    .hp-navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 50;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(10px);
    }

    .hp-navbar-content {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 24px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .hp-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      background: none;
      border: none;
      color: inherit;
      font-size: 16px;
    }

    .hp-logo-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, #3b82f6, #a855f7);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 900;
      font-size: 14px;
    }

    .hp-nav-menu {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .hp-nav-links {
      display: none;
      align-items: center;
      gap: 24px;
      font-size: 14px;
      font-weight: 500;
      color: #94a3b8;
    }

    @media (min-width: 768px) {
      .hp-nav-links {
        display: flex;
      }
    }

    .hp-nav-links button {
      background: none;
      border: none;
      cursor: pointer;
      color: #94a3b8;
      transition: color 0.3s ease;
      font-size: 14px;
      padding: 0;
    }

    .hp-nav-links button:hover {
      color: #f1f5f9;
    }

    .hp-user-section {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(148, 163, 184, 0.1);
      padding: 4px 12px 4px 12px;
      border-radius: 9999px;
    }

    .hp-user-name {
      font-size: 12px;
      font-weight: 600;
      color: #94a3b8;
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .hp-logout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .hp-logout-btn:hover {
      background: #ef4444;
      color: white;
    }

    .hp-main {
      margin-top: 64px;
      padding: 48px 24px;
      max-width: 1280px;
      margin-left: auto;
      margin-right: auto;
    }

    .hp-hero {
      text-align: center;
      margin-bottom: 80px;
      animation: fadeIn 0.8s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .hp-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border-radius: 9999px;
      border: 1px solid rgba(148, 163, 184, 0.1);
      background: rgba(30, 41, 59, 0.5);
      padding: 8px 16px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.05em;
      color: #94a3b8;
      margin-bottom: 24px;
    }

    .hp-badge::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #14b8a6;
    }

    .hp-title {
      font-size: 48px;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 16px;
      line-height: 1.2;
    }

    @media (min-width: 640px) {
      .hp-title {
        font-size: 64px;
      }
    }

    .hp-highlight {
      background: linear-gradient(to right, #3b82f6, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hp-subtitle {
      font-size: 18px;
      color: #cbd5e1;
      max-width: 600px;
      margin: 32px auto 48px;
      line-height: 1.6;
    }

    .hp-cta-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      justify-content: center;
      margin-bottom: 80px;
    }

    .hp-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      height: 48px;
      padding: 0 32px;
      border-radius: 12px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 16px;
    }

    .hp-btn-primary {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
    }

    .hp-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 35px rgba(59, 130, 246, 0.4);
    }

    .hp-btn-secondary {
      background: rgba(30, 41, 59, 0.5);
      color: #f1f5f9;
      border: 1px solid rgba(148, 163, 184, 0.2);
    }

    .hp-btn-secondary:hover {
      background: rgba(30, 41, 59, 0.7);
      border-color: rgba(148, 163, 184, 0.3);
    }

    .hp-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
      margin-bottom: 80px;
    }

    .hp-stat-card {
      background: rgba(30, 41, 59, 0.3);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 16px;
      padding: 24px;
      transition: all 0.3s ease;
      animation: fadeIn 0.8s ease;
    }

    .hp-stat-card:hover {
      border-color: rgba(148, 163, 184, 0.2);
      background: rgba(30, 41, 59, 0.5);
      transform: translateY(-4px);
    }

    .hp-stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(59, 130, 246, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #3b82f6;
      margin-bottom: 12px;
    }

    .hp-stat-label {
      font-size: 14px;
      color: #94a3b8;
      margin-bottom: 8px;
    }

    .hp-stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #f1f5f9;
    }

    .hp-features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin-bottom: 80px;
    }

    .hp-feature-card {
      background: rgba(30, 41, 59, 0.3);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 16px;
      padding: 24px;
      transition: all 0.3s ease;
    }

    .hp-feature-card:hover {
      border-color: rgba(59, 130, 246, 0.3);
      background: rgba(30, 41, 59, 0.5);
      transform: translateY(-4px);
    }

    .hp-feature-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(59, 130, 246, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #3b82f6;
      margin-bottom: 12px;
    }

    .hp-feature-title {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #f1f5f9;
    }

    .hp-feature-desc {
      font-size: 14px;
      color: #cbd5e1;
    }

    .hp-preview {
      background: rgba(30, 41, 59, 0.3);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 80px;
    }

    .hp-preview-image {
      width: 100%;
      height: 400px;
      object-fit: cover;
      opacity: 0.8;
      display: block;
    }

    .hp-preview-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      border-top: 1px solid rgba(148, 163, 184, 0.1);
      background: rgba(30, 41, 59, 0.5);
    }

    .hp-preview-stat {
      padding: 20px;
      border-right: 1px solid rgba(148, 163, 184, 0.1);
    }

    .hp-preview-stat:last-child {
      border-right: none;
    }

    .hp-preview-stat-label {
      font-size: 12px;
      color: #94a3b8;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .hp-preview-stat-value {
      font-size: 24px;
      font-weight: 700;
      color: #f1f5f9;
    }

    .hp-cta-section {
      background: rgba(30, 41, 59, 0.3);
      border: 1px solid rgba(148, 163, 184, 0.1);
      border-radius: 16px;
      padding: 48px 24px;
      text-align: center;
      margin-bottom: 80px;
    }

    .hp-cta-title {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .hp-cta-desc {
      font-size: 16px;
      color: #cbd5e1;
      max-width: 500px;
      margin: 0 auto 24px;
    }

    .hp-footer {
      border-top: 1px solid rgba(148, 163, 184, 0.1);
      background: rgba(30, 41, 59, 0.3);
      padding: 32px 24px;
      margin-top: 80px;
    }

    .hp-footer-content {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    @media (min-width: 640px) {
      .hp-footer-content {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }

    .hp-footer-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
    }

    .hp-footer-brand-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, #3b82f6, #a855f7);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 900;
      font-size: 12px;
    }

    .hp-footer-links {
      display: flex;
      gap: 24px;
      font-size: 14px;
    }

    .hp-footer-links button {
      background: none;
      border: none;
      cursor: pointer;
      color: #94a3b8;
      transition: color 0.3s ease;
    }

    .hp-footer-links button:hover {
      color: #f1f5f9;
    }
  `

    return (
        <div className="hp-container">
            <style>{styles}</style>

            {/* Navbar */}
            <nav className="hp-navbar">
                <div className="hp-navbar-content">
                    <button
                        onClick={() => handleNavigate("/")}
                        className="hp-logo"
                    >
                        <div className="hp-logo-icon">E</div>
                        <span>{APP_NAME}</span>
                    </button>
                    <div className="hp-nav-menu">
                        <div className="hp-nav-links">
                            <button
                                onClick={() => handleNavigate("/dashboard")}
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => handleNavigate("/employees")}
                            >
                                Employees
                            </button>
                            <button onClick={() => handleNavigate("/reports")}>
                                Reports
                            </button>
                        </div>
                        <div className="hp-user-section">
                            <span className="hp-user-name">
                                {user?.name || "Guest"}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="hp-logout-btn"
                                aria-label="Logout"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="hp-main">
                {/* Hero Section */}
                <div className="hp-hero">
                    <div className="hp-badge">
                        Platform {PLATFORM_VERSION} is Live
                    </div>
                    <h1 className="hp-title">
                        Management{" "}
                        <span className="hp-highlight">Reimagined</span>
                    </h1>
                    <p className="hp-subtitle">
                        Welcome back, <strong>{user?.name}</strong>. Experience
                        the next generation of cloud-native employee management
                        with real-time insights and collaboration.
                    </p>
                    <div className="hp-cta-buttons">
                        <button
                            onClick={() => handleNavigate("/dashboard")}
                            className="hp-btn hp-btn-primary"
                        >
                            <LayoutDashboard size={18} />
                            Go to Dashboard
                            <ArrowRight size={18} />
                        </button>
                        <button
                            onClick={() => handleNavigate("/profile")}
                            className="hp-btn hp-btn-secondary"
                        >
                            <User size={18} />
                            View Profile
                        </button>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="hp-stats">
                    <div className="hp-stat-card">
                        <div className="hp-stat-icon">
                            <Users size={24} />
                        </div>
                        <div className="hp-stat-label">Active Employees</div>
                        <div className="hp-stat-value">2,145</div>
                    </div>
                    <div className="hp-stat-card">
                        <div className="hp-stat-icon">
                            <TrendingUp size={24} />
                        </div>
                        <div className="hp-stat-label">Monthly Growth</div>
                        <div className="hp-stat-value">+12.5%</div>
                    </div>
                    <div className="hp-stat-card">
                        <div className="hp-stat-icon">
                            <Clock size={24} />
                        </div>
                        <div className="hp-stat-label">Avg Attendance</div>
                        <div className="hp-stat-value">94.2%</div>
                    </div>
                    <div className="hp-stat-card">
                        <div className="hp-stat-icon">
                            <MessageSquare size={24} />
                        </div>
                        <div className="hp-stat-label">Total Messages</div>
                        <div className="hp-stat-value">8,234</div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="hp-features">
                    <div className="hp-feature-card">
                        <div className="hp-feature-icon">
                            <ShieldCheck size={20} />
                        </div>
                        <h3 className="hp-feature-title">
                            Enterprise Security
                        </h3>
                        <p className="hp-feature-desc">
                            Military-grade encryption & compliance
                        </p>
                    </div>
                    <div className="hp-feature-card">
                        <div className="hp-feature-icon">
                            <Zap size={20} />
                        </div>
                        <h3 className="hp-feature-title">Real-time Updates</h3>
                        <p className="hp-feature-desc">
                            Instant sync across all devices
                        </p>
                    </div>
                    <div className="hp-feature-card">
                        <div className="hp-feature-icon">
                            <BarChart3 size={20} />
                        </div>
                        <h3 className="hp-feature-title">Advanced Analytics</h3>
                        <p className="hp-feature-desc">
                            In-depth insights & reporting
                        </p>
                    </div>
                    <div className="hp-feature-card">
                        <div className="hp-feature-icon">
                            <Users size={20} />
                        </div>
                        <h3 className="hp-feature-title">Team Collaboration</h3>
                        <p className="hp-feature-desc">
                            Seamless communication tools
                        </p>
                    </div>
                    <div className="hp-feature-card">
                        <div className="hp-feature-icon">
                            <ShieldCheck size={20} />
                        </div>
                        <h3 className="hp-feature-title">Global Access</h3>
                        <p className="hp-feature-desc">
                            Available anywhere, anytime
                        </p>
                    </div>
                    <div className="hp-feature-card">
                        <div className="hp-feature-icon">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="hp-feature-title">
                            Performance Tracking
                        </h3>
                        <p className="hp-feature-desc">
                            Monitor growth & metrics
                        </p>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="hp-preview">
                    <img
                        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426"
                        alt="Dashboard Preview"
                        className="hp-preview-image"
                    />
                    <div className="hp-preview-stats">
                        <div className="hp-preview-stat">
                            <div className="hp-preview-stat-label">Uptime</div>
                            <div className="hp-preview-stat-value">99.9%</div>
                        </div>
                        <div className="hp-preview-stat">
                            <div className="hp-preview-stat-label">
                                Security
                            </div>
                            <div className="hp-preview-stat-value">100%</div>
                        </div>
                        <div className="hp-preview-stat">
                            <div className="hp-preview-stat-label">
                                Performance
                            </div>
                            <div className="hp-preview-stat-value">A+</div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="hp-cta-section">
                    <h2 className="hp-cta-title">Ready to get started?</h2>
                    <p className="hp-cta-desc">
                        Streamline your workforce management today and unlock
                        the full potential of your team.
                    </p>
                    <button
                        onClick={() => handleNavigate("/dashboard")}
                        className="hp-btn hp-btn-primary"
                        style={{ margin: "0 auto" }}
                    >
                        Enter Dashboard
                        <ArrowRight size={18} />
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer className="hp-footer">
                <div className="hp-footer-content">
                    <div className="hp-footer-brand">
                        <div className="hp-footer-brand-icon">E</div>
                        <span>{APP_NAME}</span>
                    </div>
                    <div className="hp-footer-links">
                        <button aria-label="Privacy">Privacy</button>
                        <button aria-label="Terms">Terms</button>
                        <button aria-label="Documentation">Docs</button>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default HomePage
