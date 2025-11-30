import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AlertTriangle, ArrowRight, ClipboardList, LifeBuoy, UserCircle2 } from 'lucide-react';
import { complaintInsights, complaintTimeline } from '../data/complaintsData.js';
import { getToken } from '../services/authStorage.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const cardBase = 'rounded-[32px] border border-amber-100 bg-white shadow-[0_20px_60px_rgba(249,186,95,0.18)]';

export default function ComplaintsPage() {
  const [studentRoster, setStudentRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(true);
  const [rosterError, setRosterError] = useState('');

  useEffect(() => {
    const fetchRoster = async () => {
      try {
        setRosterLoading(true);
        setRosterError('');
        const res = await axios.get(`${API_BASE}/api/complaints/roster`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        setStudentRoster(res.data || []);
      } catch (error) {
        console.error('Failed to load roster', error);
        setRosterError('Failed to load roster');
      } finally {
        setRosterLoading(false);
      }
    };

    fetchRoster();
  }, []);

  const fallbackRoster = [
    { name: 'Aisyah R.', ticketCount: 2, latestStatus: 'Mentor sync due', latestCategory: 'Exam Lab' },
    { name: 'Malayali Dev', ticketCount: 1, latestStatus: 'PDF Lab waitlist', latestCategory: 'Study tools' },
    { name: 'Jishnu K.', ticketCount: 1, latestStatus: 'Escalated · Staff looped', latestCategory: 'Mentor' },
  ];

  const rosterList = studentRoster.length > 0 ? studentRoster : fallbackRoster;

  return (
    <div className="space-y-8">
      <section className="rounded-[40px] border border-[#ffd9ba] bg-gradient-to-br from-[#fff7ef] via-[#ffe5cb] to-[#ffc28e] px-6 py-8 text-[#4a2b18] shadow-[0_35px_90px_rgba(249,186,95,0.35)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[#c27933]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90">
                <ClipboardList className="h-6 w-6" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.4em]">Complaints cockpit</p>
            </div>
            <h1 className="text-3xl font-semibold leading-tight text-[#3a1f11]">Complaints & student info</h1>
            <p className="text-sm text-[#704126]">
              Review SLAs, unblock escalations, and keep mentors synced with one warm panel dedicated to complaint health and student context.
            </p>
            <div className="flex flex-wrap gap-3 text-sm font-semibold">
              <Link to="/app/my-tickets" className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-amber-700 shadow-lg shadow-white/25">
                View ticket inbox
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/support" className="inline-flex items-center gap-2 rounded-2xl border border-white/60 bg-white/10 px-4 py-2 text-white transition hover:bg-white/20">
                Raise escalation
                <AlertTriangle className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="w-full max-w-md rounded-[30px] border border-white/50 bg-white/90 p-5 text-[#4a2b18] shadow-2xl">
            <p className="text-xs uppercase tracking-[0.35em] text-[#c27933]">Snapshot</p>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                { label: 'Active tickets', value: '12', status: '4 urgent' },
                { label: 'Avg. response', value: '12m', status: 'Target < 15m' },
                { label: 'Student syncs', value: '6', status: 'Mentor & staff' },
              ].map((item) => (
                <li key={item.label} className="flex items-center justify-between rounded-2xl border border-[#ffe5cb] bg-white px-4 py-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#ad6b2d]">{item.label}</p>
                    <p className="text-base font-semibold text-[#3a1f11]">{item.value}</p>
                  </div>
                  <span className="text-xs font-semibold text-[#c27933]">{item.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.5fr_0.5fr]">
        <div className={`${cardBase} px-6 py-6`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-500">Complaints health</p>
              <h2 className="text-2xl font-semibold text-slate-900">Track every SLA signal.</h2>
              <p className="text-sm text-slate-600">Smart metrics keep staff and mentors aligned with the landing page theme.</p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">Live sync</span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {complaintInsights.map((insight) => (
              <div key={insight.label} className="rounded-3xl border border-amber-50 bg-[#fff9f2] px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-500">{insight.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{insight.value}</p>
                <p className="text-xs text-slate-500">{insight.sub}</p>
                <div className="mt-3 h-2 rounded-full bg-white/80">
                  <div className="h-full rounded-full bg-amber-400" style={{ width: `${insight.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`${cardBase} px-6 py-6`}>
          <div className="flex items-center gap-3">
            <LifeBuoy className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-500">Student intel</p>
              <p className="text-sm text-slate-600">Quick context for mentor pods.</p>
            </div>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {[
              { label: 'Mentor updates', value: 'Neha replied in 6m' },
              { label: 'Study hours logged', value: '12h this week' },
              { label: 'Focus topic', value: 'Unit 3 · Electrostatics' },
            ].map((item) => (
              <li key={item.label} className="rounded-3xl border border-amber-50 bg-amber-50/50 px-4 py-3">
                <p className="text-xs font-semibold text-amber-600">{item.label}</p>
                <p className="text-sm text-slate-900">{item.value}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className={`${cardBase} px-6 py-6`}>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-500">Ticket timeline</p>
            <Link to="/app/my-tickets" className="text-xs font-semibold text-amber-600">
              See tickets ↗
            </Link>
          </div>
          <ul className="mt-4 space-y-4 text-sm">
            {complaintTimeline.map((event) => (
              <li key={event.title} className="rounded-3xl border border-amber-50 bg-amber-50/60 px-4 py-3">
                <p className={`font-semibold ${event.tone}`}>{event.title}</p>
                <p className="text-xs text-slate-500">{event.note}</p>
                <span className="text-[11px] font-semibold text-amber-600">{event.time}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className={`${cardBase} px-6 py-6`}>
          <div className="flex items-center gap-3">
            <UserCircle2 className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-amber-500">Student roster</p>
              <p className="text-sm text-slate-600">Instant view of who needs attention.</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {rosterLoading && (
              <p className="text-xs text-slate-500">Loading roster…</p>
            )}
            {!rosterLoading && rosterError && (
              <p className="text-xs text-rose-500">{rosterError}</p>
            )}
            {!rosterLoading &&
              rosterList.map((student) => (
                <div key={student.studentId || student.name} className="flex items-center justify-between rounded-3xl border border-amber-50 bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                    <p className="text-xs text-slate-500">
                      {student.ticketCount || 0} ticket{(student.ticketCount || 0) === 1 ? '' : 's'} · {student.latestStatus || 'Watching'}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {student.latestCategory || 'General'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}
