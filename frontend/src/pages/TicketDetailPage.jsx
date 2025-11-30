import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { getToken, getStoredUser } from '../services/authStorage.js';
import useTicketMessages from '../hooks/useTicketMessages.js';
import { formatTicketDate } from '../utils/complaints.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const statusBadge = (status = 'Pending') => {
  switch (status) {
    case 'Resolved':
      return 'bg-emerald-50 text-emerald-600';
    case 'In Progress':
      return 'bg-sky-50 text-sky-600';
    default:
      return 'bg-amber-50 text-amber-700';
  }
};

export default function TicketDetailPage() {
  const { ticketId } = useParams();
  const viewer = getStoredUser();
  const [ticket, setTicket] = useState(null);
  const [loadingTicket, setLoadingTicket] = useState(true);
  const [ticketError, setTicketError] = useState('');
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState(null);
  const [composer, setComposer] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  const authConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${getToken()}` },
      withCredentials: true,
    }),
    []
  );

  const { fetchMessages, sendMessage } = useTicketMessages({ authorizedConfig: authConfig });

  const hydrateTicket = useCallback(async () => {
    if (!ticketId) return;
    try {
      setLoadingTicket(true);
      const response = await axios.get(`${API_BASE}/api/complaints/${ticketId}`, authConfig);
      setTicket(response.data || null);
      setTicketError('');
    } catch (err) {
      setTicketError(err.response?.data?.message || 'Unable to load ticket.');
    } finally {
      setLoadingTicket(false);
    }
  }, [authConfig, ticketId]);

  const hydrateMessages = useCallback(
    async (options = {}) => {
      if (!ticketId) return;
      try {
        const payload = await fetchMessages(ticketId, { force: !options.before, ...options });
        if (options.before) {
          setMessages((prev) => [...payload.messages, ...prev]);
        } else {
          setMessages(payload.messages || []);
        }
        setHasMore(payload.hasMore);
        setNextCursor(payload.nextCursor);
      } catch (err) {
        if (!ticketError) {
          setTicketError(err.response?.data?.message || 'Unable to load messages.');
        }
      } finally {
      }
    },
    [fetchMessages, ticketError, ticketId]
  );

  useEffect(() => {
    hydrateTicket();
  }, [hydrateTicket]);

  useEffect(() => {
    hydrateMessages();
  }, [hydrateMessages]);

  useEffect(() => {
    const interval = setInterval(() => {
      hydrateMessages({ force: true });
    }, 5000);
    return () => clearInterval(interval);
  }, [hydrateMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!composer.trim() || !ticketId) return;
    try {
      setSending(true);
      const saved = await sendMessage(ticketId, composer);
      if (saved) {
        setMessages((prev) => [...prev, saved]);
        setComposer('');
      }
    } catch (err) {
      setTicketError(err.response?.data?.message || 'Unable to send message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#ffe7ce] via-[#ffd2b0] to-[#ffb680] px-3 py-10 text-slate-900 sm:px-6">
      <main className="mx-auto max-w-5xl">
        <div className="rounded-[42px] border border-white/70 bg-white/95 p-6 shadow-[0_45px_110px_rgba(255,150,90,0.35)] sm:p-9">
          <header className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link to="/app/tickets" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600">
                <ArrowLeft className="h-4 w-4" /> Back to tickets
              </Link>
              {ticket && (
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                  <span className={`rounded-full border border-amber-100 bg-white/70 px-4 py-1 text-amber-700 backdrop-blur ${statusBadge(ticket.status)}`}>
                    Status · {ticket.status || 'Pending'}
                  </span>
                  <span className="rounded-full border border-white/70 bg-gradient-to-r from-[#fff1da] to-white px-4 py-1 text-amber-700">
                    Priority · {ticket.priority || 'Medium'}
                  </span>
                </div>
              )}
            </div>
            {loadingTicket ? (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading ticket…
              </div>
            ) : ticket ? (
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-600">Ticket detail</p>
                <h1 className="text-3xl font-semibold leading-tight">{ticket.title}</h1>
                <p className="text-sm text-slate-500">Opened {formatTicketDate(ticket.created_at)}</p>
              </div>
            ) : (
              <p className="text-sm text-rose-600">{ticketError || 'Ticket unavailable.'}</p>
            )}
          </header>

          {ticket && (
            <section className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-[30px] border border-amber-50 bg-gradient-to-br from-[#fff3da] via-white to-[#fff7ec] p-5 shadow-inner">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Owner</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="rounded-2xl bg-amber-100/90 p-3 text-amber-600">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{viewer?.name || 'Student'}</p>
                    <p className="text-xs text-slate-500">{viewer?.email}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[30px] border border-white/80 bg-gradient-to-br from-[#dff1ff] via-white to-[#f4fbff] p-5 shadow-inner">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Category</p>
                <p className="mt-3 text-lg font-semibold">{ticket.category || 'Support'}</p>
                <p className="text-xs text-slate-500">Updated {formatTicketDate(ticket.updated_at)}</p>
              </div>
              <div className="rounded-[30px] border border-white/80 bg-gradient-to-br from-[#e9ffe8] via-white to-[#f6fff5] p-5 shadow-inner">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Staff response</p>
                <p className="mt-3 text-sm text-slate-600">{ticket.staff_response || 'Waiting for mentor reply'}</p>
              </div>
            </section>
          )}

          <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
            <div className="rounded-[34px] border border-amber-50 bg-white/95 p-6 shadow-[0_30px_60px_rgba(255,170,108,0.25)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Conversation</h2>
                {hasMore && (
                  <button
                    type="button"
                    onClick={() => hydrateMessages({ before: nextCursor })}
                    className="text-xs font-semibold text-amber-600"
                  >
                    Load earlier
                  </button>
                )}
              </div>
              <div
                ref={scrollRef}
                className="h-[420px] space-y-3 overflow-y-auto rounded-[30px] border border-amber-50 bg-gradient-to-b from-white via-[#fff5ea] to-[#ffe9d4] p-4"
              >
                {messages.length === 0 ? (
                  <div className="text-center text-sm text-slate-500">No replies yet. Share context to keep mentors looped in.</div>
                ) : (
                  messages.map((msg) => {
                    const isStaff = msg.sender_type === 'staff';
                    return (
                      <div key={msg._id || msg.id} className={`flex ${isStaff ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[78%] rounded-[24px] px-4 py-3 text-sm shadow-[0_20px_40px_rgba(15,23,42,0.15)] ${
                            isStaff
                              ? 'bg-gradient-to-br from-[#ff9f5a] via-[#ff7c4a] to-[#f25f54] text-white'
                              : 'bg-white/95 text-slate-700 border border-amber-50'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[11px] font-semibold opacity-75">
                            <span>{isStaff ? 'Mentor team' : viewer?.name || 'You'}</span>
                            <span>{formatTicketDate(msg.created_at)}</span>
                          </div>
                          <p className="mt-2 whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <form onSubmit={handleSend} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <div className="flex-1 rounded-[999px] border border-amber-100 bg-white/90 px-4 py-1 shadow-inner focus-within:border-amber-400">
                  <input
                    type="text"
                    value={composer}
                    onChange={(event) => setComposer(event.target.value)}
                    className="w-full bg-transparent px-2 py-2 text-sm text-slate-700 focus:outline-none"
                    placeholder="Write a reply with context and proof…"
                    disabled={sending}
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending || !composer.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-[999px] bg-gradient-to-r from-[#ffb347] to-[#ff914d] px-7 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-200/70 disabled:opacity-50"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
                  {sending ? 'Sending…' : 'Send reply'}
                </button>
              </form>
              {ticketError && <p className="mt-2 text-xs text-rose-600">{ticketError}</p>}
            </div>

            <aside className="space-y-4">
              <div className="rounded-[28px] border border-amber-50 bg-gradient-to-br from-[#fff1da] via-white to-white p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                  <Sparkles className="h-4 w-4" /> Ticket ritual
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Keep your responses factual, kind, and timestamped. Short updates every few hours earn faster resolutions.
                </p>
              </div>
              <div className="rounded-[28px] border border-emerald-50 bg-gradient-to-br from-[#e8fff0] via-white to-white p-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  <ShieldCheck className="h-4 w-4" /> Mentor tips
                </div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
                  <li>Attach proof or screenshots when possible.</li>
                  <li>Log study progress so staff knows you’re active.</li>
                  <li>Share blockers before escalation deadlines.</li>
                </ul>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </div>
  );
}
