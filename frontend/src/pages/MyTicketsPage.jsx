import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ClipboardList, LifeBuoy, Loader2, MessageSquare, RefreshCcw, Trash2, UserCircle2 } from 'lucide-react';
import { getStoredUser, getToken } from '../services/authStorage.js';
import { formatTicketDate } from '../utils/complaints.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MyTicketsPage() {
  const user = getStoredUser();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState('');
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterError, setRosterError] = useState('');
  const isStaffView = (user?.role === 'staff' || user?.role === 'admin');

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${getToken()}` },
      withCredentials: true,
    }),
    []
  );

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const endpoint = isStaffView ? `${API_BASE}/api/complaints` : `${API_BASE}/api/complaints/my`;
      const response = await axios.get(endpoint, authConfig);
      setTickets(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your tickets.');
    } finally {
      setLoading(false);
    }
  }, [authConfig, isStaffView]);

  useEffect(() => {
    fetchTickets();
    if (isStaffView) {
      fetchRoster();
    }
  }, [fetchTickets]);

  const fetchRoster = async () => {
    try {
      setRosterLoading(true);
      setRosterError('');
      const res = await axios.get(`${API_BASE}/api/complaints/roster`, authConfig);
      setRoster(res.data || []);
    } catch (err) {
      setRosterError('Failed to load student roster.');
    } finally {
      setRosterLoading(false);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!ticketId) return;
    try {
      setDeletingId(ticketId);
      await axios.delete(`${API_BASE}/api/complaints/${ticketId}`, authConfig);
      setTickets((prev) => prev.filter((ticket) => (ticket._id || ticket.id) !== ticketId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete ticket.');
    } finally {
      setDeletingId('');
    }
  };

  const statusSummary = useMemo(() => {
    const summary = { total: tickets.length, pending: 0, progress: 0, resolved: 0 };
    tickets.forEach((ticket) => {
      const status = (ticket.status || '').toLowerCase();
      if (status === 'resolved') summary.resolved += 1;
      else if (status === 'in progress') summary.progress += 1;
      else summary.pending += 1;
    });
    return summary;
  }, [tickets]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff6ec] via-[#fff1de] to-[#ffe6c8] text-slate-900">
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-[36px] border border-amber-100 bg-white/95 p-6 shadow-[0_25px_60px_rgba(255,193,111,0.25)]">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-600">Support cockpit</p>
              <h1 className="mt-2 text-3xl font-semibold">Tickets & replies</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Signed in as {user?.name || 'student'}. Keep every escalation inside this warm workspace and jump back to any ticket in a tap.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={fetchTickets}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-2 text-sm font-semibold text-amber-700"
              >
                <RefreshCcw className="h-4 w-4" /> Refresh
              </button>
              <Link
                to="/create-ticket"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-200/70"
              >
                <LifeBuoy className="h-4 w-4" /> Create ticket
              </Link>
            </div>
          </header>

          <section className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              { label: 'Total tickets', value: statusSummary.total, tone: 'from-white via-[#fff4de] to-white' },
              { label: 'Pending', value: statusSummary.pending, tone: 'from-[#fff1de] via-white to-white' },
              { label: 'In progress', value: statusSummary.progress, tone: 'from-[#e0f2fe] via-white to-white' },
              { label: 'Resolved', value: statusSummary.resolved, tone: 'from-[#dcfce7] via-white to-white' },
            ].map((stat, idx) => (
              <div key={stat.label} className={`rounded-[28px] border border-amber-50 bg-gradient-to-br ${stat.tone} p-4 animate-fadeInUp`} style={{ animationDelay: `${idx * 0.08}s` }}>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
              </div>
            ))}
          </section>

          {error && <p className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}

          <section className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center rounded-[28px] border border-amber-50 bg-white/90 p-10 text-amber-600">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-amber-200 bg-amber-50/60 p-8 text-center text-sm text-amber-700">
                No tickets yet.{' '}
                <Link to="/create-ticket" className="font-semibold underline">
                  Create one
                </Link>{' '}
                to get mentor support fast.
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket, idx) => {
                  const ticketId = ticket._id || ticket.id;
                  const cardContent = (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{ticket.title}</p>
                          <p className="text-xs text-slate-500">Created {formatTicketDate(ticket.created_at)}</p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            ticket.status === 'Resolved'
                              ? 'bg-emerald-50 text-emerald-600'
                              : ticket.status === 'In Progress'
                              ? 'bg-sky-50 text-sky-600'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {ticket.status || 'Pending'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <ClipboardList className="h-4 w-4 text-amber-500" /> Priority {ticket.priority || 'Medium'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="h-4 w-4 text-slate-400" /> Last update {formatTicketDate(ticket.updated_at)}
                        </span>
                      </div>
                      {isStaffView && (
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            handleDeleteTicket(ticketId);
                          }}
                          disabled={deletingId === ticketId}
                          className="inline-flex items-center gap-2 self-start rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> {deletingId === ticketId ? 'Removing…' : 'Delete ticket'}
                        </button>
                      )}
                    </div>
                  );

                  return (
                    <Link
                      key={ticketId}
                      to={`/app/tickets/${ticketId}`}
                      className="flex flex-col gap-3 rounded-[28px] border border-amber-50 bg-white/95 p-5 text-left transition hover:-translate-y-0.5 hover:shadow-[0_15px_35px_rgba(255,193,111,0.25)] animate-fadeInUp"
                      style={{ animationDelay: `${idx * 0.06}s` }}
                    >
                      {cardContent}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          {isStaffView && (
            <section className="mt-8 rounded-[32px] border border-amber-100 bg-white/95 p-6 shadow-[0_20px_60px_rgba(255,193,111,0.18)]">
              <div className="flex items-center gap-3">
                <UserCircle2 className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-amber-600 font-semibold">Student roster</p>
                  <p className="text-sm text-slate-600">Instant view of who needs attention.</p>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {rosterLoading && <p className="text-xs text-slate-500">Loading roster…</p>}
                {!rosterLoading && rosterError && <p className="text-xs text-rose-500">{rosterError}</p>}
                {!rosterLoading && roster.length === 0 && !rosterError && (
                  <p className="text-xs text-slate-500">No roster data yet.</p>
                )}
                {!rosterLoading &&
                  roster.map((student) => (
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
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
