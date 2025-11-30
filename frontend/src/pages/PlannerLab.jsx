import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { CalendarClock, CheckCircle2, MessageCircle, Sparkles, Trash2 } from 'lucide-react';
import { getToken } from '../services/authStorage.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PlannerLab() {
  const STORAGE_KEY = 'planner-lab-slots';
  const [slots, setSlots] = useState([]);
  const [draft, setDraft] = useState({ date: '', time: '', focus: '', channels: { whatsapp: true, discord: false } });
  const [error, setError] = useState('');
  const [phoneMasked, setPhoneMasked] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [phoneStatus, setPhoneStatus] = useState({ type: '', text: '' });
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [discordMasked, setDiscordMasked] = useState('');
  const [discordInput, setDiscordInput] = useState('');
  const [discordStatus, setDiscordStatus] = useState({ type: '', text: '' });
  const [discordSaving, setDiscordSaving] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved)) {
        setSlots(saved);
      }
    } catch (err) {
      console.warn('Failed to load planner slots', err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
  }, [slots]);

  useEffect(() => {
    const fetchContactPrefs = async () => {
      try {
        const [phoneRes, discordRes] = await Promise.all([
          axios.get(`${API_BASE}/api/user/phone`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
          axios.get(`${API_BASE}/api/user/webhook`, {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
        ]);
        setPhoneMasked(phoneRes.data?.masked || '');
        setDiscordMasked(discordRes.data?.masked || '');
      } catch (err) {
        console.warn('Failed to fetch contact preferences', err.response?.data || err.message);
      }
    };
    fetchContactPrefs();
  }, []);

  const handleDraftChange = (field, value) => {
    if (field === 'channels') {
      setDraft((prev) => ({ ...prev, channels: value }));
      return;
    }
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const handleChannelToggle = (channel) => {
    setDraft((prev) => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel],
      },
    }));
  };

  const handleAddSlot = () => {
    if (!draft.date || !draft.time || !draft.focus.trim()) {
      setError('Please fill date, time, and focus area.');
      return;
    }
    if (!draft.channels.whatsapp && !draft.channels.discord) {
      setError('Pick at least one reminder channel (WhatsApp / Discord).');
      return;
    }
    if (draft.channels.whatsapp && !phoneMasked) {
      setError('Please register your WhatsApp number before enabling WhatsApp reminders.');
      return;
    }
    if (draft.channels.discord && !discordMasked) {
      setError('Please save a Discord webhook before enabling Discord reminders.');
      return;
    }
    setError('');
    setSlots((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        date: draft.date,
        time: draft.time,
        focus: draft.focus.trim(),
        status: 'scheduled',
        channels: draft.channels,
      },
    ]);
    setDraft({ date: '', time: '', focus: '', channels: draft.channels });
  };

  const handleStatusToggle = (id) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === id
          ? { ...slot, status: slot.status === 'completed' ? 'scheduled' : 'completed' }
          : slot
      )
    );
  };

  const handleDelete = (id) => {
    setSlots((prev) => prev.filter((slot) => slot.id !== id));
  };

  const handleSavePhone = async () => {
    if (!phoneInput.trim()) {
      setPhoneStatus({ type: 'error', text: 'Enter a valid phone number (include country code).' });
      return;
    }
    setPhoneSaving(true);
    setPhoneStatus({ type: '', text: '' });
    try {
      const response = await axios.post(
        `${API_BASE}/api/user/phone`,
        { phone: phoneInput.trim() },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      setPhoneMasked(response.data?.masked || '');
      setPhoneStatus({ type: 'success', text: 'Phone saved securely. WhatsApp reminders unlocked.' });
      setPhoneInput('');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save number. Try again.';
      setPhoneStatus({ type: 'error', text: message });
    } finally {
      setPhoneSaving(false);
    }
  };

  const handleSaveDiscord = async () => {
    if (!discordInput.trim()) {
      setDiscordStatus({ type: 'error', text: 'Paste a valid Discord webhook URL.' });
      return;
    }
    setDiscordSaving(true);
    setDiscordStatus({ type: '', text: '' });
    try {
      const response = await axios.post(
        `${API_BASE}/api/user/webhook`,
        { webhook: discordInput.trim() },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      setDiscordMasked(response.data?.masked || '');
      setDiscordStatus({ type: 'success', text: 'Discord webhook saved securely.' });
      setDiscordInput('');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to save webhook. Ensure it is a Discord URL.';
      setDiscordStatus({ type: 'error', text: message });
    } finally {
      setDiscordSaving(false);
    }
  };

  const stats = useMemo(() => {
    const completed = slots.filter((slot) => slot.status === 'completed').length;
    return {
      total: slots.length,
      completed,
      upcoming: slots.length - completed,
    };
  }, [slots]);

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-amber-100 bg-gradient-to-br from-white via-amber-50 to-white px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-amber-500">
              <CalendarClock className="h-4 w-4" />
              <span>Study planner</span>
            </div>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Set time to study.</h1>
            <p className="mt-1 text-sm text-slate-500">
              Pick a slot, describe the topic, and we will remind you plus prep quizlets before each session.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <p><span className="font-semibold text-slate-900">{stats.upcoming}</span> upcoming</p>
            <p><span className="font-semibold text-slate-900">{stats.completed}</span> completed</p>
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Pick date</label>
            <input
              type="date"
              value={draft.date}
              onChange={(e) => handleDraftChange('date', e.target.value)}
              className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Time slot</label>
            <input
              type="time"
              value={draft.time}
              onChange={(e) => handleDraftChange('time', e.target.value)}
              className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Focus area</label>
            <input
              type="text"
              placeholder="Eg. DSA revision"
              value={draft.focus}
              onChange={(e) => handleDraftChange('focus', e.target.value)}
              className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-amber-50 bg-amber-50/40 px-4 py-3 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">Remind me on</p>
          <label className="inline-flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              checked={draft.channels.whatsapp}
              onChange={() => handleChannelToggle('whatsapp')}
              className="rounded border-amber-300 text-amber-500 focus:ring-amber-500"
            />
            <span>WhatsApp</span>
          </label>
          <label className="inline-flex items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              checked={draft.channels.discord}
              onChange={() => handleChannelToggle('discord')}
              className="rounded border-amber-300 text-amber-500 focus:ring-amber-500"
            />
            <span>Discord</span>
          </label>
        </div>
        <div className="rounded-2xl border border-amber-50 bg-white px-4 py-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-amber-500">WhatsApp number</p>
              <p className="text-sm text-slate-600">
                {phoneMasked ? `Registered as ${phoneMasked}` : 'No number saved yet. Add your phone to receive WhatsApp pings.'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MessageCircle className="h-4 w-4 text-amber-500" />
              <span>Stored securely (AES-256)</span>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="tel"
              inputMode="tel"
              placeholder="e.g. +919876543210"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="flex-1 rounded-xl border border-amber-200 bg-amber-50/40 px-3 py-2 text-sm text-slate-800"
            />
            <button
              type="button"
              onClick={handleSavePhone}
              disabled={phoneSaving}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {phoneSaving ? 'Saving…' : 'Save number'}
            </button>
          </div>
          {phoneStatus.text && (
            <p
              className={`mt-2 text-xs ${
                phoneStatus.type === 'error' ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {phoneStatus.text}
            </p>
          )}
        </div>
        <div className="rounded-2xl border border-amber-50 bg-white px-4 py-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-amber-500">Discord webhook</p>
              <p className="text-sm text-slate-600">
                {discordMasked
                  ? `Webhook stored as ${discordMasked}`
                  : 'Paste a Discord channel webhook to receive reminders in your server.'}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MessageCircle className="h-4 w-4 text-amber-500" />
              <span>Encrypted & masked</span>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="url"
              placeholder="https://discord.com/api/webhooks/..."
              value={discordInput}
              onChange={(e) => setDiscordInput(e.target.value)}
              className="flex-1 rounded-xl border border-amber-200 bg-amber-50/40 px-3 py-2 text-sm text-slate-800"
            />
            <button
              type="button"
              onClick={handleSaveDiscord}
              disabled={discordSaving}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {discordSaving ? 'Saving…' : 'Save webhook'}
            </button>
          </div>
          {discordStatus.text && (
            <p
              className={`mt-2 text-xs ${
                discordStatus.type === 'error' ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {discordStatus.text}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {error ? (
            <p className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>
          ) : (
            <p className="text-sm text-slate-500">
              Set a slot and we’ll keep it pinned here. Calendar + WhatsApp pings are coming soon.
            </p>
          )}
          <button
            onClick={handleAddSlot}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-200/70"
          >
            <span>Add reminder</span>
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-amber-500">Your queue</p>
            <h2 className="text-2xl font-semibold text-slate-900">Scheduled study sessions</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 px-3 py-1 text-xs text-amber-600">
            <Sparkles className="h-3 w-3" />
            WhatsApp sync soon
          </span>
        </div>
        <div className="space-y-3">
          {slots.length === 0 && <p className="text-sm text-slate-500">No sessions yet. Plan one above to stay on track.</p>}
          {slots.map((slot) => (
            <div
              key={slot.id}
              className="flex flex-col gap-3 rounded-2xl border border-amber-50 bg-gradient-to-r from-white to-[#fff7ed] px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {slot.date || 'Pick a date'} · {slot.time || 'Pick a time'}
                </p>
                <p className="text-xs text-slate-500">Focus: {slot.focus}</p>
                <p className="text-xs text-amber-600">
                  Reminders: {[slot.channels?.whatsapp ? 'WhatsApp' : null, slot.channels?.discord ? 'Discord' : null]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusToggle(slot.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition ${{
                    completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
                    scheduled: 'border-amber-200 bg-white text-slate-600',
                  }[slot.status]}`}
                >
                  <CheckCircle2 className={`h-3.5 w-3.5 ${slot.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`} />
                  {slot.status === 'completed' ? 'Completed' : 'Mark complete'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(slot.id)}
                  className="rounded-full border border-rose-200 bg-white p-2 text-rose-500 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
