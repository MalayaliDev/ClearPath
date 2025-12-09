import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { getToken } from '../services/authStorage.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const QUESTION_CHOICES = [10, 20, 30];

const formatDateTime = (iso) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return '—';
  }
};

const formatBytes = (bytes = 0) => {
  if (!Number.isFinite(bytes)) return null;
  if (bytes === 0) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value > 10 ? 0 : 1)} ${units[index]}`;
};

export default function ExamLab() {
  const navigate = useNavigate();
  const [uploads, setUploads] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [selectedFileId, setSelectedFileId] = useState('');
  const [selectedFileName, setSelectedFileName] = useState('');
  const [questionCount, setQuestionCount] = useState(20);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('Pick a PDF to start');

  const authorizedConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),
    []
  );

  const fetchUploads = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/pdf/uploads/recent`, authorizedConfig);
      setUploads(response.data?.uploads || []);
      if (!selectedFileId && response.data?.uploads?.length) {
        const first = response.data.uploads[0];
        setSelectedFileId(first.id || first.fileId || '');
        setSelectedFileName(first.originalName || first.fileName || 'Selected PDF');
        setStatusMessage('Ready to generate an exam');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load uploads. Head to PDF Lab first.');
    }
  }, [authorizedConfig, selectedFileId]);

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const response = await axios.get(`${API_BASE}/api/exam/history`, authorizedConfig);
      setHistory(response.data?.history || []);
    } catch (err) {
      console.error(err);
      setError((prev) => prev || err.response?.data?.message || 'Failed to load exam history.');
    } finally {
      setHistoryLoading(false);
    }
  }, [authorizedConfig]);

  useEffect(() => {
    fetchUploads();
    fetchHistory();
  }, [fetchUploads, fetchHistory]);

  const heroStats = [
    {
      label: 'Recent PDFs',
      value: uploads.length,
      sub: 'From PDF Lab',
      icon: UploadCloud,
    },
    {
      label: 'Completed exams',
      value: history.length,
      sub: 'Last 10 sessions',
      icon: CheckCircle2,
    },
    {
      label: 'Question count',
      value: `${questionCount}`,
      sub: 'Active selection',
      icon: BookOpenCheck,
    },
  ];

  const handleSelectFile = (file) => {
    setSelectedFileId(file.id || file.fileId || '');
    setSelectedFileName(file.originalName || file.fileName || 'Selected PDF');
    setStatusMessage('Ready to generate an exam');
  };

  const handleGenerateExam = async () => {
    if (!selectedFileId) {
      setError('Pick a PDF before generating questions.');
      return;
    }
    try {
      setGenerating(true);
      setError('');
      const response = await axios.post(
        `${API_BASE}/api/exam/generate`,
        {
          fileId: selectedFileId,
          questionCount,
        },
        authorizedConfig
      );

      const payload = response.data || {};
      if (!payload.sessionId) {
        setError('Exam service returned an empty session. Try again.');
        return;
      }

      navigate(`/app/exam-lab/${payload.sessionId}`, {
        state: {
          sessionId: payload.sessionId,
          questions: payload.questions || [],
          questionCount: payload.questionCount || questionCount,
          fileName: payload.fileName || selectedFileName,
          fileId: selectedFileId,
        },
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to generate exam questions.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 text-slate-900">
      <section className="rounded-[36px] border border-amber-100 bg-gradient-to-br from-[#fff5e6] via-white to-[#ffe4c6] px-6 py-7 shadow-[0_35px_90px_rgba(255,193,111,0.35)] animate-fadeInUp">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-600">Exam lab</p>
            <div>
              <h1 className="text-3xl font-semibold leading-tight">Generate practice MCQs in one tap.</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Choose a PDF you uploaded, pick the number of questions, and we will craft a quiz. Stay in the warm workspace and jump into the exam view instantly.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 text-xs font-semibold text-amber-700">
              <Sparkles className="h-4 w-4" /> {statusMessage}
            </div>
          </div>
          <div className="rounded-3xl border border-amber-100 bg-white/90 px-5 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Need more PDFs?</p>
            <p className="mt-2 text-base font-semibold text-slate-900">Head to PDF Lab, upload the next chapter, then return here.</p>
            <button
              type="button"
              onClick={fetchUploads}
              className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-600"
            >
              <RefreshCcw className="h-4 w-4" /> Refresh uploads
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {heroStats.map(({ label, value, sub, icon: Icon }, idx) => (
            <div key={label} className="rounded-2xl border border-white/80 bg-white/85 px-4 py-4 shadow-sm animate-fadeInUp" style={{ animationDelay: `${idx * 0.08}s` }}>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-400">
                <Icon className="h-3.5 w-3.5 text-amber-500" />
                <span>{label}</span>
              </div>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
              <p className="text-xs text-slate-500">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      <section className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
        <div className="rounded-[32px] border border-amber-100 bg-white px-6 py-6 shadow-sm animate-fadeInUp">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-500">1. Select PDF</p>
              <h2 className="text-xl font-semibold">Recent uploads from PDF Lab</h2>
            </div>
            <button
              type="button"
              onClick={fetchUploads}
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-600"
            >
              <RefreshCcw className="h-4 w-4" /> Refresh
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {uploads.length === 0 && (
              <p className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 px-4 py-6 text-sm text-amber-700">
                No PDFs yet. Upload and analyze files inside PDF Lab to unlock Exam Lab generation.
              </p>
            )}

            {uploads.map((file, idx) => {
              const id = file.id || file.fileId;
              const isActive = selectedFileId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectFile(file)}
                  className={`text-left rounded-2xl border px-4 py-4 transition animate-fadeInUp ${
                    isActive ? 'border-amber-500 bg-[#fff7ea] shadow-[0_10px_30px_rgba(255,193,111,0.25)]' : 'border-amber-50 bg-white hover:border-amber-200'
                  }`}
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{file.originalName || file.fileName || 'PDF file'}</p>
                      <p className="text-xs text-slate-500">{formatDateTime(file.updatedAt || file.createdAt)}</p>
                    </div>
                    <UploadCloud className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
                    {file.pageCount ? <span>{file.pageCount} pages</span> : null}
                    {Number.isFinite(file.size) ? <span>{formatBytes(file.size)}</span> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[32px] border border-amber-100 bg-white px-6 py-6 shadow-sm animate-fadeInUp">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-500">2. Question volume</p>
          <h2 className="text-xl font-semibold">Pick how intense the drill should be</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {QUESTION_CHOICES.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setQuestionCount(count)}
                className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                  questionCount === count ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-amber-100 bg-white text-slate-600 hover:border-amber-200'
                }`}
              >
                {count} questions
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <p>
              We generate MCQs directly from your PDF focus area. Every session is stored so you can revisit history and review scores.
            </p>
            <p className="text-xs text-slate-400">Note: Generation can take 10-20 seconds if AI providers are cold-starting.</p>
          </div>

          <button
            type="button"
            onClick={handleGenerateExam}
            disabled={generating || !selectedFileId}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-200/70 disabled:opacity-60"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {generating ? 'Creating exam…' : 'Generate exam set'}
          </button>

          <p className="mt-3 text-center text-xs text-slate-500">You will jump straight into the quiz once generation is done.</p>
        </div>
      </section>

      <section className="rounded-[32px] border border-amber-100 bg-white px-6 py-6 shadow-sm animate-fadeInUp">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500">3. Recent drills</p>
            <h2 className="text-xl font-semibold">Exam history & scorecards</h2>
          </div>
          <button
            type="button"
            onClick={fetchHistory}
            className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-600"
          >
            <RefreshCcw className="h-4 w-4" /> Refresh history
          </button>
        </div>

        {historyLoading ? (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-50 bg-white px-4 py-4 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-amber-500" /> Loading exam history…
          </div>
        ) : history.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 px-4 py-6 text-sm text-amber-700">
            No completed exams yet. Generate your first set to see the streak here.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {history.map((entry, idx) => {
              const percent = entry.total ? Math.round(((entry.score || 0) / entry.total) * 100) : 0;
              return (
                <div key={entry.id} className="rounded-3xl border border-amber-50 bg-gradient-to-br from-white via-[#fff8ef] to-white p-5 shadow-sm animate-fadeInUp" style={{ animationDelay: `${idx * 0.08}s` }}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{entry.fileName || 'Exam session'}</p>
                      <p className="text-xs text-slate-500">Completed {formatDateTime(entry.completedAt)}</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-semibold text-slate-900">{entry.score}/{entry.total}</p>
                      <p className="text-xs text-slate-500">{percent}% correct</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Scorecard</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
