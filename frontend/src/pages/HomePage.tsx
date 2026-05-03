import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Rocket, 
  ArrowRight, 
  LayoutDashboard, 
  User, 
  LogOut, 
  Share2,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

const HomePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-text-primary">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid Lines Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(var(--text-muted) 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} />

      <Navbar user={user} logout={logout} navigate={navigate} />

      <main className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-32">
        <motion.div 
          className="flex flex-col items-center text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div 
            variants={itemVariants}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/50 px-4 py-1.5 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 rounded-full bg-teal" />
            <span className="text-xs font-semibold tracking-wider uppercase text-text-secondary">
              Platform V2.0 is Live
            </span>
          </motion.div>

          {/* Main Hero Title */}
          <motion.h1 
            variants={itemVariants}
            className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl"
          >
            Management <span className="bg-gradient-to-r from-blue to-purple bg-clip-text text-transparent">Reimagined</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="mt-8 max-w-2xl text-lg leading-relaxed text-text-secondary sm:text-xl"
          >
            Welcome back, <span className="font-semibold text-text-primary">{user?.name}</span>. 
            Experience the next generation of cloud-native employee management. 
            Powerful, secure, and lightning fast.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="mt-12 flex flex-wrap items-center justify-center gap-4"
          >
            <button 
              onClick={() => navigate('/dashboard')}
              className="group relative flex h-14 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-brand px-8 font-bold text-brand-text transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
              <LayoutDashboard size={20} />
              Go to Dashboard
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-surface/50 px-8 font-bold text-text-primary backdrop-blur-md transition-all hover:bg-surface-hover hover:scale-[1.02] active:scale-[0.98]"
            >
              <User size={20} />
              View Profile
            </button>
          </motion.div>

          {/* Stats / Features Grid */}
          <motion.div 
            variants={itemVariants}
            className="mt-24 grid w-full grid-cols-1 gap-6 sm:grid-cols-3"
          >
            {[
              { icon: <Zap className="text-amber" />, title: "Real-time Sync", desc: "Instant updates across all devices" },
              { icon: <ShieldCheck className="text-teal" />, title: "Enterprise Security", desc: "Military-grade data encryption" },
              { icon: <Globe className="text-blue" />, title: "Global Access", desc: "Available anywhere, anytime" }
            ].map((feature, i) => (
              <div key={i} className="group rounded-3xl border border-border bg-surface/30 p-8 text-left backdrop-blur-sm transition-all hover:border-brand/30 hover:bg-surface/50">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-surface shadow-sm ring-1 ring-border transition-transform group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Image Preview Area */}
          <motion.div 
            variants={itemVariants}
            className="relative mt-24 w-full rounded-[2rem] border border-border bg-surface/30 p-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="overflow-hidden rounded-2xl border border-border bg-background/50">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426&ixlib=rb-4.0.3" 
                alt="Platform Preview" 
                className="aspect-video w-full object-cover opacity-90 transition-transform duration-700 hover:scale-[1.02]"
              />
            </div>
            {/* Floating UI Elements */}
            <div className="absolute -bottom-6 -left-6 hidden h-32 w-64 rounded-2xl border border-border bg-surface p-4 shadow-xl md:block backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-teal/20 flex items-center justify-center">
                  <ShieldCheck className="text-teal" size={20} />
                </div>
                <div>
                  <p className="text-xs text-text-secondary uppercase font-bold tracking-tighter">System Health</p>
                  <p className="text-lg font-bold">100% Secure</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 hidden h-32 w-64 rounded-2xl border border-border bg-surface p-4 shadow-xl md:block backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue/20 flex items-center justify-center">
                  <Rocket className="text-blue" size={20} />
                </div>
                <div>
                  <p className="text-xs text-text-secondary uppercase font-bold tracking-tighter">Performance</p>
                  <p className="text-lg font-bold">99.9% Uptime</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface/30 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand flex items-center justify-center text-brand-text font-black text-xl shadow-lg shadow-brand/20">
              E
            </div>
            <span className="text-xl font-bold tracking-tight">Cloud<span className="text-blue">Manager</span></span>
          </div>
          
          <div className="flex items-center gap-8 text-sm text-text-secondary">
            <a href="#" className="hover:text-text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-text-primary transition-colors">Documentation</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="h-10 w-10 flex items-center justify-center rounded-full border border-border hover:bg-surface-hover transition-all">
              <Globe size={18} />
            </button>
            <button className="h-10 w-10 flex items-center justify-center rounded-full border border-border hover:bg-surface-hover transition-all">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface NavbarProps {
  user: any;
  logout: () => void;
  navigate: (path: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, logout, navigate }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="size-8 rounded-lg bg-gradient-to-br from-blue to-purple flex items-center justify-center text-white font-black">
            C
          </div>
          <h1 className="text-lg font-bold tracking-tight hidden sm:block">CloudManager</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-6 md:flex mr-6 text-sm font-medium text-text-secondary border-r border-border pr-6">
            <button onClick={() => navigate('/')} className="hover:text-text-primary transition-colors">Home</button>
            <button onClick={() => navigate('/dashboard')} className="hover:text-text-primary transition-colors">Dashboard</button>
            <button onClick={() => navigate('/reports')} className="hover:text-text-primary transition-colors">Reports</button>
          </div>

          <div className="flex items-center gap-3 bg-surface/50 border border-border p-1 rounded-full pl-3 pr-2 backdrop-blur-sm">
            <span className="text-xs font-bold text-text-secondary max-w-[100px] truncate">
              {user?.name}
            </span>
            <button 
              onClick={logout}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-red/10 text-red hover:bg-red hover:text-white transition-all shadow-sm"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HomePage;
