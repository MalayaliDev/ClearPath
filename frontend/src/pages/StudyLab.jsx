import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, CalendarClock, FileText, Sparkles } from 'lucide-react';

const studyModules = [
  {
    title: 'Upload PDFs AI',
    description: 'Summaries, highlights, flashcards, and viva prep in one place.',
    icon: FileText,
    to: '/app/pdf-lab',
    accent: 'from-[#fff6e8] to-white border-amber-100',
  },
  {
    title: 'Personal AI mentor',
    description: 'Context-aware chat that knows your complaints + study material.',
    icon: Bot,
    to: '/app/mentor-lab',
    accent: 'from-[#f4f0ff] to-white border-[#e5ddff]',
  },
  {
    title: 'Study planner',
    description: 'Schedule revision slots and get nudges before each session.',
    icon: CalendarClock,
    to: '/app/planner-lab',
    accent: 'from-[#e9fbf5] to-white border-emerald-100',
  },
];

export default function StudyLab() {
  return (
    <div className="space-y-8">
      <header className="rounded-[32px] border border-amber-100 bg-gradient-to-r from-white via-amber-50 to-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-amber-500">
              <Sparkles className="h-4 w-4" />
              <span>AI study lab</span>
            </div>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Choose the assistant you need today.</h1>
            <p className="mt-2 text-sm text-slate-500">
              Each workspace is focused. Upload PDFs, chat with a mentor, or plan your revision sessions without overwhelming the main dashboard.
            </p>
          </div>
          <div className="rounded-3xl border border-amber-100 bg-white/80 px-5 py-4 text-sm text-slate-600">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500">How it works</p>
            <p className="mt-2 text-slate-700">
              Pick a module, keep it focused, and return here to jump into another workspace whenever you like.
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {studyModules.map(({ title, description, icon: Icon, to, accent }) => (
          <Link
            key={title}
            to={to}
            className={`rounded-3xl border bg-gradient-to-br ${accent} p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg`}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-500">
              <Icon className="h-3.5 w-3.5 text-amber-500" />
              Module
            </div>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amber-600">
              Enter workspace
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
