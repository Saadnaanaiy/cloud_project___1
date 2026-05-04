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

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-text-primary transition-colors duration-200">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-surface/90 backdrop-blur-md transition-colors duration-200">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => handleNavigate("/")}
                        className="flex items-center gap-3 bg-transparent border-none cursor-pointer text-inherit"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-black text-sm">
                            E
                        </div>
                        <span className="font-semibold text-text-primary">{APP_NAME}</span>
                    </button>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                            <button
                                className="bg-transparent border-none cursor-pointer text-text-secondary hover:text-text-primary transition-colors"
                                onClick={() => handleNavigate("/dashboard")}
                            >
                                Dashboard
                            </button>
                            <button
                                className="bg-transparent border-none cursor-pointer text-text-secondary hover:text-text-primary transition-colors"
                                onClick={() => handleNavigate("/employees")}
                            >
                                Employees
                            </button>
                            <button 
                                className="bg-transparent border-none cursor-pointer text-text-secondary hover:text-text-primary transition-colors"
                                onClick={() => handleNavigate("/reports")}
                            >
                                Reports
                            </button>
                        </div>
                        <div className="flex items-center gap-3 bg-surface-hover border border-border px-3 py-1.5 rounded-full">
                            <span className="text-xs font-semibold text-text-secondary max-w-[100px] truncate">
                                {user?.name || "Guest"}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center w-7 h-7 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border-none cursor-pointer"
                                aria-label="Logout"
                            >
                                <LogOut size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="mt-16 pt-12 pb-24 px-6 max-w-7xl mx-auto">
                {/* Hero Section */}
                <div className="text-center mb-20 animate-fade">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold tracking-wide text-text-secondary mb-6 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-teal-500" />
                        Platform {PLATFORM_VERSION} is Live
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4 leading-tight text-text-primary">
                        Management{" "}
                        <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                            Reimagined
                        </span>
                    </h1>
                    <p className="text-lg text-text-muted max-w-2xl mx-auto my-8 leading-relaxed">
                        Welcome back, <strong className="text-text-primary">{user?.name || "Guest"}</strong>. Experience
                        the next generation of cloud-native employee management
                        with real-time insights and collaboration.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center mb-20">
                        <button
                            onClick={() => handleNavigate("/dashboard")}
                            className="btn btn-primary h-12 px-8 text-base rounded-xl"
                        >
                            <LayoutDashboard size={18} />
                            Go to Dashboard
                            <ArrowRight size={18} />
                        </button>
                        <button
                            onClick={() => handleNavigate("/profile")}
                            className="btn btn-ghost h-12 px-8 text-base rounded-xl"
                        >
                            <User size={18} />
                            View Profile
                        </button>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    <div className="glass-card p-6 hover:-translate-y-1 transition-transform animate-fade">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                            <Users size={24} />
                        </div>
                        <div className="text-sm text-text-secondary mb-1">Active Employees</div>
                        <div className="text-3xl font-bold text-text-primary">2,145</div>
                    </div>
                    <div className="glass-card p-6 hover:-translate-y-1 transition-transform animate-fade" style={{ animationDelay: '100ms' }}>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                            <TrendingUp size={24} />
                        </div>
                        <div className="text-sm text-text-secondary mb-1">Monthly Growth</div>
                        <div className="text-3xl font-bold text-text-primary">+12.5%</div>
                    </div>
                    <div className="glass-card p-6 hover:-translate-y-1 transition-transform animate-fade" style={{ animationDelay: '200ms' }}>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                            <Clock size={24} />
                        </div>
                        <div className="text-sm text-text-secondary mb-1">Avg Attendance</div>
                        <div className="text-3xl font-bold text-text-primary">94.2%</div>
                    </div>
                    <div className="glass-card p-6 hover:-translate-y-1 transition-transform animate-fade" style={{ animationDelay: '300ms' }}>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                            <MessageSquare size={24} />
                        </div>
                        <div className="text-sm text-text-secondary mb-1">Total Messages</div>
                        <div className="text-3xl font-bold text-text-primary">8,234</div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                    {[
                        { icon: ShieldCheck, title: "Enterprise Security", desc: "Military-grade encryption & compliance" },
                        { icon: Zap, title: "Real-time Updates", desc: "Instant sync across all devices" },
                        { icon: BarChart3, title: "Advanced Analytics", desc: "In-depth insights & reporting" },
                        { icon: Users, title: "Team Collaboration", desc: "Seamless communication tools" },
                        { icon: ShieldCheck, title: "Global Access", desc: "Available anywhere, anytime" },
                        { icon: TrendingUp, title: "Performance Tracking", desc: "Monitor growth & metrics" },
                    ].map((feature, idx) => (
                        <div key={idx} className="glass-card p-6 hover:-translate-y-1 hover:border-blue-500/30 transition-all">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                                <feature.icon size={20} />
                            </div>
                            <h3 className="text-base font-semibold mb-2 text-text-primary">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-text-muted">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Preview Section */}
                <div className="glass-card overflow-hidden mb-20 shadow-md">
                    <img
                        src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426"
                        alt="Dashboard Preview"
                        className="w-full h-80 sm:h-96 object-cover opacity-90"
                    />
                    <div className="grid grid-cols-3 border-t border-border bg-surface">
                        <div className="p-5 border-r border-border">
                            <div className="text-xs text-text-secondary font-medium mb-1">Uptime</div>
                            <div className="text-2xl font-bold text-text-primary">99.9%</div>
                        </div>
                        <div className="p-5 border-r border-border">
                            <div className="text-xs text-text-secondary font-medium mb-1">Security</div>
                            <div className="text-2xl font-bold text-text-primary">100%</div>
                        </div>
                        <div className="p-5">
                            <div className="text-xs text-text-secondary font-medium mb-1">Performance</div>
                            <div className="text-2xl font-bold text-text-primary">A+</div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="glass-card p-12 text-center mb-10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 blur-3xl -z-10 pointer-events-none"></div>
                    
                    <h2 className="text-3xl font-bold mb-4 text-text-primary">Ready to get started?</h2>
                    <p className="text-base text-text-muted max-w-xl mx-auto mb-8">
                        Streamline your workforce management today and unlock
                        the full potential of your team.
                    </p>
                    <button
                        onClick={() => handleNavigate("/dashboard")}
                        className="btn btn-primary h-12 px-8 text-base rounded-xl mx-auto"
                    >
                        Enter Dashboard
                        <ArrowRight size={18} />
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border bg-surface py-8 px-6 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 font-semibold text-text-primary">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-black text-xs">
                            E
                        </div>
                        <span>{APP_NAME}</span>
                    </div>
                    <div className="flex gap-6 text-sm">
                        <button className="bg-transparent border-none cursor-pointer text-text-secondary hover:text-text-primary transition-colors">Privacy</button>
                        <button className="bg-transparent border-none cursor-pointer text-text-secondary hover:text-text-primary transition-colors">Terms</button>
                        <button className="bg-transparent border-none cursor-pointer text-text-secondary hover:text-text-primary transition-colors">Docs</button>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default HomePage
