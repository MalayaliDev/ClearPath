import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, MessageCircle, Trash2, Wand2 } from 'lucide-react';
import { getToken, getStoredUser } from '../../services/authStorage.js';
import { formatTicketTime, getComplaintId } from '../../utils/complaints.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const cannedResponses = [
  'Thanks for flagging this. Sharing with academic success for review.',
  'Appreciate your patience — we are syncing with mentors and will update you soon.',
  'Please attach supporting files (screens, receipts) so we can escalate faster.',
];

export default function StaffTicketsPage() {
  const [complaints, setComplaints] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [status, setStatus] = useState('Pending');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketError, setTicketError] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSending, setTicketSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const ticketCacheRef = useRef({});

  const user = getStoredUser();
  const authorizedConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
    []
  );

  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/complaints`, authorizedConfig);
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const loadTicketMessages = async (complaintId) => {
    if (!complaintId) return;
    setTicketLoading(true);
    setTicketError('');
    try {
      const res = await axios.get(`${API_BASE}/api/complaints/${complaintId}/messages`, authorizedConfig);
      const entries = res.data?.messages || [];
      setTicketMessages(entries);
      const nextCache = { ...ticketCacheRef.current, [complaintId]: entries };
      const cacheKeys = Object.keys(nextCache);
      if (cacheKeys.length > 6) {
        const [oldestKey] = cacheKeys;
        delete nextCache[oldestKey];
      }
      ticketCacheRef.current = nextCache;
    } catch (err) {
      console.error(err);
      setTicketError(err.response?.data?.message || 'Failed to load conversation');
    } finally {
      setTicketLoading(false);
    }
  };

  const handleSelect = (c) => {
    const complaintId = getComplaintId(c);
    setSelectedId(complaintId);
    setStatus(c.status);
    setResponse(c.staff_response || '');
    setTicketMessages(ticketCacheRef.current[complaintId] || []);
    setTicketMessage('');
    if (!ticketCacheRef.current[complaintId]) {
      loadTicketMessages(complaintId);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedId) return;
    setLoading(true);
    try {
      await axios.patch(
        `${API_BASE}/api/complaints/${selectedId}`,
        { status, staffResponse: response },
        authorizedConfig
      );
      fetchComplaints();
      if (status === 'Resolved') {
        setComplaints((prev) => prev.filter((c) => getComplaintId(c) !== selectedId));
        setSelectedId('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!selectedId) return;
    setClosing(true);
    try {
      await axios.patch(
        `${API_BASE}/api/complaints/${selectedId}`,
        { status: 'Resolved', staffResponse: response || 'Ticket closed by staff.' },
        authorizedConfig
      );
      setComplaints((prev) => prev.filter((c) => getComplaintId(c) !== selectedId));
      setSelectedId('');
      setResponse('');
      setStatus('Pending');
    } catch (err) {
      console.error(err);
    } finally {
      setClosing(false);
    }
  };

  const handleSendTicketMessage = async (event) => {
    event.preventDefault();
    if (!selectedId || !ticketMessage.trim()) return;
    setTicketSending(true);
    setTicketError('');
    try {
      const res = await axios.post(
        `${API_BASE}/api/complaints/${selectedId}/messages`,
        { body: ticketMessage.trim() },
        authorizedConfig
      );
      const savedMessage = res.data?.message;
      if (savedMessage) {
        setTicketMessages((prev) => {
          const updated = [...prev, savedMessage];
          ticketCacheRef.current = { ...ticketCacheRef.current, [selectedId]: updated };
          return updated;
        });
      }
      setTicketMessage('');
    } catch (err) {
      console.error(err);
      setTicketError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setTicketSending(false);
    }
  };

  const handleAiReply = () => {
    setAiLoading(true);
    setTimeout(() => {
      setResponse((curr) =>
        curr ||
        'Thanks for raising this complaint. Kindly allow us some time to resolve this — we will update you via this portal.'
      );
      setAiLoading(false);
    }, 800);
  };

  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-amber-100 bg-white/80 px-4 py-3 shadow-sm animate-fadeInUp">
          <p className="text-xs text-slate-500">Total complaints</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{complaints.length}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-white/80 px-4 py-3 shadow-sm animate-fadeInUp" style={{ animationDelay: '0.08s' }}>
          <p className="text-xs text-slate-500">Pending</p>
          <p className="mt-1 text-2xl font-semibold text-amber-600">{pendingCount}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-white/80 px-4 py-3 shadow-sm animate-fadeInUp" style={{ animationDelay: '0.16s' }}>
          <p className="text-xs text-slate-500">Resolved</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">{resolvedCount}</p>
        </div>
      </section>

      <div className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-3 text-xs text-slate-500 flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> SLA breaches auto-escalate once queue {'>'} 10
        </span>
        <span className="inline-flex items-center gap-2">
          <Wand2 className="h-3.5 w-3.5 text-emerald-500" /> Three new macros available below
        </span>
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
          {complaints.map((c, idx) => (
            <button
              key={c._id || c.id}
              type="button"
              onClick={() => handleSelect(c)}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm shadow-sm transition animate-fadeInUp ${
                selectedId === (c._id || c.id)
                  ? 'border-amber-500 bg-[#fff7e8]'
                  : 'border-amber-100 bg-white/80 hover:border-amber-200'
              }`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{c.title}</p>
                  <p className="text-xs text-slate-400">{c.category}</p>
                </div>
                <span className="inline-flex items-center rounded-full border border-amber-200 px-2 py-0.5 text-[10px] bg-[#fff7e8]">
                  {c.status}
                </span>
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-slate-600">{c.description}</p>
              <p className="mt-1 text-[10px] text-slate-500">{new Date(c.created_at).toLocaleString()}</p>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <div className="rounded-[24px] border border-amber-100 bg-white/90 p-5 shadow-sm animate-fadeInUp">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Update status & AI reply</h2>
                <p className="text-xs text-slate-500">Keep summary crisp — students see it instantly.</p>
              </div>
              <button
                type="button"
                className="text-xs font-semibold text-amber-600 disabled:opacity-60"
                onClick={handleAiReply}
                disabled={aiLoading}
              >
                {aiLoading ? 'AI drafting…' : 'AI suggest reply'}
              </button>
            </div>
            {!selectedId && <p className="mt-4 text-sm text-slate-500">Select a complaint from the list.</p>}
            {selectedId && (
              <form onSubmit={handleUpdate} className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-xs">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm"
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-xs">Response summary</label>
                    <div className="flex gap-2 text-[11px] text-amber-600">
                      {cannedResponses.map((macro, idx) => (
                        <button
                          key={macro}
                          type="button"
                          className="rounded-full border border-amber-200 px-2 py-0.5"
                          onClick={() => setResponse(macro)}
                        >
                          Macro {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="h-28 w-full rounded-lg border border-amber-200 px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-400 disabled:opacity-60"
                  >
                    {loading ? 'Saving…' : 'Save changes'}
                  </button>
                  <button
                    type="button"
                    disabled={closing}
                    onClick={handleCloseTicket}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 shadow-sm hover:bg-rose-50 disabled:opacity-60"
                  >
                    {closing ? 'Closing…' : (
                      <>
                        <Trash2 className="h-4 w-4" /> Close ticket
                      </>
                    )}
                  </button>
                </div>
                {user && (
                  <p className="text-[11px] text-slate-500">
                    Ticket updates send as <span className="font-medium">{user.name}</span>
                  </p>
                )}
              </form>
            )}
          </div>

          <div className="rounded-[24px] border border-amber-100 bg-white/90 p-5 shadow-sm animate-fadeInUp">
            <h2 className="text-sm font-semibold text-slate-900">Ticket chat</h2>
            {!selectedId && <p className="mt-2 text-sm text-slate-500">Select a complaint to view conversation.</p>}
            {selectedId && (
              <>
                {ticketError && <p className="mt-2 text-sm text-rose-600">{ticketError}</p>}
                <div className="mt-3 flex h-60 flex-col gap-3 overflow-y-auto rounded-2xl bg-slate-50 p-4">
                  {ticketLoading && <p className="text-sm text-slate-500">Loading conversation…</p>}
                  {!ticketLoading && ticketMessages.length === 0 && (
                    <p className="text-sm text-slate-500">No messages exchanged yet.</p>
                  )}
                  {ticketMessages.map((entry) => {
                    const isStaff = entry.sender_type === 'staff';
                    return (
                      <div key={entry._id} className={`flex flex-col ${isStaff ? 'items-end text-right' : 'items-start text-left'}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm font-medium ${
                            isStaff ? 'bg-amber-500/90 text-white' : 'bg-white text-slate-800 shadow'
                          }`}
                        >
                          {entry.body}
                        </div>
                        <span className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">
                          {formatTicketTime(entry.created_at)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <form onSubmit={handleSendTicketMessage} className="mt-3 space-y-3">
                  <textarea
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    className="min-h-[90px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                    placeholder="Update student with the latest action plan"
                  />
                  <button
                    type="submit"
                    disabled={ticketSending || !ticketMessage.trim()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-200/70 disabled:opacity-50"
                  >
                    {ticketSending ? (
                      'Sending...'
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Send reply
                      </span>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
