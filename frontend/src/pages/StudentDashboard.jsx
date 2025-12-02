import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Layers,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { getStoredUser } from '../services/authStorage.js';

const cardBase = 'rounded-[28px] border border-amber-100 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.05)]';
const softCard = 'rounded-[28px] border border-amber-50 bg-amber-50/60 shadow-[0_8px_30px_rgba(15,23,42,0.03)]';
const pillClass = 'inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-semibold text-slate-700';
const primaryCta =
  'inline-flex items-center justify-center rounded-2xl border border-amber-500 bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(249,115,22,0.3)] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500';
const secondaryCta =
  'inline-flex items-center justify-center rounded-2xl border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-700 shadow-[0_6px_16px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200';

const usageMetrics = [
  {
    label: 'Exam completion',
    value: 86,
    sub: 'Avg. score 82%',
    tone: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  },
  {
    label: 'AI chat usage',
    value: 68,
    sub: 'Mentor Lab prompts',
    tone: 'bg-sky-50 text-sky-700 border border-sky-100',
  },
  {
    label: 'Study hours',
    value: 74,
    sub: '12h / 16h weekly goal',
    tone: 'bg-amber-50 text-amber-700 border border-amber-100',
  },
];

const learningModules = [
  {
    title: 'Exam sprint builder',
    level: 'Beginner',
    sessions: 24,
    mentors: 2,
    progress: 45,
    days: '4 / 12',
  },
  {
    title: 'Study styleguide',
    level: 'Intermediate',
    sessions: 19,
    mentors: 1,
    progress: 75,
    days: '11 / 24',
  },
  {
    title: 'Mentor-ready notes',
    level: 'Master',
    sessions: 30,
    mentors: 3,
    progress: 25,
    days: '4 / 18',
  },
];

const userQuickStats = [
  { label: 'Tickets', value: 26 },
  { label: 'Sessions', value: 14 },
  { label: 'Hours', value: '23h' },
  { label: 'Mentors', value: 2 },
];

const upcomingTasks = [
  { title: 'Lab oral review', date: 'Today · 5:00 PM', type: 'Mentor Lab' },
  { title: 'Unit 3 mini quiz', date: 'Tomorrow · 8:00 AM', type: 'Exam Lab' },
];

const quickLaunchLinks = [
  {
    title: 'PDF Lab',
    desc: 'Summaries & highlights',
    to: '/app/pdf-lab',
    icon: Layers,
  },
  {
    title: 'Exam Lab',
    desc: 'Generate MCQ drills',
    to: '/app/exam-lab',
    icon: BookOpenCheck,
  },
  {
    title: 'Mentor Lab',
    desc: 'AI coach follow-ups',
    to: '/app/mentor-lab',
    icon: Sparkles,
  },
  {
    title: 'Study Tools',
    desc: 'Decks & notes',
    to: '/app/study-tools',
    icon: CheckCircle2,
  },
];

const heroHighlights = [
  {
    label: 'Complaints resolved',
    value: '82%',
    meta: '+6% vs last week',
  },
  {
    label: 'Avg. response',
    value: '12m',
    meta: 'Target < 15m',
  },
  {
    label: 'Labs synced',
    value: '4 active',
    meta: 'Mentor · Exam · PDF · Study',
  },
];

const actionShortcuts = [
  {
    title: 'Complaints inbox',
    desc: '12 tickets waiting updates',
    to: '/app/my-tickets',
    pill: 'Tickets',
  },
  {
    title: 'Mentor broadcast',
    desc: 'Share a study or policy memo',
    to: '/app/mentor-lab',
    pill: 'Mentor Lab',
  },
  {
    title: 'Exam sprint',
    desc: 'Spin up a focused MCQ drill',
    to: '/app/exam-lab',
    pill: 'Exam Lab',
  },
];

const cockpitHighlights = [
  { label: 'Tickets logged', value: 2, meta: 'Review blockers now' },
  { label: 'Pending rate', value: '100%', meta: '0 resolved today' },
  { label: 'Resolution rate', value: '0%', meta: '2 study sprints' },
  { label: 'Last touch', value: '03:28 PM', meta: 'Mentor synced' },
];

