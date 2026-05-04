import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
    ArrowRight,
    BarChart3,
    Clock,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Moon,
    ShieldCheck,
    Sun,
    TrendingUp,
    User,
    Users,
    Zap,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const APP_NAME = "EmpManager";
const PLATFORM_VERSION = "V2.0";

interface StatItem {
    id: string;
    icon: React.ElementType;
    label: string;
    value: string;
}

interface FeatureItem {
    id: string;
    icon: React.ElementType;
    title: string;
    desc: string;
}

interface MetricItem {
    id: string;
    label: string;
    value: string;
}

const STATS: StatItem[] = [
    { id: "active-employees", icon: Users, label: "Active Employees", value: "2,145" },
    { id: "monthly-growth", icon: TrendingUp, label: "Monthly Growth", value: "+12.5%" },
    { id: "avg-attendance", icon: Clock, label: "Avg Attendance", value: "94.2%" },
    { id: "total-messages", icon: MessageSquare, label: "Total Messages", value: "8,234" },
];

const FEATURES: FeatureItem[] = [
    { id: "enterprise-security", icon: ShieldCheck, title: "Enterprise Security", desc: "Military-grade encryption & compliance" },
    { id: "real-time-updates", icon: Zap, title: "Real-time Updates", desc: "Instant sync across all devices" },
    { id: "advanced-analytics", icon: BarChart3, title: "Advanced Analytics", desc: "In-depth insights & reporting" },
    { id: "team-collaboration", icon: Users, title: "Team Collaboration", desc: "Seamless communication tools" },
    { id: "global-access", icon: ShieldCheck, title: "Global Access", desc: "Available anywhere, anytime" },
    { id: "performance-tracking", icon: TrendingUp, title: "Performance Tracking", desc: "Monitor growth & metrics" },
];

const METRICS: MetricItem[] = [
    { id: "uptime", label: "Uptime", value: "99.9%" },
    { id: "security", label: "Security", value: "100%" },
    { id: "performance", label: "Performance", value: "A+" },
];

const NAV_LINKS = [
    { id: "nav-dashboard", label: "Dashboard", path: "/dashboard" },
    { id: "nav-employees", label: "Employees", path: "/employees" },
    { id: "nav-reports", label: "Reports", path: "/reports" },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

interface StatCardProps {
    stat: StatItem;
}

const StatCard: React.FC<StatCardProps> = ({ stat }) => {
    const Icon = stat.icon;
    return (
        <div className="glass-card p-6 animate-fade" style={{ transition: "transform 0.2s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
        >
            <div style={{
                width: "48px", height: "48px", borderRadius: "14px",
                background: "var(--bg-main)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "16px", boxShadow: "var(--shadow-sm)",
            }}>
                <Icon size={22} color="var(--blue)" />
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px" }}>
                {stat.label}
            </div>
            <div style={{ fontSize: "30px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
                {stat.value}
            </div>
        </div>
    );
};

interface FeatureCardProps {
    feature: FeatureItem;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => {
    const Icon = feature.icon;
    return (
        <div
            className="glass-card p-6 animate-fade"
            style={{ transition: "transform 0.2s, border-color 0.2s" }}
            onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = "translateY(-4px)";
                el.style.borderColor = "var(--blue)";
            }}
            onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.transform = "translateY(0)";
                el.style.borderColor = "var(--border)";
            }}
        >
            <div style={{
                width: "40px", height: "40px", borderRadius: "10px",
                background: "var(--bg-main)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "14px",
            }}>
                <Icon size={18} color="var(--blue)" />
            </div>
            <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "6px", color: "var(--text-primary)" }}>
                {feature.title}
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                {feature.desc}
            </p>
        </div>
    );
};

// ─── HomePage ──────────────────────────────────────────────────────────────────

