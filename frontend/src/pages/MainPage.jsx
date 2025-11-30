import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Bot,
  LayoutDashboard,
  ShieldCheck,
  BarChart2,
  ClipboardList,
  Users2,
  TimerReset,
  LifeBuoy,
} from 'lucide-react';
import { getStoredUser } from '../services/authStorage.js';
import MainNavbar from '../components/MainNavbar.jsx';

export default function MainPage() {
  const user = getStoredUser();

  const highlightCards = [
    {
      label: 'Complaints resolved',
      value: '120+',
      caption: 'Escalations closed with transparent context',
      icon: BarChart2,
    },
    {
      label: 'Avg. first response',
      value: '12m',
      caption: 'Staff receive nudges + AI summaries',
      icon: ClipboardList,
    },
    {
      label: 'AI assisted drafts',
      value: '68%',
      caption: 'Complaints polished before sending',
      icon: Bot,
    },
    {
      label: 'Active roles',
      value: '3',
      caption: 'Student • staff • admin workspaces',
      icon: Users2,
    },
  ];

  const heroMetrics = [
    { label: 'Live tickets', value: '42', meta: 'across 3 cohorts' },
    { label: 'SLA health', value: '94%', meta: 'Target > 90%' },
    { label: 'Staff online', value: '8 mentors', meta: 'Realtime triage' },
  ];

  const journeySteps = [
    {
      title: 'Guided submission',
      body: 'Students answer contextual prompts, attach files, and preview AI-polished text before sending.',
      color: 'emerald',
    },
    {
      title: 'Triage & collaborate',
      body: 'Staff see one queue with filters, add private notes, and trigger AI reply drafts or reminders.',
      color: 'sky',
    },
    {
      title: 'Transparent resolution',
      body: 'Students get live status, response history, and satisfaction check-ins once an issue closes.',
      color: 'amber',
    },
  ];

  const roleSpaces = [
    {
      badge: 'Students',
      title: 'Clarity without fear',
      body: 'Friendly intake, AI wording support, and a personal status tracker keep everyone confident.',
      icon: LayoutDashboard,
      bg: 'from-emerald-50 to-white border-emerald-100',
    },
    {
      badge: 'Staff',
      title: 'One control room',
      body: 'Bulk actions, SLA reminders, and templates let staff resolve complaints faster.',
      icon: ShieldCheck,
      bg: 'from-sky-50 to-white border-sky-100',
    },
    {
      badge: 'Admin',
      title: 'Insights & auditing',
      body: 'See recurring themes, export reports, and tune AI policies with audit-ready trails.',
      icon: TimerReset,
      bg: 'from-amber-50 to-white border-amber-100',
    },
  ];

  const portalPillars = [
    {
      title: 'Inbox ritual',
      body: 'Guided intake with AI tone helper, file uploads, and preview so students feel confident.',
      icon: Sparkles,
    },
    {
      title: 'Staff runway',
      body: 'One queue with filters, macros, and automations that unblocks mentors quickly.',
      icon: ShieldCheck,
    },
    {
      title: 'Insights radar',
      body: 'Heatmaps and exports show repeating issues so admins can intervene fast.',
      icon: BarChart2,
    },
  ];

  const workflowPhases = [
    {
      label: '01',
      title: 'Capture',
      desc: 'Warm form with AI tone helper, file uploads, and live preview.',
      icon: ClipboardList,
    },
    {
      label: '02',
      title: 'Coach',
      desc: 'Staff dashboard pushes reply drafts, reminders, and macros.',
      icon: Sparkles,
    },
    {
      label: '03',
      title: 'Close',
      desc: 'Students get real-time status, satisfaction loops, and archives.',
      icon: ShieldCheck,
    },
  ];

  const aiSystems = [
    {
      tag: 'Students',
      title: 'AI intake writer',
      desc: 'Suggests tone, structure, and attachments before the ticket leaves the student dashboard.',
      icon: Bot,
    },
    {
      tag: 'Staff',
      title: 'Mentor copilots',
      desc: 'Draft replies, reminders, and macros so staff resolve escalations faster.',
      icon: Sparkles,
    },
    {
      tag: 'Admins',
      title: 'Insights radar',
      desc: 'Surface repeated blockers, export audit-ready trails, and tune policies.',
      icon: BarChart2,
    },
  ];

  const cleanPathLoops = [
    {
      title: 'Compass loops',
      detail: 'Every complaint stays in a guided loop with timestamps, proofs, and AI suggestions.',
      bullets: ['Students submit with context + files', 'Staff receive SLAs, macros, and reminders'],
    },
    {
      title: 'Mentor runway',
      detail: 'Queues, filters, and automations keep mentors synced without juggling tools.',
      bullets: ['Macro replies with one click', 'Closing a ticket updates dashboards instantly'],
    },
    {
      title: 'Admin clarity',
      detail: 'Ops leaders view insights before they escalate.',
      bullets: ['Trend charts + exports', 'AI flags repeated topics to review'],
    },
  ];

  const interactiveTiles = [
    {
      title: 'Complaints cockpit',
      description: 'Jump into the AI hero banner and see today’s signals at a glance. Tiles animate with live gradients as SLA health changes.',
      accent: 'from-[#fff1da] to-white',
    },
    {
      title: 'Mentor queue',
      description: 'Scroll the staff dashboard carousel to watch macros, AI drafts, and close actions update in real-time.',
      accent: 'from-[#e7f5ff] to-white',
    },
    {
      title: 'Role switch',
      description: 'Toggle Students/Staff/Admin to preview how layouts reshape around each job to be done.',
      accent: 'from-[#fff5f1] to-white',
    },
    {
      title: 'Insight radar',
      description: 'Hover the trend cards to surface AI summaries before taking action.',
      accent: 'from-[#eefcf2] to-white',
    },
  ];

  const testimonials = [
    {
      quote: '“Our mentors resolve escalations twice as fast because macros, timelines, and AI replies live in one warm UI.”',
      author: 'Aisyah R., Program Manager',
      meta: 'Pilot cohort, 2025',
    },
    {
      quote: '“Students finally trust the complaints portal — the language coach and live status feel human.”',
      author: 'Neha S., Student Success',
      meta: 'Complaints operations',
    },
    {
      quote: '“Admins get ahead of patterns thanks to CleanPath insights and exports.”',
      author: 'Jishnu K., Ops Lead',
      meta: 'ClearPath HQ',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf6ec] via-[#fff9f2] to-[#fce7cd] flex flex-col">
      <MainNavbar user={user} />

      {/* Main content */}
      <main className="flex-1">
        {/* Hero */}
        <section id="home" className="py-12 md:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="relative overflow-hidden rounded-[44px] border border-[#ffe0bd] bg-gradient-to-br from-[#fffaf3] via-[#ffe9cf] to-[#ffc58d] px-6 py-10 md:px-12 md:py-14">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.65),_transparent_60%)]" />
              <div className="relative flex flex-col gap-10 lg:flex-row lg:items-start">
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/20 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-[#b87436]">
                    ClearPath portal
                  </div>
                  <h1 className="text-3xl md:text-[2.8rem] font-semibold leading-tight text-[#311a0d]">
                    Raise, track, and resolve student complaints with calm clarity.
                  </h1>
                  <p className="text-base text-[#6b3f1f] max-w-2xl">
                    Students feel guided, staff stay coordinated, and admins see transparent outcomes — all inside one warm workspace aligned with your landing-page palette.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={user ? '/app' : '/login'}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#b55c16] shadow-lg shadow-white/40"
                    >
                      {user ? 'Go to dashboard' : 'Login to portal'}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    {!user && (
                      <Link
                        to="/register"
                        className="inline-flex items-center rounded-full border border-white/70 bg-transparent px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
                      >
                        Register as student
                      </Link>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-[#6b3f1f]">
                    {[{ label: 'Live status tracking', icon: Sparkles }, { label: 'AI-assisted replies', icon: Bot }, { label: 'Role-based controls', icon: ShieldCheck }].map(({ label, icon: Icon }) => (
                      <span key={label} className="inline-flex items-center gap-2 rounded-full border border-[#f6caa0] bg-white/80 px-3 py-1">
                        <Icon className="h-3 w-3 text-[#d87d1f]" />
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-1 space-y-5">
                  <div className="rounded-[30px] border border-white/50 bg-white/90 p-6 shadow-2xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c17236]">Today’s signals</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      {heroMetrics.map((metric) => (
                        <div key={metric.label} className="rounded-2xl border border-[#ffe6cc] bg-white/90 px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#bb6c2a]">{metric.label}</p>
                          <p className="mt-2 text-2xl font-semibold text-[#2f1a0f]">{metric.value}</p>
                          <p className="text-xs text-[#7b4b29]">{metric.meta}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[32px] border border-white/60 bg-white/85 p-6 shadow-lg space-y-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c17236]">Ops readiness</p>
                    <p className="text-sm text-[#6b3f1f]">CleanPath keeps intake, mentors, and admins aligned with a single AI playbook.</p>
                    <ul className="space-y-2 text-xs text-[#6b3f1f]">
                      <li>• AI summaries land with each ticket.</li>
                      <li>• Staff macros + reminders keep SLAs green.</li>
                      <li>• Admins see auto updates in dashboards.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 border-t border-[#ffe0bd]/60 bg-[#fff7ec]">
          <div className="max-w-6xl mx-auto px-4 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#c17236]">Numbers you can act on</p>
                <h2 className="text-2xl font-semibold text-[#2f1a0f]">Clear transparency from intake to resolution</h2>
              </div>
              <Link to="/app" className="inline-flex items-center gap-2 rounded-full border border-[#f4c28a] bg-white px-4 py-2 text-sm font-semibold text-[#b55c16]">
                Preview the workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {highlightCards.map(({ label, value, caption, icon: Icon }) => (
                <div key={label} className="rounded-[30px] border border-[#ffe6cc] bg-white/95 p-5 shadow-sm flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#fff1dc] flex items-center justify-center text-[#cb722d]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#c17236]">{label}</p>
                    <p className="text-2xl font-semibold text-[#2f1a0f]">{value}</p>
                    <p className="text-xs text-[#6b3f1f]">{caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-[#faf4ea] border-t border-[#ffe0bd]/70">
          <div className="max-w-6xl mx-auto px-4 space-y-8">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[36px] border border-[#ffe6cc] bg-white px-6 py-6 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#c17236]">Portal pillars</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#2f1a0f]">Smart layers working together</h2>
                <div className="mt-4 space-y-4">
                  {portalPillars.map((pillar) => (
                    <div key={pillar.title} className="flex items-start gap-3 rounded-3xl border border-[#ffe6cc] bg-[#fffaf4] px-4 py-3">
                      <pillar.icon className="h-5 w-5 text-[#d57d1b]" />
                      <div>
                        <p className="text-sm font-semibold text-[#2f1a0f]">{pillar.title}</p>
                        <p className="text-xs text-[#6b3f1f]">{pillar.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[36px] border border-[#ffe6cc] bg-white px-6 py-6 shadow-sm">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#c17236]">Workflow timeline</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#2f1a0f]">From submit to close without friction</h2>
                <div className="mt-5 space-y-4">
                  {workflowPhases.map((phase) => (
                    <div key={phase.label} className="flex items-start gap-4 rounded-3xl border border-[#ffe6cc] bg-[#fff9f2] px-4 py-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#c17236] border border-[#ffe0bd]">
                        {phase.label}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#2f1a0f]">{phase.title}</p>
                        <p className="text-xs text-[#6b3f1f]">{phase.desc}</p>
                      </div>
                      <phase.icon className="ml-auto h-4 w-4 text-[#d57d1b]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-white border-t border-[#ffe0bd]/70">
          <div className="max-w-5xl mx-auto px-4 space-y-6">
            <div className="space-y-1 text-center">
              <p className="text-[11px] tracking-[0.25em] uppercase text-amber-600 font-semibold">Role-based spaces</p>
              <h2 className="text-2xl font-semibold text-slate-900">Tailored views for everyone in the loop</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {roleSpaces.map(({ badge, title, body, icon: Icon, bg }) => (
                <div key={badge} className={`rounded-3xl bg-gradient-to-br ${bg} border shadow-sm p-5 space-y-3`}>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-700">
                    <Icon className="h-3.5 w-3.5" /> {badge}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="text-sm text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 border-t border-[#ffe0bd] bg-[#fff2dd]" id="system">
          <div className="max-w-6xl mx-auto px-4 space-y-8">
            <div className="space-y-2 text-center">
              <p className="text-[11px] tracking-[0.3em] uppercase text-[#c17236]">ClearPath OS</p>
              <h2 className="text-2xl font-semibold text-[#2f1a0f]">Every layer of the complaints portal has an AI co-pilot</h2>
              <p className="text-sm text-[#6b3f1f]">From the first student prompt to the final audit trail, ClearPath keeps things clean, factual, and transparent.</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                {aiSystems.map((system) => (
                  <div key={system.title} className="rounded-[32px] border border-[#ffe6cc] bg-white/95 px-5 py-4 shadow-sm">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#fff5eb] px-3 py-1 text-[11px] font-semibold text-[#b55c16]">
                      {system.tag}
                    </div>
                    <div className="mt-3 flex items-start gap-3">
                      <system.icon className="h-5 w-5 text-[#d57d1b]" />
                      <div>
                        <p className="text-base font-semibold text-[#2f1a0f]">{system.title}</p>
                        <p className="text-sm text-[#6b3f1f]">{system.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-[36px] border border-[#ffe6cc] bg-white px-6 py-6 shadow-sm space-y-4">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#c17236]">CleanPath loops</p>
                {cleanPathLoops.map((loop) => (
                  <div key={loop.title} className="rounded-3xl border border-[#ffe6cc] bg-[#fff9f2] px-4 py-4 space-y-2">
                    <p className="text-sm font-semibold text-[#2f1a0f]">{loop.title}</p>
                    <p className="text-xs text-[#6b3f1f]">{loop.detail}</p>
                    <ul className="list-disc pl-5 text-xs text-[#835129] space-y-1">
                      {loop.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white border-t border-[#ffe0bd]/60">
          <div className="max-w-6xl mx-auto px-4 space-y-6">
            <div className="space-y-1 text-center">
              <p className="text-[11px] tracking-[0.3em] uppercase text-[#c17236]">Interactive showcase</p>
              <h2 className="text-2xl font-semibold text-[#2f1a0f]">See CleanPath screens in motion</h2>
              <p className="text-sm text-[#6b3f1f]">Hover and explore to understand how every card guides students and staff.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {interactiveTiles.map((tile) => (
                <div key={tile.title} className={`rounded-[32px] border border-[#ffe6cc] bg-gradient-to-br ${tile.accent} p-5 shadow-sm` }>
                  <div className="text-sm font-semibold text-[#2f1a0f]">{tile.title}</div>
                  <p className="mt-2 text-sm text-[#6b3f1f]">{tile.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-[#fff7ec] border-t border-[#ffe0bd]/60">
          <div className="max-w-5xl mx-auto px-4 space-y-6">
            <div className="space-y-1 text-center">
              <p className="text-[11px] tracking-[0.3em] uppercase text-[#c17236]">Voices from the pilot</p>
              <h2 className="text-2xl font-semibold text-[#2f1a0f]">Students, staff, and admins feel the calm</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {testimonials.map((entry) => (
                <div key={entry.author} className="rounded-[32px] border border-[#ffe6cc] bg-white/95 p-4 shadow-sm">
                  <p className="text-sm text-[#2f1a0f]">{entry.quote}</p>
                  <div className="mt-3 text-xs text-[#6b3f1f]">
                    <p className="font-semibold">{entry.author}</p>
                    <p>{entry.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 border-t border-amber-100 bg-[#fdf0d8]/60">
          <div className="max-w-5xl mx-auto px-4">
            <div className="rounded-3xl bg-white/90 border border-amber-100 shadow-lg p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1 space-y-2">
                <p className="text-[11px] tracking-[0.25em] uppercase text-amber-600 font-semibold">Ready?</p>
                <h2 className="text-2xl font-semibold text-slate-900">Bring clarity to every complaint in your batch</h2>
                <p className="text-sm text-slate-600">
                  Connect the student, staff, and admin experience in one portal with live tracking and smart replies.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <Link
                  to={user ? '/app' : '/login'}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 px-6 py-3 text-sm font-medium text-white shadow-md"
                >
                  {user ? 'Go to dashboard' : 'Login to portal'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {!user && (
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-white/80 hover:bg-white px-6 py-3 text-sm font-medium text-amber-700 shadow-sm"
                  >
                    Register as student
                  </Link>
                )}
                <Link
                  to="/support"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-amber-200 bg-amber-50 hover:bg-white px-6 py-3 text-sm font-medium text-amber-700 shadow-sm"
                >
                  Visit Support
                  <LifeBuoy className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-200/80 bg-gradient-to-t from-[#fbe3c7] via-[#fdf2df] to-[#fdf6eb]">
        <div className="max-w-5xl mx-auto px-4 py-8 text-[11px] text-slate-600">
          <div className="grid gap-6 md:grid-cols-4 mb-6">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-amber-700">ClearPath Portal</h3>
              <p className="text-[11px] text-slate-600">
                A clean way for ClearPath students and staff to manage complaints with clear status and history.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-amber-700">Dashboards</h3>
              <ul className="space-y-1">
                <li>
                  <a href="#home" className="hover:text-amber-700 transition-colors">
                    Main landing
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-amber-700 transition-colors">
                    Student view
                  </a>
                </li>
                <li>
                  <a href="#features" className="hover:text-amber-700 transition-colors">
                    Staff view
                  </a>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-amber-700">Company</h3>
              <ul className="space-y-1">
                <li>
                  <span className="text-slate-500">ClearPath</span>
                </li>
                <li>
                  <span className="text-slate-500">Internal tool demo</span>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-amber-700">Contact</h3>
              <ul className="space-y-1">
                <li>
                  <span className="text-slate-500">support@ClearPath.local</span>
                </li>
                <li>
                  <span className="text-slate-500">For demo purposes only</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-t border-amber-200/60 pt-3">
            <span className="text-slate-500">
              © {new Date().getFullYear()} ClearPath Complaints Portal. All rights reserved.
            </span>
            <span className="text-slate-500">
              Built for ClearPath challenge · MongoDB · Node · React · Tailwind
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