const launchpadHighlights = [
  { label: 'PDFs synced', value: '24', note: 'Ready in PDF Lab' },
  { label: 'Mentor notes', value: '6 new', note: 'Across 2 mentors' },
  { label: 'Exam drafts', value: '3 queued', note: 'Exam Lab' },
];

const radarStatus = [
  { label: 'Sync', value: 'Live 0s ago' },
  { label: 'Focus goal', value: '80%' },
  { label: 'AI assists', value: '12 today' },
];

const activityPulse = [30, 65, 45, 70, 60, 80, 55];

const ritualBlocks = [
  {
    label: 'Deep dive',
    value: '45m',
    detail: 'Exam Lab review sprint',
  },
  {
    label: 'Mentor sync',
    value: '7m',
    detail: 'Inbox zero with Neha',
  },
  {
    label: 'AI research',
    value: '3 refs',
    detail: 'Fresh PDF highlights',
  },
];

const usageHighlights = [
  {
    label: 'Exam mastery',
    value: '92%',
    desc: 'Across the last 5 Exam Lab sessions',
  },
  {
    label: 'AI assist',
    value: '68%',
    desc: 'Questions resolved via Mentor Lab',
  },
  {
    label: 'Deep work',
    value: '12h',
    desc: 'Focus time logged this week',
  },
];

const calendarDays = [
  { day: 'M', date: 11 },
  { day: 'T', date: 12 },
  { day: 'W', date: 13 },
  { day: 'T', date: 14, active: true },
  { day: 'F', date: 15 },
  { day: 'S', date: 16 },
  { day: 'S', date: 17 },
];

const activityCurve = [40, 65, 55, 80, 90, 70, 84];

const timelineUpdates = [
  {
    title: 'Exam session graded',
    meta: 'MCQ set • 20 questions',
    time: '2m ago',
    tone: 'text-emerald-600',
  },
  {
    title: 'Mentor reply queued',
    meta: 'Neha will respond in ~6m',
    time: '8m ago',
    tone: 'text-amber-600',
  },
  {
    title: 'PDF transcript generated',
    meta: '“Unit 3 revision.pdf”',
    time: '32m ago',
    tone: 'text-slate-500',
  },
];

const systemHealth = [
  { label: 'API gateway', status: 'Operational', latency: '128 ms' },
  { label: 'Vector DB', status: 'Synced', latency: '92 ms' },
  { label: 'Exam engine', status: 'Ready', latency: '310 ms' },
  { label: 'Mentor AI', status: 'Green', latency: '840 ms' },
];

const plannerMilestones = [
  {
    title: 'Unit 3 mastery deck',
    due: 'Due in 2 days',
    owner: 'Study Tools',
    progress: 72,
  },
  {
    title: 'Exam Lab mock #4',
    due: 'Scheduled · Friday',
    owner: 'Exam Lab',
    progress: 54,
  },
];

const quoteOfDay = {
  quote: 'Discipline is remembering what you want most, not what you want now.',
  author: 'David Campbell',
  context: 'Use every ticket, exam, and AI prompt to reinforce the long vision — not just today’s checkbox.',
  takeaway: 'Note one action you can do today that future-you will thank you for.',
};

