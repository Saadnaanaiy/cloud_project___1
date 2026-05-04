import { ArrowRight, BarChart3, Clock, Globe, LayoutDashboard, LogOut, MessageSquare, ShieldCheck, TrendingUp, User, Users, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const APP_NAME = 'EmpManager' as const;
const PLATFORM_VERSION = 'V2.0' as const;

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
} as const;

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
} as const;

const STATS = [
  { icon: Users, label: 'Active Employees', value: '2,145', color: 'text-blue' },
  { icon: TrendingUp, label: 'Monthly Growth', value: '+12.5%', color: 'text-green' },
  { icon: Clock, label: 'Avg Attendance', value: '94.2%', color: 'text-amber' },
  { icon: MessageSquare, label: 'Total Messages', value: '8,234', color: 'text-purple' }
];

const FEATURES = [
  { icon: ShieldCheck, title: 'Enterprise Security', desc: 'Military-grade encryption & compliance' },
  { icon: Zap, title: 'Real-time Updates', desc: 'Instant sync across all devices' },
  { icon: BarChart3, title: 'Advanced Analytics', desc: 'In-depth insights & reporting' },
  { icon: Users, title: 'Team Collaboration', desc: 'Seamless communication tools' },
  { icon: Globe, title: 'Global Access', desc: 'Available anywhere, anytime' },
  { icon: TrendingUp, title: 'Performance Tracking', desc: 'Monitor growth & metrics' }
];

