import React from 'react';
import { Link } from 'react-router-dom';
import MainNavbar from '../components/MainNavbar.jsx';
import { getStoredUser } from '../services/authStorage.js';
import {
  Bot,
  Layers,
  Users2,
  BellRing,
  ShieldCheck,
  Globe,
  Cloud,
  Database,
  Sparkles,
  ArrowRight,
  LifeBuoy,
} from 'lucide-react';

const featureHighlights = [
  {
    title: 'AI-assisted intake',
    description: 'Students get suggestions for clearer context, attachments, and categories so staff receive actionable reports each time.',
    icon: Bot,
  },
  {
    title: 'Timeline transparency',
    description: 'Every complaint keeps a live history of status updates, staff replies, and timestamps so nothing disappears.',
    icon: ShieldCheck,
  },
  {
    title: 'Role-based dashboards',
    description: 'Student, staff, and admin views are tuned for their responsibilities while sharing the same trusted data.',
    icon: Layers,
  },
  {
    title: 'Automated nudges',
    description: 'Pending complaints surface reminders for staff and notify students as soon as progress is made.',
    icon: BellRing,
  },
];

const techStack = [
  { label: 'Website', icon: Globe, title: 'Vite + React + Tailwind', copy: 'Static deploys on Vercel for warm, fast renders.' },
  { label: 'API', icon: Bot, title: 'Express REST + webhooks', copy: 'JWT auth, rate limits, and AI callbacks for replies.' },
  { label: 'Hosting', icon: Cloud, title: 'Vercel + Render combo', copy: 'Frontend + backend scale independently.' },
  { label: 'Data', icon: Database, title: 'MongoDB Atlas + BullMQ', copy: 'Tickets + AI queues stay backed up for 30 days.' },
];

const workflowCards = [
  {
    badge: 'Students',
    heading: 'Guided intake',
    copy: 'AI tone helper, attachments, and preview keep complaints precise.',
    icon: Users2,
  },
  {
    badge: 'Staff',
    heading: 'Mentor runway',
    copy: 'Filtered queues, macros, and automations reduce ticket chaos.',
    icon: Sparkles,
  },
  {
    badge: 'Admins',
    heading: 'Insights radar',
    copy: 'Exports + thresholds highlight repeating issues before SLA breaches.',
    icon: ShieldCheck,
  },
];

export default function FeaturesPage() {
  const user = getStoredUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff8f0] via-[#fff2e1] to-[#fde6c5] flex flex-col">
      <MainNavbar user={user} />
      <main className="flex-1 space-y-12 pb-16">
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
            <p className="text-[11px] tracking-[0.25em] uppercase text-[#c17236] font-semibold">Features</p>
            <h1 className="text-3xl md:text-4xl font-semibold text-[#2f1a0f]">Everything Clean Path needs to close complaints faster</h1>
            <p className="text-sm md:text-base text-[#6b3f1f] max-w-3xl mx-auto">
              From AI intake to mentor macros, Clean Path blends UI polish with operations logic. Browse the highlights below — each card mirrors what you see inside the portal.
            </p>
          </div>
        </section>

        <section className="px-4">
          <div className="max-w-5xl mx-auto grid gap-4 md:grid-cols-2">
            {featureHighlights.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-[32px] border border-[#ffe0bd] bg-white/95 p-6 shadow-sm space-y-3 transition hover:-translate-y-1 hover:shadow-xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#fff1dc] px-3 py-1 text-[11px] font-semibold text-[#b55c16]">
                  <Icon className="h-3.5 w-3.5" /> Feature highlight
                </div>
                <h3 className="text-lg font-semibold text-[#2f1a0f]">{title}</h3>
                <p className="text-sm text-[#6b3f1f]">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4">
          <div className="max-w-5xl mx-auto grid gap-4 md:grid-cols-3">
            {workflowCards.map((card) => (
              <div key={card.heading} className="rounded-[32px] border border-[#ffe6cc] bg-white/95 p-5 shadow-sm space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#fff5eb] px-3 py-1 text-[11px] font-semibold text-[#b55c16]">
                  <card.icon className="h-3.5 w-3.5" /> {card.badge}
                </div>
                <h3 className="text-lg font-semibold text-[#2f1a0f]">{card.heading}</h3>
                <p className="text-sm text-[#6b3f1f]">{card.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4">
          <div className="max-w-5xl mx-auto grid gap-4 md:grid-cols-2">
            {techStack.map((item) => (
              <div key={item.title} className="rounded-3xl bg-white/95 border border-amber-100 shadow-sm p-5 space-y-2">
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-amber-700">
                  <item.icon className="h-3.5 w-3.5" /> {item.label}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4">
          <div className="max-w-5xl mx-auto rounded-3xl border border-[#ffe6cc] bg-white/95 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#c17236]">Try the dashboard</p>
              <h2 className="text-2xl font-semibold text-[#2f1a0f]">See every feature in the actual Clean Path portal</h2>
              <p className="text-sm text-[#6b3f1f]">Jump into the hero, support hub, or dashboards to experience the warm workflows we described above.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to={user ? '/app' : '/login'} className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white">
                <Sparkles className="h-4 w-4" /> {user ? 'Open dashboard' : 'Login to portal'}
              </Link>
              <Link to="/support" className="inline-flex items-center gap-2 rounded-full border border-[#f4c28a] bg-white px-5 py-2 text-sm font-semibold text-[#b55c16]">
                <LifeBuoy className="h-4 w-4" /> View Support
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-amber-200/80 bg-gradient-to-t from-[#fbe3c7] via-[#fdf2df] to-[#fdf6eb]">
        <div className="max-w-5xl mx-auto px-4 py-8 text-[11px] text-slate-600">
          <div className="grid gap-6 md:grid-cols-4 mb-6">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-amber-700">Clean Path Portal</h3>
              <p className="text-[11px] text-slate-600">Warm dashboards for students, mentors, and admins to keep complaints transparent.</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-amber-700">Dashboards</h3>
              <ul className="space-y-1">
                <li><a href="/#home" className="hover:text-amber-700 transition-colors">Main landing</a></li>
                <li><a href="/#system" className="hover:text-amber-700 transition-colors">AI system view</a></li>
                <li><Link to="/support" className="hover:text-amber-700 transition-colors">Support HQ</Link></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-amber-700">Company</h3>
              <p className="text-slate-500">Internal Clear Path showcase</p>
              <p className="text-slate-500">Mongo · Node · React · Tailwind</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-amber-700">Contact</h3>
              <ul className="space-y-1">
                <li>support@cleanpath.com</li>
                <li>+91 00000 00000</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-t border-amber-200/60 pt-3">
            <span className="text-slate-500">© {new Date().getFullYear()} Clean Path Complaints Portal. All rights reserved.</span>
            <span className="text-slate-500">Built for Clear Path challenge.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