const HomePage: React.FC = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = useCallback(() => {
        logout();
        navigate("/login");
    }, [logout, navigate]);

    const handleNavigate = useCallback(
        (path: string) => {
            navigate(path);
        },
        [navigate],
    );

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--text-primary)", transition: "background 0.2s, color 0.2s" }}>

            {/* ── Navbar ──────────────────────────────────────────────────────── */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
                borderBottom: "1px solid var(--border)",
                background: "var(--bg-surface)",
                backdropFilter: "blur(12px)",
                transition: "background 0.2s, border-color 0.2s",
            }}>
                <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

                    {/* Logo */}
                    <button
                        onClick={() => handleNavigate("/")}
                        style={{ display: "flex", alignItems: "center", gap: "10px", background: "transparent", border: "none", cursor: "pointer", color: "inherit" }}
                        aria-label="Go to home"
                    >
                        <div style={{
                            width: "32px", height: "32px", borderRadius: "8px",
                            background: "linear-gradient(135deg, var(--blue), var(--purple))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontWeight: 900, fontSize: "14px",
                        }}>
                            E
                        </div>
                        <span style={{ fontWeight: 600, fontSize: "15px", color: "var(--text-primary)" }}>{APP_NAME}</span>
                    </button>

                    {/* Right side */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

                        {/* Nav links – desktop only */}
                        <div className="hide-on-mobile" style={{ display: "flex", alignItems: "center", gap: "4px", marginRight: "8px" }}>
                            {NAV_LINKS.map((link) => (
                                <button
                                    key={link.id}
                                    id={link.id}
                                    onClick={() => handleNavigate(link.path)}
                                    style={{
                                        background: "transparent", border: "none", cursor: "pointer",
                                        padding: "6px 12px", borderRadius: "var(--radius-sm)",
                                        fontSize: "14px", fontWeight: 500,
                                        color: "var(--text-secondary)", fontFamily: "inherit",
                                        transition: "background 0.15s, color 0.15s",
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-surface-hover)";
                                        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                                    }}
                                >
                                    {link.label}
                                </button>
                            ))}
                        </div>

                        {/* Theme toggle */}
                        <button
                            className="btn btn-ghost btn-icon"
                            onClick={toggleTheme}
                            title="Toggle theme"
                            aria-label="Toggle theme"
                            style={{ color: "var(--text-secondary)" }}
                        >
                            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
                        </button>

                        {/* User pill */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            border: "1px solid var(--border)", background: "var(--bg-surface-hover)",
                            borderRadius: "999px", padding: "4px 8px 4px 10px",
                        }}>
                            <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {user?.name ?? "Guest"}
                            </span>
                            <button
                                onClick={handleLogout}
                                aria-label="Logout"
                                style={{
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    width: "28px", height: "28px", borderRadius: "50%",
                                    background: "rgba(239,68,68,0.1)", color: "var(--red)",
                                    border: "none", cursor: "pointer", transition: "background 0.2s, color 0.2s",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = "var(--red)";
                                    (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)";
                                    (e.currentTarget as HTMLButtonElement).style.color = "var(--red)";
                                }}
                            >
                                <LogOut size={13} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Main ──────────────────────────────────────────────────────────── */}
            <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "96px 24px 80px" }}>

                {/* Hero */}
                <section className="animate-fade" style={{ textAlign: "center", marginBottom: "72px" }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: "8px",
                        border: "1px solid var(--border)", background: "var(--bg-surface)",
                        borderRadius: "999px", padding: "6px 16px",
                        fontSize: "12px", fontWeight: 600, letterSpacing: "0.04em",
                        color: "var(--text-secondary)", marginBottom: "24px",
                        boxShadow: "var(--shadow-sm)",
                    }}>
                        <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--teal)", display: "inline-block" }} />
                        Platform {PLATFORM_VERSION} is Live
                    </div>

                    <h1 className="page-title" style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "20px" }}>
                        Management{" "}
                        <span style={{ background: "linear-gradient(135deg, var(--blue), var(--purple))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                            Reimagined
                        </span>
                    </h1>

                    <p style={{ fontSize: "17px", color: "var(--text-muted)", maxWidth: "580px", margin: "0 auto 32px", lineHeight: 1.7 }}>
                        Welcome back,{" "}
                        <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>{user?.name ?? "Guest"}</strong>.
                        {" "}Experience the next generation of cloud-native employee management with real-time insights and collaboration.
                    </p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", justifyContent: "center" }}>
                        <button
                            id="hero-dashboard-btn"
                            onClick={() => handleNavigate("/dashboard")}
                            className="btn btn-primary"
                            style={{ height: "46px", padding: "0 28px", fontSize: "15px", borderRadius: "12px" }}
                        >
                            <LayoutDashboard size={17} />
                            Go to Dashboard
                            <ArrowRight size={17} />
                        </button>
                        <button
                            id="hero-profile-btn"
                            onClick={() => handleNavigate("/profile")}
                            className="btn btn-ghost"
                            style={{ height: "46px", padding: "0 28px", fontSize: "15px", borderRadius: "12px" }}
                        >
                            <User size={17} />
                            View Profile
                        </button>
                    </div>
                </section>

                {/* Stats */}
                <section aria-label="Platform statistics" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "64px" }}>
                    {STATS.map((stat) => (
                        <StatCard key={stat.id} stat={stat} />
                    ))}
                </section>

                {/* Features */}
                <section aria-label="Platform features" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginBottom: "64px" }}>
                    {FEATURES.map((feature) => (
                        <FeatureCard key={feature.id} feature={feature} />
                    ))}
                </section>

                {/* Preview Banner */}
                <section aria-label="Platform preview" className="glass-card animate-fade" style={{ overflow: "hidden", marginBottom: "64px" }}>
                    <img
                        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426"
                        alt="EmpManager dashboard preview"
                        style={{ width: "100%", height: "clamp(220px, 35vw, 380px)", objectFit: "cover", display: "block", opacity: 0.9 }}
                    />
                    <div style={{
                        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                        borderTop: "1px solid var(--border)", background: "var(--bg-surface)",
                    }}>
                        {METRICS.map((metric, i) => (
                            <div
                                key={metric.id}
                                style={{
                                    padding: "20px",
                                    borderRight: i < METRICS.length - 1 ? "1px solid var(--border)" : "none",
                                }}
                            >
                                <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500, marginBottom: "6px" }}>{metric.label}</div>
                                <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>{metric.value}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section
                    aria-label="Call to action"
                    className="glass-card animate-fade"
                    style={{ padding: "56px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}
                >
                    {/* Soft glow blob */}
                    <div aria-hidden="true" style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "100%", height: "100%",
                        background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--blue) 8%, transparent) 0%, transparent 70%)",
                        pointerEvents: "none", zIndex: 0,
                    }} />
                    <div style={{ position: "relative", zIndex: 1 }}>
                        <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 700, color: "var(--text-primary)", marginBottom: "14px" }}>
                            Ready to get started?
                        </h2>
                        <p style={{ fontSize: "15px", color: "var(--text-muted)", maxWidth: "480px", margin: "0 auto 28px", lineHeight: 1.7 }}>
                            Streamline your workforce management today and unlock the full potential of your team.
                        </p>
                        <button
                            id="cta-dashboard-btn"
                            onClick={() => handleNavigate("/dashboard")}
                            className="btn btn-primary"
                            style={{ height: "46px", padding: "0 28px", fontSize: "15px", borderRadius: "12px" }}
                        >
                            Enter Dashboard
                            <ArrowRight size={17} />
                        </button>
                    </div>
                </section>
            </main>

            {/* ── Footer ────────────────────────────────────────────────────────── */}
            <footer style={{
                borderTop: "1px solid var(--border)",
                background: "var(--bg-surface)",
                padding: "28px 24px",
                transition: "background 0.2s, border-color 0.2s",
            }}>
                <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{
                            width: "28px", height: "28px", borderRadius: "8px",
                            background: "linear-gradient(135deg, var(--blue), var(--purple))",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontWeight: 900, fontSize: "12px",
                        }}>
                            E
                        </div>
                        <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)" }}>{APP_NAME}</span>
                    </div>

                    <div style={{ display: "flex", gap: "4px" }}>
                        {(["Privacy", "Terms", "Docs"] as const).map((label) => (
                            <button
                                key={label}
                                style={{
                                    background: "transparent", border: "none", cursor: "pointer",
                                    padding: "6px 10px", borderRadius: "var(--radius-sm)",
                                    fontSize: "13px", color: "var(--text-secondary)",
                                    fontFamily: "inherit", transition: "color 0.15s, background 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-surface-hover)";
                                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
