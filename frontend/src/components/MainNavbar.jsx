import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ChevronDown, Info, Layers, BarChart2, ArrowUpRight, LifeBuoy, Menu, X } from 'lucide-react';

export default function MainNavbar({ user }) {
  const [moreOpen, setMoreOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const primaryLinks = [
    { to: '/', label: 'Home', icon: Sparkles },
    { to: '/about', label: 'About', icon: Info },
    { to: '/support', label: 'Support', icon: LifeBuoy },
    { to: '/features', label: 'Features', icon: Layers },
  ];

  return (
    <header className="border-b border-amber-200/80 bg-[#fdf6eb]/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/90 shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-tight text-slate-900">ClearPath</span>
            <span className="text-[11px] text-slate-500">Complaints Portal</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-xs md:text-sm">
          {primaryLinks.map(({ to, label, icon: Icon }, index) => (
            <Link
              key={label}
              to={to}
              className={`${index > 0 ? 'hidden sm:inline-flex' : 'inline-flex'} items-center gap-1.5 text-slate-700/90 hover:text-amber-700 transition-colors`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              className="inline-flex items-center gap-1 text-slate-700/90 hover:text-amber-700 text-xs md:text-sm"
            >
              More
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`}
              />
            </button>
            <div
              className={`absolute right-0 mt-2 w-44 rounded-xl border border-amber-100 bg-white shadow-lg text-[11px] text-slate-700 transform origin-top-right transition duration-200 ease-out ${
                moreOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
              }`}
            >
              <Link to="/about" className="block px-3 py-2 hover:bg-amber-50" onClick={() => setMoreOpen(false)}>
                <Info className="inline h-3.5 w-3.5 mr-1" /> How it helps
              </Link>
              <Link to="/features" className="block px-3 py-2 hover:bg-amber-50" onClick={() => setMoreOpen(false)}>
                <Layers className="inline h-3.5 w-3.5 mr-1" /> Key features
              </Link>
              <Link to="/stats" className="block px-3 py-2 hover:bg-amber-50" onClick={() => setMoreOpen(false)}>
                <BarChart2 className="inline h-3.5 w-3.5 mr-1" /> Quick stats
              </Link>
              <Link to="/" className="block px-3 py-2 hover:bg-amber-50" onClick={() => setMoreOpen(false)}>
                <ArrowUpRight className="inline h-3.5 w-3.5 mr-1" /> Back home
              </Link>
            </div>
          </div>
          <Link
            to={user ? '/app' : '/login'}
            className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 hover:bg-amber-400 px-5 py-2 text-xs md:text-sm font-medium text-white shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{user ? 'Dashboard' : 'Login'}</span>
          </Link>
        </nav>
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-full border border-amber-200 p-2 text-amber-600"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>
      <div
        className={`md:hidden border-t border-amber-100 bg-white/95 px-4 pb-4 text-sm text-slate-700 transition-all duration-200 origin-top ${
          mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-3 pt-4">
          {primaryLinks.map(({ to, label }) => (
            <Link key={label} to={to} className="border-b border-amber-50 pb-2" onClick={() => setMobileOpen(false)}>
              {label}
            </Link>
          ))}
          <Link
            to={user ? '/app' : '/login'}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => setMobileOpen(false)}
          >
            <Sparkles className="h-4 w-4" />
            {user ? 'Dashboard' : 'Login'}
          </Link>
        </div>
      </div>
    </header>
  );
}
