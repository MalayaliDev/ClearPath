import React from 'react';
import { Link } from 'react-router-dom';
import { LifeBuoy, Sparkles, Mail, MessageCircle, PhoneCall, Clock3, ShieldCheck } from 'lucide-react';
import MainNavbar from '../components/MainNavbar.jsx';
import { getStoredUser } from '../services/authStorage.js';

const supportTiles = [
  {
    title: 'Email concierge',
    detail: 'Drop us a note at support@cleanpath.com — replies land inside the portal + your inbox.',
    icon: Mail,
  },
  {
    title: 'Portal ticket',
    detail: 'Log in and create a ticket to keep chat-style replies documented and searchable.',
    icon: MessageCircle,
  },
  {
    title: 'Ops hotline',
    detail: 'Mentors can ping the ops squad on Discord for escalations that need a human fast.',
    icon: PhoneCall,
  },
];

const responseSteps = [
  { title: '01. Intake', copy: 'Student submits a ticket with AI tone helper + attachments.' },
  { title: '02. Staff triage', copy: 'Mentors view macros, SLAs, and AI replies before responding.' },
  { title: '03. Resolution', copy: 'Status + history update instantly for students and admins.' },
];

const faqs = [
  { q: 'How fast do you respond?', a: 'Most tickets receive a first response in under 15 minutes during mentor hours.' },
  { q: 'Can I update a ticket via email?', a: 'Yes—email replies sync directly into Clean Path so the conversation stays in one place.' },
  { q: 'What if my issue is urgent?', a: 'Use the Ops hotline card below or mention “urgent” in the subject so staff get notified.' },
];

export default function SupportPage() {
  const user = getStoredUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffaf3] via-[#fff1dc] to-[#ffe0bd] flex flex-col">
      <MainNavbar user={user} />
      <main className="flex-1 space-y-12 pb-12">
        <section className="py-12">
          <div className="max-w-5xl mx-auto px-4 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <p className="text-[11px] tracking-[0.3em] uppercase text-[#c17236] font-semibold">Support HQ</p>
              <h1 className="text-3xl font-semibold text-[#2f1a0f]">We keep complaints calm and transparent.</h1>
              <p className="text-sm text-[#6b3f1f]">
                Whether you’re a student raising a ticket or staff resolving one, Clean Path support keeps every conversation documented, warm, and auditable.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="mailto:support@cleanpath.com" className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-lg">
                  Email support@cleanpath.com
                </a>
                <Link to={user ? '/app' : '/login'} className="inline-flex items-center gap-2 rounded-full border border-[#f4c28a] bg-white px-5 py-2 text-sm font-semibold text-[#b55c16]">
                  {user ? 'Open dashboard' : 'Login to portal'}
                </Link>
              </div>
            </div>
            <div className="rounded-[36px] border border-white/70 bg-white/90 p-6 shadow-xl space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c17236]">Live stats</p>
              <div className="grid gap-4 sm:grid-cols-3">
                {[{ label: 'Tickets today', value: '18' }, { label: 'Avg first response', value: '12m' }, { label: 'Mentors online', value: '8' }].map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-[#ffe6cc] bg-[#fff9f2] px-4 py-3 text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c17236]">{metric.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-[#2f1a0f]">{metric.value}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#6b3f1f]">Metrics update every few minutes — the same values appear in the hero on the main page.</p>
            </div>
          </div>
        </section>

        <section>
          <div className="max-w-5xl mx-auto px-4 grid gap-4 md:grid-cols-3">
            {supportTiles.map(({ title, detail, icon: Icon }) => (
              <div key={title} className="rounded-[32px] border border-[#ffe0bd] bg-white/95 p-5 shadow-sm text-left">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#b55c16]">
                  <Icon className="h-4 w-4" />
                  Contact lane
                </div>
                <p className="mt-2 text-sm font-semibold text-[#2f1a0f]">{title}</p>
                <p className="text-sm text-[#6b3f1f]">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-[#ffe0bd]/70 bg-white">
          <div className="max-w-5xl mx-auto px-4 py-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[#2f1a0f]">How it works</h2>
              <ol className="mt-3 space-y-2 list-decimal pl-5 text-sm text-slate-600">
                <li>Submit a ticket with subject + message.</li>
                <li>Staff reply inside the dashboard (email if needed).</li>
                <li>You keep chatting until it’s resolved.</li>
              </ol>
            </div>
            <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[#2f1a0f]">Need quick help?</h2>
              <p className="mt-2 text-sm text-slate-600">You can also reach us via Contact or your mentor pod.</p>
              <Link
                to={user ? '/app' : '/login'}
                className="mt-4 inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                {user ? 'Open dashboard' : 'Log in to contact'}
              </Link>
            </div>
            <div className="rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-[#2f1a0f]">Status timeline</h2>
              <p className="mt-2 text-sm text-slate-600">We reply within a few hours — the hero metrics on the main page update live.</p>
            </div>
          </div>
        </section>

        <section className="py-10 bg-[#fff7ec] border-t border-[#ffe0bd]/70">
          <div className="max-w-5xl mx-auto px-4 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[32px] border border-[#ffe6cc] bg-white/95 p-5 shadow-sm space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c17236]">Clean Path loop</p>
              {responseSteps.map((step) => (
                <div key={step.title} className="flex items-start gap-3">
                  <ShieldCheck className="h-4 w-4 text-[#d57d1b] mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-[#2f1a0f]">{step.title}</p>
                    <p className="text-xs text-[#6b3f1f]">{step.copy}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-[32px] border border-[#ffe6cc] bg-white/95 p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c17236]">FAQ</p>
              <div className="mt-4 space-y-4">
                {faqs.map((item) => (
                  <div key={item.q} className="rounded-2xl border border-[#ffe6cc] bg-[#fffefc] px-4 py-3 text-left">
                    <p className="text-sm font-semibold text-[#2f1a0f]">{item.q}</p>
                    <p className="text-sm text-[#6b3f1f]">{item.a}</p>
                  </div>
                ))}
              </div>
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
                <li><Link to="/about" className="hover:text-amber-700 transition-colors">About Clean Path</Link></li>
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
