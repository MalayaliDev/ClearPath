import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Bot,
  BookOpenCheck,
  CalendarClock,
  ClipboardList,
  Home,
  LifeBuoy,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { clearAuth, getStoredUser } from '../services/authStorage.js';
import UserMenuCard from './UserMenuCard.jsx';

export default function Layout() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const navClass = (isActive) =>
    `flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all ${
      isActive
        ? 'bg-amber-500 text-white shadow-lg shadow-amber-200/70'
        : 'text-slate-600 hover:bg-amber-50'
    }`;

  const workspaceLinks = [
    { to: '/app', label: 'Main dashboard UI', icon: Home, exact: true },
    { to: '/app/complaints', label: 'Complaints & student info', icon: ClipboardList },
  ];

  const studyLinks = [
    { to: '/app/pdf-lab', label: 'Upload PDFs AI', icon: BookOpenCheck },
    { to: '/app/exam-lab', label: 'Exam Lab · MCQs', icon: CalendarClock },
    { to: '/app/study-tools', label: 'AI Study Tools', icon: Sparkles },
    { to: '/app/mentor-lab', label: 'Personal AI mentor', icon: Bot },
  ];

  return (
    <div className="min-h-screen bg-[#fff7ec] text-slate-900">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-8 lg:flex-row lg:items-start lg:px-8">
        <aside className="w-full rounded-[36px] border border-amber-100 bg-white/90 px-6 py-7 shadow-[0_25px_70px_rgba(255,193,111,0.25)] lg:sticky lg:top-6 lg:w-72">
          <div className="flex items-center gap-3 pb-6">
            <div className="rounded-2xl bg-[#fff4df] p-2 text-xl text-amber-500">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <Link to="/" className="text-lg font-semibold tracking-tight text-slate-900">
                ClearPath Complaints
              </Link>
              {user && (
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">{user.role?.toUpperCase()} PANEL</p>
              )}
            </div>
          </div>

          <nav className="space-y-7 text-sm font-medium">
            <div>
              <p className="px-2 text-[11px] uppercase tracking-[0.3em] text-slate-400">Workspace</p>
              {workspaceLinks.map(({ to, label, icon: Icon, exact }) => (
                <NavLink key={to} to={to} end={exact} className={({ isActive }) => `${navClass(isActive)} mt-3`}>
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>

            <div>
              <p className="px-2 text-[11px] uppercase tracking-[0.3em] text-slate-400">Study place</p>
              {studyLinks.map(({ to, label, icon: Icon }, index) => (
                <NavLink key={to} to={to} className={({ isActive }) => `${navClass(isActive)} ${index === 0 ? 'mt-3' : ''}`}>
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </div>

            {(user?.role === 'staff' || user?.role === 'admin') && (
              <div>
                <p className="px-2 text-[11px] uppercase tracking-[0.3em] text-slate-400">Team</p>
                <NavLink to="/app/staff" className={({ isActive }) => `${navClass(isActive)} mt-3`}>
                  <Users className="h-4 w-4" />
                  Staff dashboard
                </NavLink>
              </div>
            )}
          </nav>

          <div className="mt-6 space-y-4">
            <UserMenuCard user={user} onLogout={handleLogout} />
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <header className="rounded-[36px] border border-amber-100 bg-white/95 px-6 py-6 shadow-[0_25px_60px_rgba(255,193,111,0.25)]">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-amber-500">Complaints portal</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900">AI study workspace</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  Organize complaints, notes, and every AI lab in a single warm, minimal hub aligned with the landing page theme.
                </p>
              </div>
              <div className="w-full lg:w-auto">
                <div className="grid flex-1 gap-3 sm:flex-none sm:grid-cols-2">
                  <Link
                    to="/app/study-lab"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-200/70"
                  >
                    <span>Open Study Lab</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/app/exam-lab"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-600 shadow-sm"
                  >
                    <span>Start Exam Lab</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[{ label: 'Active labs', value: '4' }, { label: 'Complaints today', value: '12' }, { label: 'Pending reviews', value: '5' }, { label: 'Resolved', value: '82%' }].map(({ label, value }) => (
                <div key={label} className="rounded-2xl border border-amber-50 bg-[#fffdf8] px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
          </header>

          <section className="rounded-[36px] border border-amber-100 bg-white/95 px-6 py-6 shadow-[0_25px_60px_rgba(255,193,111,0.25)]">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
}
