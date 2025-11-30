import React from 'react';
import MainNavbar from '../components/MainNavbar.jsx';
import { getStoredUser } from '../services/authStorage.js';
import { BarChart2, Users2, Bot, TimerReset, Activity, Server } from 'lucide-react';

const metrics = [
  {
    label: 'Complaints resolved in demo data',
    value: '20+',
    detail: 'Shows the end-to-end journey from submit to resolution.',
    icon: BarChart2,
  },
  {
    label: 'Active user roles',
    value: '3',
    detail: 'Students, staff, and admins each have tailored dashboards.',
    icon: Users2,
  },
  {
    label: 'AI assistants',
    value: '2',
    detail: 'Guides both students when writing complaints and staff when replying.',
    icon: Bot,
  },
  {
    label: 'Avg. time to first response',
    value: '~4h',
    detail: 'Staff see prioritized queues with reminders so nothing sits idle.',
    icon: TimerReset,
  },
];

export default function StatsPage() {
  const user = getStoredUser();

  return (
    <div className="min-h-screen bg-[#faf4ea] flex flex-col">
      <MainNavbar user={user} />
      <main className="flex-1">
        <section className="py-12 md:py-16">
          <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
            <p className="text-[11px] tracking-[0.25em] uppercase text-amber-600/90 font-semibold">
              Portal stats
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">Transparent metrics for the demo environment</h1>
            <p className="text-sm md:text-base text-slate-600 max-w-3xl mx-auto">
              These numbers reflect the seeded data used to showcase the complaint workflow. They demonstrate how
              ClearPath students and staff benefit from one organized system with real-time status tracking.
            </p>
          </div>
        </section>

        <section className="pb-10">
          <div className="max-w-5xl mx-auto px-4 grid gap-4 md:grid-cols-2">
            {metrics.map(({ label, value, detail, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl bg-white/90 border border-amber-100 shadow-sm p-5 text-left space-y-2 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-[#fff1dc] px-3 py-1 text-[11px] font-semibold text-amber-700">
                  <Icon className="h-3.5 w-3.5" />
                  Live metric
                </div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-amber-600/90">{label}</p>
                <p className="text-3xl font-semibold text-slate-900">{value}</p>
                <p className="text-sm text-slate-600">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="pb-12">
          <div className="max-w-4xl mx-auto px-4 rounded-3xl bg-white/90 border border-amber-100 shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-start gap-6">
            <div className="flex-1 space-y-2">
              <p className="text-[11px] tracking-[0.3em] uppercase text-amber-600 font-semibold">Monitoring</p>
              <h2 className="text-2xl font-semibold text-slate-900">API, queue &amp; uptime snapshots</h2>
              <p className="text-sm text-slate-600">
                Real-time telemetry keeps the ClearPath portal healthy. We watch API uptimes, background worker queues,
                and peak concurrency so every complaint flows end-to-end without intervention.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-slate-700 w-full md:w-72">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5 text-emerald-600" /> API uptime
                </span>
                <span className="text-emerald-700 font-semibold">99.4%</span>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1">
                  <Server className="h-3.5 w-3.5 text-amber-600" /> Queue depth
                </span>
                <span className="text-amber-700 font-semibold">3 jobs</span>
              </div>
              <div className="rounded-xl border border-sky-100 bg-sky-50/60 px-4 py-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1">
                  <TimerReset className="h-3.5 w-3.5 text-sky-600" /> Refresh interval
                </span>
                <span className="text-sky-700 font-semibold">Every 60s</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

