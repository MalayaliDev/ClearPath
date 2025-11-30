import React, { useMemo, useState } from 'react';
import { GraduationCap, TrendingUp, AlertTriangle, Users } from 'lucide-react';

const performanceData = [
  { id: 'cohort-a', label: 'Physics Lab', grade: 86, attendance: 92, escalations: 1, mentor: 'Dr. Priya' },
  { id: 'cohort-b', label: 'Chemistry Deck', grade: 78, attendance: 88, escalations: 4, mentor: 'Kiran' },
  { id: 'cohort-c', label: 'AI Mentorship', grade: 91, attendance: 95, escalations: 0, mentor: 'Angel' },
  { id: 'cohort-d', label: 'Capstone Pods', grade: 73, attendance: 81, escalations: 6, mentor: 'Nimisha' },
];

const riskAlerts = [
  { id: 'alert-1', name: 'Abin B', signal: '3 tickets in 24h', action: 'Schedule wellness call' },
  { id: 'alert-2', name: 'Shreya R', signal: 'Attendance < 60%', action: 'Notify squad lead' },
  { id: 'alert-3', name: 'Milan J', signal: 'AI quota exhausted', action: 'Grant temporary boost' },
];

export default function StaffStudentInsightsPage() {
  const [selectedCohort, setSelectedCohort] = useState(performanceData[0].id);
  const [showOnlyRisks, setShowOnlyRisks] = useState(false);

  const selectedSummary = useMemo(
    () => performanceData.find((entry) => entry.id === selectedCohort) || performanceData[0],
    [selectedCohort]
  );

  const visibleRisks = showOnlyRisks ? riskAlerts.slice(0, 2) : riskAlerts;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-amber-100 bg-white/90 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-500">Student lens</p>
            <h2 className="text-xl font-semibold text-slate-900">Grade snapshots</h2>
            <p className="text-sm text-slate-500">Pulse check across high-touch cohorts with intervention nudges.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
            <Users className="h-3.5 w-3.5 text-amber-500" /> 142 students tracked
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          {performanceData.map((cohort) => (
            <button
              key={cohort.id}
              type="button"
              onClick={() => setSelectedCohort(cohort.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                selectedCohort === cohort.id
                  ? 'border-amber-400 bg-[#fff7e8] text-slate-900 shadow'
                  : 'border-slate-100 bg-white/90 text-slate-600 hover:border-amber-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{cohort.label}</p>
                  <p className="text-xs text-slate-500">Mentor: {cohort.mentor}</p>
                </div>
                <span className="text-xs text-slate-500">{cohort.attendance}% attendance</span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="rounded-xl bg-white/80 px-3 py-2 text-center shadow">
                  <p className="text-[10px] uppercase text-slate-500">Grade</p>
                  <p className="text-xl font-semibold text-slate-900">{cohort.grade}%</p>
                </div>
                <div className="rounded-xl bg-white/80 px-3 py-2 text-center shadow">
                  <p className="text-[10px] uppercase text-slate-500">Escalations</p>
                  <p className="text-xl font-semibold text-rose-600">{cohort.escalations}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Selected cohort</p>
                <h3 className="text-xl font-semibold text-slate-900">{selectedSummary.label}</h3>
                <p className="text-sm text-slate-500">Mentor {selectedSummary.mentor} · {selectedSummary.attendance}% attendance</p>
              </div>
              <GraduationCap className="h-6 w-6 text-amber-500" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[['Grade avg', `${selectedSummary.grade}%`], ['Escalations', selectedSummary.escalations], ['Wellness flags', selectedSummary.escalations >= 3 ? 'Yes' : 'Clear'], ['Next review', selectedSummary.escalations >= 3 ? 'Tonight' : 'In 2 days']].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <p className="text-[11px] uppercase text-slate-500">{label}</p>
                  <p className="text-lg font-semibold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
            <button className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              <TrendingUp className="h-4 w-4" /> Create intervention brief
            </button>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Risk alerts</p>
              <label className="inline-flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={showOnlyRisks}
                  onChange={() => setShowOnlyRisks((prev) => !prev)}
                  className="h-4 w-4 text-amber-500"
                />
                Critical only
              </label>
            </div>
            <div className="mt-4 space-y-3">
              {visibleRisks.map((alert) => (
                <div key={alert.id} className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-semibold text-slate-900">{alert.name}</p>
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white px-2 py-0.5 text-xs text-amber-600">
                      <AlertTriangle className="h-3 w-3" /> {alert.signal}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{alert.action}</p>
                  <div className="mt-2 flex gap-2 text-xs">
                    <button className="rounded-full border border-slate-200 px-3 py-1 text-slate-600">Log note</button>
                    <button className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">Notify mentor</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