const StatCard = memo(({ icon: Icon, label, value, color }: typeof STATS[0]) => (
  <motion.div variants={ITEM_VARIANTS} className="group glass-card p-6 rounded-2xl hover:border-brand/30 transition-all">
    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-surface mb-4 group-hover:scale-110 transition-transform ${color}`}>
      <Icon size={24} />
    </div>
    <p className="text-text-secondary text-sm font-medium">{label}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </motion.div>
));

StatCard.displayName = 'StatCard';

const FeatureBox = memo(({ icon: Icon, title, desc }: typeof FEATURES[0]) => (
  <motion.div variants={ITEM_VARIANTS} className="glass-card p-6 rounded-2xl hover:border-brand/30 transition-all">
    <div className="h-10 w-10 rounded-lg bg-brand/10 flex items-center justify-center mb-4 text-brand">
      <Icon size={20} />
    </div>
    <h4 className="font-bold text-base mb-1">{title}</h4>
    <p className="text-text-secondary text-sm">{desc}</p>
  </motion.div>
));

FeatureBox.displayName = 'FeatureBox';

const Navbar = memo(({ user, onLogout, onNavigate }: { user: any; onLogout: () => void; onNavigate: (p: string) => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
    <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-6">
      <button onClick={() => onNavigate('/')} className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0" aria-label="Go to home">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue to-purple flex items-center justify-center text-white font-black text-sm">E</div>
        <h1 className="text-lg font-bold tracking-tight hidden sm:block">{APP_NAME}</h1>
      </button>
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-text-secondary">
          <button onClick={() => onNavigate('/dashboard')} className="hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer">Dashboard</button>
          <button onClick={() => onNavigate('/employees')} className="hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer">Employees</button>
          <button onClick={() => onNavigate('/reports')} className="hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer">Reports</button>
        </div>
        <div className="flex items-center gap-2 bg-surface/50 border border-border px-3 py-1.5 rounded-full">
          <span className="text-xs font-bold text-text-secondary max-w-[80px] truncate">{user?.name || 'Guest'}</span>
          <button onClick={onLogout} className="flex h-7 w-7 items-center justify-center rounded-full bg-red/10 text-red hover:bg-red hover:text-white transition-all border-none cursor-pointer" aria-label="Logout">
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  </nav>
));

Navbar.displayName = 'Navbar';

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleNavigate = useCallback((path: string) => {
    navigate(path);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-text-primary pt-16">
      <Navbar user={user} onLogout={handleLogout} onNavigate={handleNavigate} />

      {/* Hero Section */}
      <motion.section className="relative px-6 pt-12 pb-20 max-w-7xl mx-auto" variants={CONTAINER_VARIANTS} initial="hidden" animate="visible">
        <div className="absolute top-0 left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" aria-hidden="true" />
        <div className="absolute bottom-0 right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]" aria-hidden="true" />

        <div className="relative z-10">
          <motion.div variants={ITEM_VARIANTS} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/50 px-4 py-1.5 mb-6">
            <span className="h-2 w-2 rounded-full bg-teal" />
            <span className="text-xs font-semibold tracking-wider uppercase text-text-secondary">Platform {PLATFORM_VERSION} is Live</span>
          </motion.div>

          <motion.h1 variants={ITEM_VARIANTS} className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-4">
            Management <span className="bg-gradient-to-r from-blue to-purple bg-clip-text text-transparent">Reimagined</span>
          </motion.h1>

          <motion.p variants={ITEM_VARIANTS} className="text-lg text-text-secondary max-w-2xl mb-8">
            Welcome back, <span className="font-semibold text-text-primary">{user?.name}</span>. Experience the next generation of cloud-native employee management with real-time insights and collaboration.
          </motion.p>

          <motion.div variants={ITEM_VARIANTS} className="flex flex-wrap gap-4">
            <button onClick={() => handleNavigate('/dashboard')} className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-8 font-semibold text-brand-text hover:scale-105 transition-all border-none cursor-pointer">
              <LayoutDashboard size={18} />
              Go to Dashboard
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => handleNavigate('/profile')} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface/50 px-8 font-semibold text-text-primary hover:bg-surface-hover transition-all border-none cursor-pointer">
              <User size={18} />
              View Profile
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section className="px-6 py-12 max-w-7xl mx-auto" variants={CONTAINER_VARIANTS} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <motion.div variants={ITEM_VARIANTS} className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Key Metrics</h2>
          <p className="text-text-secondary">Real-time insights into your organization's performance</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section className="px-6 py-12 max-w-7xl mx-auto" variants={CONTAINER_VARIANTS} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <motion.div variants={ITEM_VARIANTS} className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Powerful Features</h2>
          <p className="text-text-secondary">Everything you need to manage your organization efficiently</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <FeatureBox key={feature.title} {...feature} />
          ))}
        </div>
      </motion.section>

      {/* Dashboard Preview */}
      <motion.section className="px-6 py-12 max-w-7xl mx-auto" variants={CONTAINER_VARIANTS} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <motion.div variants={ITEM_VARIANTS} className="glass-card rounded-2xl overflow-hidden border border-border">
          <div className="relative aspect-video bg-surface/50 flex items-center justify-center">
            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" alt="Dashboard Preview" className="w-full h-full object-cover opacity-80" />
          </div>
          <div className="grid grid-cols-3 divide-x divide-border bg-surface/30 p-6">
            <div>
              <p className="text-text-secondary text-sm font-medium">Uptime</p>
              <p className="text-2xl font-bold text-teal mt-1">99.9%</p>
            </div>
            <div className="px-6">
              <p className="text-text-secondary text-sm font-medium">Security</p>
              <p className="text-2xl font-bold text-green mt-1">100%</p>
            </div>
            <div className="pl-6">
              <p className="text-text-secondary text-sm font-medium">Performance</p>
              <p className="text-2xl font-bold text-blue mt-1">A+</p>
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* CTA Section */}
      <motion.section className="px-6 py-16 max-w-4xl mx-auto text-center" variants={CONTAINER_VARIANTS} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <motion.div variants={ITEM_VARIANTS} className="glass-card rounded-2xl border border-border p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-text-secondary mb-8 max-w-2xl mx-auto">Streamline your workforce management today and unlock the full potential of your team.</p>
          <button onClick={() => handleNavigate('/dashboard')} className="group flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-8 font-semibold text-brand-text hover:scale-105 transition-all border-none cursor-pointer mx-auto">
            Enter Dashboard
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface/30 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-text-secondary">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center text-brand-text font-black text-xs">E</div>
            <span className="font-bold">{APP_NAME}</span>
          </div>
          <div className="flex gap-6">
            <button className="hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer" aria-label="Privacy">Privacy</button>
            <button className="hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer" aria-label="Terms">Terms</button>
            <button className="hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer" aria-label="Documentation">Docs</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
