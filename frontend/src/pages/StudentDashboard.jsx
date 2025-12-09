import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { MessageCircle, ShieldBan, Gauge, Settings2, GraduationCap, Sparkles, FileText } from 'lucide-react';

const staffSections = [
  {
    id: 'tickets',
    label: 'Tickets & messaging',
    description: 'Reply faster, escalate smarter',
    icon: MessageCircle,
    path: 'tickets',
  },
  {
    id: 'user-management',
    label: 'User management',
    description: 'Ban, blacklist, reset access',
    icon: ShieldBan,
    path: 'user-management',
  },
  {
    id: 'ai-limits',
    label: 'AI limiting',
    description: 'Mentor guardrails & quotas',
    icon: Gauge,
    path: 'ai-limits',
  },
  {
    id: 'ticket-config',
    label: 'Ticket config',
    description: 'Portal automation policies',
    icon: Settings2,
    path: 'ticket-config',
  },
  {
    id: 'pdf-maintenance',
    label: 'PDF maintenance',
    description: 'Upload or purge AI study files',
    icon: FileText,
    path: 'pdf-maintenance',
  },
];

const quickActions = [
  {
    title: 'Ops command center',
    detail: 'Route escalations to the right squad every 30 minutes.',
    metric: 'Auto-sync on',
  },
  {
    title: 'Mentor availability',
    detail: 'Live staffing map blends Discord + ticket bandwidth.',
    metric: '8 mentors online',
  },
  {
    title: 'Wellness alerts',
    detail: 'Flagged students with back-to-back complaints get nudges.',
    metric: '3 active watchlists',
  },
];

export default function StaffDashboard() {
  const location = useLocation();

  return (
    <div className="space-y-6 text-slate-900">
      <header className="rounded-3xl border border-amber-100 bg-gradient-to-br from-white via-amber-50/80 to-white p-6 shadow-sm animate-fadeInUp">
        <p className="text-[11px] uppercase tracking-[0.35em] text-amber-500">Staff workspace</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Admin control tower</h1>
            <p className="text-sm text-slate-500">
              Everything ClearPath ops teams need in one routed surface. Pick a lane below and stay focused.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white px-4 py-2 text-xs font-semibold text-amber-600 shadow-sm">
            <Sparkles className="h-4 w-4" />
            {location.pathname.includes('tickets') ? 'Triage sprint active' : 'Ops ready'}
          </div>
        </div>
      </header>

      <div className="flex snap-x gap-3 overflow-x-auto pb-2">
        {staffSections.map((section, idx) => {
          const { id, icon: Icon, label, description, path } = section;
          return (
          <NavLink
            key={id}
            to={`/app/staff/${path}`}
            className={({ isActive }) =>
              `snap-start rounded-2xl border px-4 py-3 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 animate-fadeInUp ${
                isActive
                  ? 'border-amber-400 bg-[#fff7e8] text-amber-900 shadow'
                  : 'border-slate-100 bg-white/80 text-slate-600 hover:border-amber-200'
              }`
            }
            end={false}
            style={{ animationDelay: `${idx * 0.06}s` }}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Icon className="h-4 w-4" />
              {label}
            </div>
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          </NavLink>
          );
        })}
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {quickActions.map((card, idx) => (
          <article key={card.title} className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm animate-fadeInUp" style={{ animationDelay: `${idx * 0.08}s` }}>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{card.metric}</span>
              <span className="text-emerald-600">LIVE</span>
            </div>
            <h3 className="mt-2 text-base font-semibold text-slate-900">{card.title}</h3>
            <p className="text-sm text-slate-500">{card.detail}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white/95 p-4 shadow-sm animate-fadeInUp">
        <Outlet />
      </section>
    </div>
  );
}
