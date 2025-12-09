import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { ArrowRight, Bot, MessageSquare, Paperclip, Send, Sparkles } from 'lucide-react';
import { getToken, getStoredUser } from '../services/authStorage.js';

const formatTime = (date = new Date()) =>
  new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const MAX_HISTORY = 12;
const mapHistoryForApi = (history = []) =>
  history
    .filter((entry) => ['mentor', 'student'].includes(entry.role))
    .slice(-MAX_HISTORY)
    .map((entry) => ({
      role: entry.role === 'mentor' ? 'assistant' : 'user',
      content: entry.content,
    }));

export default function MentorLab() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'mentor',
      content: 'Hey! Drop blockers, upcoming exams, or anything that needs a coach-style response. I will keep the tone warm, specific, and actionable.',
      timestamp: formatTime(),
    },
  ]);
  const [attachments, setAttachments] = useState([]);
  const [mentorError, setMentorError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const quickPrompts = useMemo(
    () => [
      'Help me summarize the key blockers from today\'s study.',
      'Draft a warm update for my mentor about lab progress.',
      'Create a revision sprint plan for Unit 3 physics.',
      'Suggest how to respond to a staff follow-up politely.',
    ],
    []
  );

  const user = getStoredUser();
  const token = getToken();

  const appendMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const buildMessage = (content, role = 'student', extra = {}) => ({
    id: crypto.randomUUID(),
    role,
    content: content.trim(),
    timestamp: formatTime(),
    ...extra,
  });

  const requestMentorReply = async ({ prompt, historyPayload, outboundAttachments }) => {
    if (!token) {
      const error = new Error('Please sign in to chat with Mentor AI.');
      error.userFacing = 'Sign in to chat with Mentor AI.';
      throw error;
    }

    const response = await axios.post(
      `${API_BASE}/api/mentor/chat`,
      {
        prompt,
        history: historyPayload,
        attachments: outboundAttachments,
        student: user?.name || 'Student',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.data?.success || !response.data?.reply) {
      const error = new Error('Mentor reply missing');
      error.userFacing = 'Mentor AI did not return a response.';
      throw error;
    }

    return response.data.reply;
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    const prompt = input.trim();
    const outboundAttachments = attachments;
    const studentMessage = buildMessage(prompt, 'student', outboundAttachments.length ? { attachments: outboundAttachments } : {});

    appendMessage(studentMessage);
    setInput('');
    setAttachments([]);
    setMentorError('');

    const historyPayload = mapHistoryForApi([...messages, studentMessage]);

    setIsSending(true);
    try {
      const reply = await requestMentorReply({ prompt, historyPayload, outboundAttachments });
      appendMessage(buildMessage(reply, 'mentor'));
    } catch (error) {
      const facing = error.userFacing || error.response?.data?.message || 'Mentor AI is taking longer than usual. Try again shortly.';
      setMentorError(facing);
    } finally {
      setIsSending(false);
    }
  };

  const handleAttach = (event) => {
    const fileList = Array.from(event.target.files || []);
    if (!fileList.length) return;
    const mapped = fileList.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
    }));
    setAttachments((prev) => [...prev, ...mapped]);
  };

  return (
    <div className="space-y-8 text-slate-900">
      <section className="rounded-[36px] border border-amber-100 bg-gradient-to-br from-[#fff5e6] via-white to-[#ffe4c6] px-6 py-7 shadow-[0_35px_90px_rgba(255,193,111,0.35)] animate-fadeInUp">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-600">Mentor lab</p>
            <div>
              <h1 className="text-3xl font-semibold leading-tight">A warm space to talk through blockers.</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Summarize doubts, prep mentor updates, or convert complaints into positive action steps. The assistant keeps everything aligned
                with the amber workspace.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 text-xs font-semibold text-amber-700">
              <Sparkles className="h-4 w-4" /> Tip: Add attachments so mentors see context immediately.
            </div>
          </div>
          <div className="rounded-3xl border border-amber-100 bg-white/90 px-5 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Next sync</p>
            <p className="mt-2 text-base font-semibold text-slate-900">Tonight · 07:00 PM</p>
            <p className="text-xs text-slate-500">Share progress before the call so your mentor has full context.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-5">
          <div className="rounded-[28px] border border-amber-100 bg-white/90 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Quick prompts</p>
                <h2 className="text-xl font-semibold">Kickstart the conversation</h2>
              </div>
              <MessageSquare className="h-5 w-5 text-amber-500" />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-2 text-left text-sm text-amber-800 transition hover:border-amber-200 hover-lift animate-fadeInUp"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-amber-100 bg-white/90 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Attachments</p>
                <h2 className="text-xl font-semibold">Give mentors instant context</h2>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-600 hover:border-amber-300">
                <Paperclip className="h-4 w-4" /> Add files
                <input type="file" onChange={handleAttach} multiple className="hidden" />
              </label>
            </div>
            {attachments.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 px-4 py-5 text-sm text-amber-700">
                No attachments yet. Drag a PDF or screenshot to help your mentor understand the situation instantly.
              </p>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                {attachments.map((file) => (
                  <li key={file.id} className="flex items-center justify-between rounded-2xl border border-amber-50 bg-white/80 px-4 py-2">
                    <span>{file.name}</span>
                    <span className="text-xs text-slate-400">{file.size}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-[32px] border border-amber-100 bg-white px-6 py-6 shadow-sm animate-fadeInUp">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Conversation</p>
              <h2 className="text-xl font-semibold">Mentor thread</h2>
            </div>
            <Bot className="h-6 w-6 text-amber-500" />
          </div>
          <div className="mt-4 flex flex-col gap-4 max-h-[420px] overflow-y-auto pr-2 animate-fadeInUp">
            {messages.map((message) => {
              const isMentor = message.role === 'mentor';
              return (
                <div key={message.id} className={`flex ${isMentor ? 'justify-start' : 'justify-end'}`}>
                  <div
                    className={`max-w-[85%] rounded-[28px] border px-5 py-4 text-sm shadow-sm ${{
                      true: isMentor,
                    } && (isMentor ? 'border-amber-100 bg-white text-slate-800' : 'border-amber-200 bg-amber-50 text-[#7a4a00]')}`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.35em] text-amber-500">
                      <span>{isMentor ? 'Mentor' : 'You'}</span>
                      <span>{message.timestamp}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed">{message.content}</p>
                    {message.attachments?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-amber-600">
                        {message.attachments.map((file) => (
                          <span key={file.id} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1">
                            📎 {file.name}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 space-y-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type an update, blocker, or mentoring request…"
              className="min-h-[120px] w-full rounded-[28px] border border-amber-100 bg-amber-50/50 px-5 py-4 text-sm text-slate-900 placeholder:text-amber-400 focus:border-amber-300 focus:outline-none"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-amber-600">
                <Paperclip className="h-4 w-4" /> Attach files
                <input type="file" multiple className="hidden" onChange={handleAttach} />
              </label>
              <div className="flex flex-col items-end gap-2">
                {mentorError ? <p className="text-xs text-rose-600">{mentorError}</p> : null}
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim() || isSending}
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-200/70 disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <Send className="h-4 w-4 animate-pulse" /> Sending…
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send update
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-amber-100 bg-white px-6 py-6 shadow-sm animate-fadeInUp">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Playbook</p>
            <h2 className="text-xl font-semibold">How to get faster mentor replies</h2>
          </div>
          <ArrowRight className="h-4 w-4 text-amber-500" />
        </div>
        <ul className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
          <li className="rounded-2xl border border-amber-50 bg-amber-50/60 px-4 py-3 animate-fadeInUp" style={{ animationDelay: '0.04s' }}>Attach evidence (screens, transcripts) so mentors skip guesswork.</li>
          <li className="rounded-2xl border border-amber-50 bg-amber-50/60 px-4 py-3 animate-fadeInUp" style={{ animationDelay: '0.12s' }}>Mention your next session or exam date so recommendations are timely.</li>
          <li className="rounded-2xl border border-amber-50 bg-amber-50/60 px-4 py-3 animate-fadeInUp" style={{ animationDelay: '0.20s' }}>Close every chat with an explicit ask: review, advice, or accountability.</li>
        </ul>
      </section>
    </div>
  );
}
