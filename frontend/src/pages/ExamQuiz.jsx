import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, BookOpenCheck, CheckCircle2, Loader2, Sparkles, Trophy } from 'lucide-react';
import { getToken } from '../services/authStorage.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const mapSessionResponse = (payload = {}) => ({
  id: payload.id || '',
  fileId: payload.fileId || '',
  fileName: payload.fileName || 'Exam session',
  questionCount: payload.questionCount || payload.questions?.length || 0,
  status: payload.status || 'draft',
  score: typeof payload.score === 'number' ? payload.score : null,
  completedAt: payload.completedAt || null,
  questions: Array.isArray(payload.questions) ? payload.questions : [],
  breakdown: Array.isArray(payload.breakdown) ? payload.breakdown : [],
});

const buildAnswerMap = (entries = []) => {
  const map = {};
  entries.forEach((entry) => {
    if (!entry?.questionId || !Number.isInteger(entry.selectedIndex)) return;
    map[entry.questionId] = entry.selectedIndex;
  });
  return map;
};

export default function ExamQuiz() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const authorizedConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),
    []
  );

  const derivedQuestions = session?.questions || [];
  const answeredCount = derivedQuestions.filter((question) => Object.prototype.hasOwnProperty.call(answers, question.id)).length;
  const progressPercent = derivedQuestions.length ? Math.round((answeredCount / derivedQuestions.length) * 100) : 0;

  const resultBreakdown = useMemo(() => {
    if (result?.breakdown?.length) return result.breakdown;
    if (session?.breakdown?.length) return session.breakdown;
    return [];
  }, [result, session]);

  const breakdownMap = useMemo(() => {
    const map = new Map();
    resultBreakdown.forEach((entry) => {
      if (!entry?.questionId) return;
      map.set(entry.questionId, entry);
    });
    return map;
  }, [resultBreakdown]);

  const normalizedScore = result?.score ?? session?.score ?? null;
  const normalizedTotal = result?.total ?? session?.questionCount ?? derivedQuestions.length;
  const isCompleted = (session?.status === 'completed') || Boolean(result);

  useEffect(() => {
    let ignore = false;

    const bootstrap = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`${API_BASE}/api/exam/session/${sessionId}`, authorizedConfig);
        if (ignore) return;
        const normalized = mapSessionResponse(response.data?.session || {});
        setSession(normalized);

        if (normalized.status === 'completed' && normalized.breakdown.length) {
          setResult({
            score: normalized.score ?? normalized.breakdown.filter((entry) => entry.isCorrect).length,
            total: normalized.questionCount || normalized.breakdown.length,
            breakdown: normalized.breakdown,
            fileName: normalized.fileName,
            completedAt: normalized.completedAt,
          });
          setAnswers(buildAnswerMap(normalized.breakdown));
        } else {
          setResult(null);
        }
      } catch (err) {
        if (ignore) return;
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load exam session.');
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    const stateSession = location.state;
    if (stateSession?.sessionId === sessionId && Array.isArray(stateSession.questions) && stateSession.questions.length) {
      setSession({
        id: stateSession.sessionId,
        fileId: stateSession.fileId || '',
        fileName: stateSession.fileName || 'Exam session',
        questionCount: stateSession.questionCount || stateSession.questions.length,
        status: 'draft',
        score: null,
        completedAt: null,
        questions: stateSession.questions,
        breakdown: [],
      });
      setAnswers({});
      setResult(null);
      setLoading(false);
    } else {
      bootstrap();
    }

    return () => {
      ignore = true;
    };
  }, [sessionId, location.state, authorizedConfig]);

  const handleSelectAnswer = (questionId, optionIndex) => {
    if (!questionId || isCompleted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (!sessionId || !derivedQuestions.length) {
      setError('This quiz is not ready yet.');
      return;
    }

    const payloadAnswers = derivedQuestions
      .filter((question) => Object.prototype.hasOwnProperty.call(answers, question.id))
      .map((question) => ({
        questionId: question.id,
        selectedIndex: answers[question.id],
      }));

    if (!payloadAnswers.length) {
      setError('Answer at least one question before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE}/api/exam/submit`,
        {
          sessionId,
          answers: payloadAnswers,
        },
        authorizedConfig
      );

      const payload = response.data || {};
      const breakdown = payload.breakdown || [];

      setResult({
        score: payload.score ?? breakdown.filter((entry) => entry.isCorrect).length,
        total: payload.total ?? derivedQuestions.length,
        breakdown,
        fileName: payload.fileName || session?.fileName,
        completedAt: payload.completedAt || new Date().toISOString(),
      });

      setSession((prev) =>
        prev
          ? {
              ...prev,
              status: 'completed',
              score: payload.score ?? prev.score,
              completedAt: payload.completedAt || prev.completedAt,
              breakdown,
            }
          : prev
      );

      setAnswers(buildAnswerMap(breakdown));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to submit answers.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegenerate = () => {
    navigate('/app/exam-lab');
  };

  if (!sessionId) {
    return (
      <div className="space-y-4 p-8 text-slate-900">
        <p className="text-lg font-semibold">Missing exam session.</p>
        <Link to="/app/exam-lab" className="text-sm font-semibold text-amber-600 underline">
          Return to Exam Lab
        </Link>
      </div>
    );
  }

  const renderQuestionCard = (question, index) => {
    const breakdownEntry = breakdownMap.get(question.id);
    const correctIndex = breakdownEntry?.correctIndex;
    const selectedIndex = breakdownEntry?.selectedIndex ?? answers[question.id];

    return (
      <div key={question.id || index} className="rounded-2xl border border-slate-100 p-5">
        <p className="text-sm font-semibold text-slate-900">
          Q{index + 1}. {question.prompt}
        </p>
        <div className="mt-3 grid gap-2">
          {question.options.map((option, optionIndex) => {
            const inputId = `${question.id}-${optionIndex}`;
            const isSelected = selectedIndex === optionIndex;
            const isCorrect = typeof correctIndex === 'number' && optionIndex === correctIndex;

            let stateClass = 'border-slate-200 hover:border-amber-200';
            if (isCompleted) {
              if (isCorrect) {
                stateClass = 'border-emerald-400 bg-emerald-50 text-emerald-900';
              } else if (isSelected) {
                stateClass = 'border-rose-300 bg-rose-50 text-rose-900';
              } else {
                stateClass = 'border-slate-100 bg-white';
              }
            } else if (isSelected) {
              stateClass = 'border-amber-400 bg-amber-50 text-amber-900';
            }

            return (
              <label
                key={inputId}
                htmlFor={inputId}
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-3 py-2 text-sm transition ${stateClass}`}
              >
                <input
                  type="radio"
                  id={inputId}
                  name={question.id}
                  value={optionIndex}
                  checked={isSelected || false}
                  disabled={isCompleted}
                  onChange={() => handleSelectAnswer(question.id, optionIndex)}
                  className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                />
                <span>{option}</span>
              </label>
            );
          })}
        </div>
        {isCompleted && breakdownEntry?.explanation && (
          <p className="mt-3 text-sm text-slate-500">Explanation: {breakdownEntry.explanation}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 text-slate-900">
      <section className="rounded-[32px] bg-gradient-to-r from-[#fff4df] via-[#ffe5c2] to-[#ffd09b] p-6 text-slate-900 shadow-[0_25px_50px_rgba(255,193,111,0.35)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <h1 className="mt-2 text-3xl font-semibold">Exam quiz</h1>
            <p className="mt-1 text-sm text-slate-700">
              {session?.fileName ? `Questions pulled from ${session.fileName}` : 'Answer the generated MCQs to get your score.'}
            </p>
          </div>
          <div className="rounded-3xl bg-white/80 px-5 py-4 text-sm backdrop-blur">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Progress</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {answeredCount}/{derivedQuestions.length || session?.questionCount || 0} answered ({progressPercent}%)
            </p>
            <p className="text-xs text-slate-500">Status: {session?.status === 'completed' ? 'Completed' : 'In progress'}</p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
          <div className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-white p-4 text-sm">
          <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
          Loading exam session…
        </div>
      )}

      {!loading && session && (
        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-5">
            {derivedQuestions.length === 0 && (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 text-sm text-slate-500">
                No questions found for this session. Return to Exam Lab and generate a new set.
              </div>
            )}

            {derivedQuestions.map((question, index) => renderQuestionCard(question, index))}

            {!isCompleted && derivedQuestions.length > 0 && (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200/70 disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {submitting ? 'Scoring…' : 'Submit answers'}
                </button>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate another exam
                </button>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Exam meta</p>
                  <p className="text-base font-semibold text-slate-900">{session?.fileName || 'Exam session'}</p>
                  <p className="text-sm text-slate-500">{session?.questionCount || derivedQuestions.length} questions</p>
                </div>
                <BookOpenCheck className="h-6 w-6 text-amber-500" />
              </div>
              <div className="mt-4 text-sm text-slate-600">
                <p>
                  All questions are based on your uploaded PDF. Submit when ready to compute your score and detailed breakdown.
                </p>
              </div>
              <Link
                to="/app/exam-lab"
                className="mt-4 inline-flex items-center text-xs font-semibold text-amber-600"
              >
                Need a different PDF? ↗
              </Link>
            </div>

            {(isCompleted || result) && (
              <div className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Your score</p>
                    <p className="text-3xl font-semibold text-slate-900">
                      {normalizedScore}/{normalizedTotal}
                    </p>
                    <p className="text-sm text-slate-500">
                      {Math.round(((normalizedScore || 0) / (normalizedTotal || 1)) * 100)}% correct
                    </p>
                  </div>
                  <Trophy className="h-8 w-8 text-amber-500" />
                </div>
                {result?.completedAt || session?.completedAt ? (
                  <p className="mt-3 text-xs text-slate-500">
                    Completed at {new Date(result?.completedAt || session?.completedAt).toLocaleString()}
                  </p>
                ) : null}
                <Link
                  to="/app/exam-lab"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-emerald-600"
                >
                  Take another practice ↗
                </Link>
              </div>
            )}

            {!isCompleted && (
              <div className="rounded-[28px] border border-amber-100 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.3em] text-amber-600">Quick tips</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
                  <li>Answer confidently—there is no penalty for skipping, but attempted questions help tailor feedback.</li>
                  <li>Use the submit button whenever you need a checkpoint score. You can always generate a fresh set later.</li>
                </ul>
              </div>
            )}
          </aside>
        </section>
      )}
    </div>
  );
}