export default function StudentDashboard() {
  const user = getStoredUser();

  const studyInsights = useMemo(
    () => ({
      week: 'This week',
      hours: '12h 30m',
      focus: 'Unit 3 · Electrostatics',
      streak: '4 day streak',
    }),
    []
  );

  const activeCalendar = calendarDays.find((entry) => entry.active) || calendarDays[0];
  const primaryTask = upcomingTasks[0];
  const nextMilestone = plannerMilestones[0];
  const leadMetric = usageMetrics[0];

  return (
    <div className="space-y-10 text-slate-900">
      <section className="relative overflow-hidden rounded-[40px] border border-[#ffd5ad] bg-gradient-to-br from-[#fff6ea] via-[#ffdcb3] to-[#ffb774] px-6 py-8 text-[#4b2f1c] shadow-[0_30px_70px_rgba(255,193,111,0.28)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent_60%)]" />
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/30 blur-[120px]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#b87436]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80">
                <ClipboardList className="h-6 w-6" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em] text-[#b87436]/90">ClearPath cockpit</p>
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-[#3b1f0f]">Guide complaints, mentors, and labs from one warm hero view.</h1>
            <p className="text-sm text-[#704126]">
              Keep the complaints lane transparent, nudge mentors faster, and sync study rituals with the same calm interface used on the landing page.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Complaints', 'Mentor sync', 'Exam prep'].map((chip) => (
                <span key={chip} className="rounded-full border border-[#f6caa0] bg-white/90 px-3 py-1 text-xs font-semibold text-[#7c4a20]">
                  {chip}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <Link
                to="/app/my-tickets"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-amber-700 shadow-lg shadow-white/20"
              >
                Log complaint
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/app/mentor-lab"
                className="inline-flex items-center gap-2 rounded-2xl border border-[#f4c28a] bg-white/20 px-4 py-2 text-[#7c461e] transition hover:bg-white/40"
              >
                Open Mentor Lab
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="w-full max-w-md rounded-3xl border border-[#ffe0bd] bg-white/85 p-5 text-[#4b2f1c] shadow-inner shadow-white/30 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-[#b87436]">Today's signal</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <div key={item.label} className="rounded-2xl border border-[#ffd6ad] bg-white px-4 py-3 text-sm text-[#4b2f1c] shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#b87436]">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[#3b1f0f]">{item.value}</p>
                  <p className="text-xs text-[#775031]">{item.meta}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="relative z-10 mt-6 grid gap-4 md:grid-cols-3">
          {actionShortcuts.map((shortcut) => (
            <Link
              key={shortcut.title}
              to={shortcut.to}
              className="flex h-full flex-col justify-between rounded-3xl border border-[#f4cba0] bg-white/85 px-4 py-4 text-[#4b2f1c] transition hover:border-[#f09a4d] hover:bg-white"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#c1823f]">{shortcut.pill}</p>
                <p className="mt-2 text-lg font-semibold text-[#351b0e]">{shortcut.title}</p>
                <p className="text-sm text-[#755030]">{shortcut.desc}</p>
              </div>
              <ArrowRight className="mt-4 h-4 w-4 text-[#c1823f]" />
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-[34px] border border-amber-100 bg-white px-6 py-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Workspace launchpad</p>
            <h2 className="text-xl font-semibold">Pick a lane</h2>
          </div>
          <p className="text-xs text-slate-500">Labs sync every 15 minutes</p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {launchpadHighlights.map((item) => (
            <div key={item.label} className="rounded-3xl border border-amber-50 bg-amber-50/60 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-500">{item.label}</p>
              <p className="mt-2 text-xl font-semibold text-slate-900">{item.value}</p>
              <p className="text-xs text-slate-500">{item.note}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickLaunchLinks.map(({ title, desc, to, icon: Icon }) => (
            <Link
              key={title}
              to={to}
              className="flex items-center gap-3 rounded-3xl border border-amber-50 bg-amber-50/60 px-4 py-4 text-sm text-slate-700 transition hover:border-amber-200 hover:bg-white"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-amber-600">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[34px] border border-amber-100 bg-white px-6 py-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Workspace pipeline</p>
              <h2 className="text-xl font-semibold">Active modules</h2>
            </div>
            <Link to="/app/study-tools" className="text-xs font-semibold text-amber-600">
              View all ↗
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {usageHighlights.map((chip) => (
              <div key={chip.label} className="rounded-2xl border border-amber-50 bg-amber-50/60 px-4 py-3 text-xs text-amber-700">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-500">{chip.label}</p>
                <p className="text-base font-semibold text-slate-900">{chip.value}</p>
                <p className="text-[11px] text-slate-500">{chip.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 space-y-4">
            {learningModules.map((module) => (
              <div key={module.title} className="rounded-3xl border border-amber-50 bg-gradient-to-r from-white via-amber-50/30 to-white p-5">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span>{module.level}</span>
                  <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Days {module.days}</span>
                </div>
                <p className="mt-3 text-base font-semibold text-slate-900">{module.title}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-slate-500">
                  <span>{module.sessions} sessions</span>
                  <span>{module.mentors} mentors</span>
                  <span>Progress {module.progress}%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${module.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[34px] border border-amber-100 bg-white px-6 py-6 shadow-sm space-y-5">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-lg font-semibold text-amber-700">
              {user?.name ? user.name.charAt(0) : 'S'}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{user?.name || 'Student Aisyah'}</p>
              <p className="text-xs text-slate-500">@{user?.name?.toLowerCase().replace(/\s/g, '') || 'sitaisyah'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center text-sm font-semibold text-slate-900">
            {userQuickStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-amber-50 bg-amber-50/60 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-500">{stat.label}</p>
                <p className="text-lg">{stat.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900">{studyInsights.week}</p>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700">{studyInsights.streak}</span>
            </div>
            <p className="mt-2">Total focus time · {studyInsights.hours}</p>
            <p>Current focus · {studyInsights.focus}</p>
          </div>
          <div className="rounded-3xl border border-amber-50 bg-amber-50/70 px-5 py-4 text-sm text-slate-700">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Need support?</p>
            <p className="font-semibold text-slate-900">Loop staff without email.</p>
            <Link to="/app/create-ticket" className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-amber-600">
              Open support ticket <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[34px] border border-amber-100 bg-white px-6 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Study radar</p>
              <h2 className="text-xl font-semibold">Signals & velocity</h2>
            </div>
            <Target className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
            {radarStatus.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50/70 px-3 py-1">
                <span className="text-[10px] uppercase tracking-[0.3em] text-amber-500">{item.label}</span>
                <span className="text-slate-900">{item.value}</span>
              </span>
            ))}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {usageMetrics.map((metric) => (
              <div key={metric.label} className={`rounded-3xl px-4 py-4 ${metric.tone}`}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold">{metric.value}%</p>
                <p className="text-xs text-slate-500">{metric.sub}</p>
                <div className="mt-3 h-2 rounded-full bg-white/60">
                  <div className="h-full rounded-full bg-current" style={{ width: `${metric.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-3xl border border-amber-50 bg-amber-50/70 px-4 py-4">
            <div className="flex items-center justify-between text-xs text-amber-700">
              <span>AI vs Exam usage</span>
              <span>Goal 80%</span>
            </div>
            <div className="mt-4 flex items-end gap-2">
              {activityCurve.map((point, index) => (
                <div key={`curve-${index}`} className="flex-1 rounded-full bg-white/70" style={{ height: `${point}%` }} />
              ))}
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {timelineUpdates.map((event) => (
              <div key={event.title} className="flex items-start gap-4">
                <div className="mt-1 h-3 w-3 rounded-full bg-amber-400" />
                <div className="flex-1 rounded-3xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className={`font-semibold ${event.tone}`}>{event.title}</span>
                    <span>{event.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{event.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[34px] border border-amber-100 bg-white px-6 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Mission planner</p>
              <h2 className="text-xl font-semibold">Your roadmap</h2>
            </div>
            <CalendarClock className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-4 space-y-4">
            {plannerMilestones.map((milestone) => (
              <div key={milestone.title} className="rounded-3xl border border-amber-50 bg-amber-50/60 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{milestone.title}</p>
                    <p className="text-xs text-slate-500">{milestone.owner} · {milestone.due}</p>
                  </div>
                  <span className="text-xs font-semibold text-amber-600">{milestone.progress}%</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/60">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${milestone.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-3xl border border-slate-100 bg-slate-50 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Next actions</p>
            <ul className="mt-3 space-y-3 text-sm text-slate-600">
              {upcomingTasks.map((task) => (
                <li key={task.title} className="rounded-2xl border border-white/60 bg-white px-4 py-3">
                  <p className="font-semibold text-slate-900">{task.title}</p>
                  <p className="text-xs text-slate-500">{task.date}</p>
                  <span className="text-xs font-semibold text-amber-600">{task.type}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-[34px] border border-amber-100 bg-white px-6 py-6 text-sm text-slate-600">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Workspace ritual</p>
            <h2 className="text-xl font-semibold text-slate-900">Ops notes & mentor signals moved</h2>
          </div>
          <Link to="/app/create-ticket" className="text-xs font-semibold text-amber-600">
            View latest ops memo ↗
          </Link>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          System health dashboards and mentor lane cards were archived per the latest layout request. Feel free to brief
          us on what should land here next, or keep this surface minimal for now.
        </p>
      </section>
    </div>
  );
}
