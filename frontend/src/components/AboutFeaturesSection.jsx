import React from 'react';

export default function AboutFeaturesSection() {
  return (
    <section
      id="about"
      className="py-12 md:py-16 border-t border-amber-100 bg-[#fdf6eb]/70"
    >
      <div className="max-w-5xl mx-auto px-4 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <p className="text-[11px] tracking-[0.25em] uppercase text-amber-600/90 font-semibold">
              How it helps
            </p>
            <h2 className="text-2xl font-semibold text-slate-900">
              Built for students, staff and transparent tracking
            </h2>
            <p className="text-sm text-slate-600">
              Every complaint moves through a clear flow – from submission, to review, to resolution – so both
              students and staff always know what&apos;s happening.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-amber-100 px-3 py-1 text-[11px] text-slate-600 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Live status · Role-based dashboards · AI suggestions</span>
          </div>
        </div>

        <div
          id="features"
          className="grid gap-4 md:grid-cols-[2fr,3fr] items-stretch"
        >
          <div className="bg-white/80 border border-amber-100 rounded-2xl p-5 shadow-sm space-y-4">
            <p className="text-xs font-semibold text-amber-700">Complaint journey</p>
            <ol className="space-y-3 text-xs text-slate-600">
              <li className="flex gap-3">
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-amber-500 text-[11px] font-semibold text-white flex items-center justify-center">
                  1
                </span>
                <div>
                  <p className="font-medium text-slate-900 text-sm">
                    Student submits with context
                  </p>
                  <p>
                    Guided form and AI assist help students describe their issue with all important details.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-amber-400 text-[11px] font-semibold text-white flex items-center justify-center">
                  2
                </span>
                <div>
                  <p className="font-medium text-slate-900 text-sm">
                    Staff reviews &amp; prioritises
                  </p>
                  <p>
                    Staff see every complaint in one dashboard and update status in a couple of clicks.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-emerald-500 text-[11px] font-semibold text-white flex items-center justify-center">
                  3
                </span>
                <div>
                  <p className="font-medium text-slate-900 text-sm">
                    Resolution &amp; transparent updates
                  </p>
                  <p>
                    Students get clear responses and can always see the latest status and history.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-white/80 border border-amber-100 rounded-xl p-4 shadow-sm space-y-2 transition hover:-translate-y-0.5 hover:shadow-md hover:border-amber-200">
              <p className="text-xs font-semibold text-amber-700">For students</p>
              <h3 className="text-sm font-semibold text-slate-900">Raise issues without fear</h3>
              <p className="text-xs text-slate-600">
                Simple, guided forms that make it easy to report problems – even for shy students.
              </p>
            </div>
            <div className="bg-white/80 border border-amber-100 rounded-xl p-4 shadow-sm space-y-2 transition hover:-translate-y-0.5 hover:shadow-md hover:border-amber-200">
              <p className="text-xs font-semibold text-amber-700">For staff</p>
              <h3 className="text-sm font-semibold text-slate-900">Clear queue of work</h3>
              <p className="text-xs text-slate-600">
                One place to see what&apos;s pending, what&apos;s in progress, and what&apos;s resolved.
              </p>
            </div>
            <div className="bg-white/80 border border-amber-100 rounded-xl p-4 shadow-sm space-y-2 md:col-span-2 transition hover:-translate-y-0.5 hover:shadow-md hover:border-amber-200">
              <p className="text-xs font-semibold text-amber-700">For the system</p>
              <h3 className="text-sm font-semibold text-slate-900">Data you can trust</h3>
              <p className="text-xs text-slate-600">
                Every complaint has a timeline and status, helping ClearPath identify patterns and improve faster.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
