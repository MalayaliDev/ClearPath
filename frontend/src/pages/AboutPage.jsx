import React from 'react';
import { Link } from 'react-router-dom';
import AboutFeaturesSection from '../components/AboutFeaturesSection.jsx';
import MainNavbar from '../components/MainNavbar.jsx';
import { getStoredUser } from '../services/authStorage.js';

const missionPillars = [
  {
    title: 'Clarity for students',
    body: 'Every prompt, AI hint, and status tracker is built to remove fear from filing a complaint.',
  },
  {
    title: 'Calm for staff',
    body: 'Shared macros, SLAs, and automations reduce context switching and keep mentors focused.',
  },
  {
    title: 'Control for admins',
    body: 'Audit-ready history, exports, and trend insights let ops teams intervene before issues spike.',
  },
];

const buildTimeline = [
  { phase: 'Discovery', highlight: 'Interviewed 40+ students & mentors to map frustrations.' },
  { phase: 'Design sprints', highlight: 'Prototyped warm, card-based layouts + AI companions.' },
  { phase: 'Pilot launch', highlight: 'Rolled out to 3 cohorts with staff dashboards + AI replies.' },
  { phase: 'CleanPath OS', highlight: 'Unified intake, staff, and admin views with shared rituals.' },
];

export default function AboutPage() {
  const user = getStoredUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff8f0] via-[#fff2e1] to-[#fde6c5] flex flex-col">
      <MainNavbar user={user} />
      <main className="flex-1">
        <section className="py-12 md:py-16">
          <div className="max-w-5xl mx-auto px-4 space-y-4 text-center">
            <p className="text-[11px] tracking-[0.25em] uppercase text-amber-600/90 font-semibold">
              About Clean Path
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
              Clean Path keeps complaints honest, warm, and accountable
            </h1>
            <p className="text-sm md:text-base text-slate-600 max-w-3xl mx-auto">
              The same warm card-based interface from the landing page powers every role. Students feel safe, mentors stay in flow, and admins get Clean Path OS insights without leaving the portal.
            </p>
          </div>
        </section>

        <section className="py-8">
          <div className="max-w-5xl mx-auto px-4 grid gap-4 md:grid-cols-3">
            {missionPillars.map((pillar) => (
              <div key={pillar.title} className="rounded-[32px] border border-[#ffe0bd] bg-white/95 p-5 shadow-sm">
                <p className="text-sm font-semibold text-[#2f1a0f]">{pillar.title}</p>
                <p className="mt-2 text-sm text-[#6b3f1f]">{pillar.body}</p>
              </div>
            ))}
          </div>
        </section>

        <AboutFeaturesSection />

        <section className="py-12 border-t border-[#ffe0bd]/70 bg-white">
          <div className="max-w-5xl mx-auto px-4 space-y-6">
            <div className="space-y-1 text-center">
              <p className="text-[11px] tracking-[0.3em] uppercase text-[#c17236]">Build story</p>
              <h2 className="text-2xl font-semibold text-[#2f1a0f]">How we shaped the Clean Path experience</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {buildTimeline.map((step) => (
                <div key={step.phase} className="rounded-[28px] border border-[#ffe6cc] bg-[#fff9f2] px-5 py-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c17236]">{step.phase}</p>
                  <p className="mt-2 text-sm text-[#6b3f1f]">{step.highlight}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-[#fff7ec] border-t border-[#ffe0bd]/70">
          <div className="max-w-4xl mx-auto px-4 space-y-4 text-center">
            <p className="text-[11px] tracking-[0.3em] uppercase text-[#c17236]">Next steps</p>
            <h2 className="text-2xl font-semibold text-[#2f1a0f]">Ready to experience Clean Path OS?</h2>
            <p className="text-sm text-[#6b3f1f]">Jump into the dashboard or revisit the hero to explore the AI-powered complaints cockpit.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to={user ? '/app' : '/login'}
                className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-lg"
              >
                Go to dashboard
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-[#f4c28a] bg-white px-5 py-2 text-sm font-semibold text-[#b55c16]"
              >
                Back to landing hero
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

