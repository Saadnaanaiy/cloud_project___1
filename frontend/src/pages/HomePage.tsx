import {
  ArrowRight,
  Globe,
  LayoutDashboard,
  LogOut,
  Rocket,
  Share2,
  ShieldCheck,
  User,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

interface Feature {
  readonly id: string;
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly desc: string;
}

const APP_NAME = 'CloudManager' as const;
const PLATFORM_VERSION = 'V2.0' as const;

const CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
} as const;

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
} as const;

const FEATURES: ReadonlyArray<Feature> = [
  { id: 'f1', icon: <Zap className="text-amber" />, title: "Real-time Sync", desc: "Instant updates across all devices" },
  { id: 'f2', icon: <ShieldCheck className="text-teal" />, title: "Enterprise Security", desc: "Military-grade data encryption" },
  { id: 'f3', icon: <Globe className="text-blue" />, title: "Global Access", desc: "Available anywhere, anytime" }
];

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const FeatureCard = memo(({ icon, title, desc }: Omit<Feature, 'id'>) => (
  <article className="group rounded-3xl border border-border bg-surface/30 p-8 text-left backdrop-blur-sm transition-all hover:border-brand/30 hover:bg-surface/50">
    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-surface shadow-sm ring-1 ring-border transition-transform group-hover:scale-110">
      {icon}
    </div>
    <h3 className="text-lg font-bold">{title}</h3>
    <p className="mt-2 text-sm text-text-secondary leading-relaxed">{desc}</p>
  </article>
));

FeatureCard.displayName = 'FeatureCard';

const Navbar = memo(({ user, onLogout, onNavigate }: { user: any; onLogout: () => void; onNavigate: (p: string) => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl" aria-label="Main Navigation">
    <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6">
      <button 
        onClick={() => onNavigate('/')} 
        className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0"
        aria-label="Go to home"
      >
        <div className="size-8 rounded-lg bg-gradient-to-br from-blue to-purple flex items-center justify-center text-white font-black">
          E
        </div>
        <h1 className="text-lg font-bold tracking-tight hidden sm:block">{APP_NAME}</h1>
      </button>
      
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-6 md:flex mr-6 text-sm font-medium text-text-secondary border-r border-border pr-6">
          <button onClick={() => onNavigate('/')} className="hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer">Home</button>
          <button onClick={() => onNavigate('/dashboard')} className="hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer">Dashboard</button>
          <button onClick={() => onNavigate('/reports')} className="hover:text-text-primary transition-colors bg-transparent border-none cursor-pointer">Reports</button>
        </div>

        <div className="flex items-center gap-3 bg-surface/50 border border-border p-1 rounded-full pl-3 pr-2 backdrop-blur-sm">
          <span className="text-xs font-bold text-text-secondary max-w-[100px] truncate" title={user?.name}>
            {user?.name || 'Guest'}
          </span>
          <button 
            onClick={onLogout}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red/10 text-red hover:bg-red hover:text-white transition-all shadow-sm border-none cursor-pointer"
            aria-label="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  </nav>
));

Navbar.displayName = 'Navbar';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

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
    <div className="relative min-h-screen overflow-hidden bg-background text-text-primary">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" aria-hidden="true" />

      <Navbar user={user} onLogout={handleLogout} onNavigate={handleNavigate} />

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-32">
        <motion.div 
          className="flex flex-col items-center text-center"
          variants={CONTAINER_VARIANTS}
          initial="hidden"
          animate="visible"
        >
          <motion.div 
            variants={ITEM_VARIANTS}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/50 px-4 py-1.5 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-teal" />
            <span className="text-xs font-semibold tracking-wider uppercase text-text-secondary">
              Platform {PLATFORM_VERSION} is Live
            </span>
          </motion.div>

          <motion.h1 
            variants={ITEM_VARIANTS}
            className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl"
          >
            Management <span className="bg-gradient-to-r from-blue to-purple bg-clip-text text-transparent">Reimagined</span>
          </motion.h1>

          <motion.p 
            variants={ITEM_VARIANTS}
            className="mt-8 max-w-2xl text-lg leading-relaxed text-text-secondary sm:text-xl"
          >
            Welcome back, <span className="font-semibold text-text-primary">{user?.name}</span>. 
            Experience the next generation of cloud-native employee management. 
          </motion.p>

          <motion.div variants={ITEM_VARIANTS} className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => handleNavigate('/dashboard')}
              className="group relative flex h-14 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-brand px-8 font-bold text-brand-text transition-all hover:scale-[1.02] active:scale-[0.98] border-none cursor-pointer"
            >
              <LayoutDashboard size={20} />
              Go to Dashboard
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button 
              onClick={() => handleNavigate('/profile')}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-surface/50 px-8 font-bold text-text-primary backdrop-blur-md transition-all hover:bg-surface-hover hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <User size={20} />
              View Profile
            </button>
          </motion.div>

          <motion.section 
            variants={ITEM_VARIANTS}
            className="mt-24 grid w-full grid-cols-1 gap-6 sm:grid-cols-3"
            aria-label="Features"
          >
            {FEATURES.map((f) => (
              <FeatureCard key={f.id} icon={f.icon} title={f.title} desc={f.desc} />
            ))}
          </motion.section>

          <motion.div 
            variants={ITEM_VARIANTS}
            className="relative mt-24 w-full rounded-[2rem] border border-border bg-surface/30 p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-background/50">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" 
                alt="CloudManager Dashboard Preview" 
                className="aspect-video w-full object-cover opacity-90 transition-transform duration-700 hover:scale-[1.02]"
              />
            </div>
            {/* Stats Cards */}
            <div className="absolute -bottom-6 -left-6 hidden h-32 w-64 rounded-2xl border border-border bg-surface p-4 shadow-xl md:block backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-teal/20 flex items-center justify-center text-teal">
                  <ShieldCheck size={20} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-text-secondary uppercase font-bold">Security</p>
                  <p className="text-lg font-bold">100% Verified</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 hidden h-32 w-64 rounded-2xl border border-border bg-surface p-4 shadow-xl md:block backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue/20 flex items-center justify-center text-blue">
                  <Rocket size={20} />
                </div>
                <div className="text-left">
                  <p className="text-xs text-text-secondary uppercase font-bold">Uptime</p>
                  <p className="text-lg font-bold">99.9% Reliable</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <footer className="border-t border-border bg-surface/30 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand flex items-center justify-center text-brand-text font-black text-xl">E</div>
            <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
          </div>
          
          <div className="flex items-center gap-8 text-sm text-text-secondary">
            <a href="#" className="hover:text-text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-text-primary transition-colors">Docs</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="h-10 w-10 flex items-center justify-center rounded-full border border-border hover:bg-surface-hover transition-all bg-transparent cursor-pointer" aria-label="Social link 1">
              <Globe size={18} />
            </button>
            <button className="h-10 w-10 flex items-center justify-center rounded-full border border-border hover:bg-surface-hover transition-all bg-transparent cursor-pointer" aria-label="Social link 2">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
