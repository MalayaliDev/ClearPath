import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { BookOpen, FileText, Loader2, MessageSquare, Send, Sparkles, Trash2, UploadCloud } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getToken } from '../services/authStorage.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DEFAULT_INSIGHTS = 'Upload a PDF to generate highlights, quick questions, and revision notes.';
const EMPTY_THREAD_PROMPT = 'Ask anything about formulas, important questions, or revision tips and the chat will summarize it here.';

const formatBytes = (bytes = 0) => {
  if (!Number.isFinite(bytes)) return '-';
  if (bytes === 0) return '0 KB';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value > 10 ? 0 : 1)} ${units[index]}`;
};

const formatTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString();
};

const formatChatTimestamp = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatChatDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

export default function PdfLab() {
  const [uploads, setUploads] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [qaLoading, setQaLoading] = useState(false);
  const [chatListLoading, setChatListLoading] = useState(false);
  const [chatHistoryLoading, setChatHistoryLoading] = useState(false);
  const [insights, setInsights] = useState(DEFAULT_INSIGHTS);
  const [qaThread, setQaThread] = useState([]);
  const [questionInput, setQuestionInput] = useState('');
  const [error, setError] = useState('');
  const [chatSummaries, setChatSummaries] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [allowAutoFileSelection, setAllowAutoFileSelection] = useState(true);
  const [pendingNewChat, setPendingNewChat] = useState(false);

  const activeFile = useMemo(() => {
    if (!uploads.length) return null;
    return uploads.find((file) => file.id === selectedFileId) || null;
  }, [uploads, selectedFileId]);

  const activeChat = useMemo(() => chatSummaries.find((chat) => chat.id === activeChatId) || null, [chatSummaries, activeChatId]);
  const targetFileId = pendingNewChat ? null : activeChat?.fileId || activeFile?.id || null;
  const targetFileName = useMemo(() => {
    if (pendingNewChat && !targetFileId) {
      return 'Upload or pick a PDF to start chatting';
    }
    return activeChat?.fileName || activeFile?.originalName || 'Selected PDF';
  }, [pendingNewChat, targetFileId, activeChat, activeFile]);
  const chatsForSelectedFile = useMemo(() => {
    if (!selectedFileId) return chatSummaries;
    return chatSummaries.filter((chat) => chat.fileId === selectedFileId);
  }, [chatSummaries, selectedFileId]);
  const visibleChats = selectedFileId ? chatsForSelectedFile : chatSummaries;

  const statusLabel = useMemo(() => {
    if (uploading) return 'Uploading…';
    if (analyzing) return 'Analyzing';
    if (qaLoading) return 'Answering';
    return uploads.length ? 'Ready' : 'Idle';
  }, [uploading, analyzing, qaLoading, uploads.length]);

  const answeredCount = qaThread.length;

  const heroStats = [
    { label: 'Uploads', value: uploads.length, icon: UploadCloud },
    { label: 'Answered', value: answeredCount, icon: MessageSquare },
    { label: 'Status', value: statusLabel, icon: Sparkles },
  ];

  const activeFileSizeLabel = useMemo(() => {
    if (activeFile?.size) return formatBytes(activeFile.size);
    if (activeChat?.fileSize) return formatBytes(activeChat.fileSize);
    return null;
  }, [activeFile?.size, activeChat?.fileSize]);

  const lastUpdatedLabel = useMemo(() => {
    const latestTimestamp = qaThread[0]?.timestamp;
    if (!latestTimestamp) return null;
    return formatChatTimestamp(latestTimestamp);
  }, [qaThread]);

  const authorizedConfig = {
    withCredentials: true,
  };

  const upsertChatSummary = (summary) => {
    if (!summary?.id) return;
    setChatSummaries((prev) => {
      const filtered = prev.filter((chat) => chat.id !== summary.id);
      return [summary, ...filtered].slice(0, 30);
    });
  };

  const loadChatEntries = async (chatId) => {
    if (!chatId) return;
    setChatHistoryLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE}/api/pdf/chat/${chatId}`, authorizedConfig);
      setActiveChatId(chatId);
      const entries = response.data.entries || [];
      setQaThread(entries);
      if (entries.length) {
        setInsights(entries[0].answer);
      } else {
        setInsights(EMPTY_THREAD_PROMPT);
      }
      const chat = response.data.chat;
      if (chat?.fileId) {
        setSelectedFileId(chat.fileId);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load chat history.');
    } finally {
      setChatHistoryLoading(false);
    }
  };

  const handleSelectFile = async (fileId) => {
    setAllowAutoFileSelection(false);
    if (activeChat?.fileId !== fileId) {
      setActiveChatId(null);
      setQaThread([]);
      setInsights(DEFAULT_INSIGHTS);
    }
    setSelectedFileId(fileId);
    if (pendingNewChat) {
      await createChatForFile(fileId);
    }
  };

  const handleStartNewChat = async () => {
    setError('');
    setQaThread([]);
    setQuestionInput('');
    setActiveChatId(null);

    const immediateFileId = selectedFileId || activeChat?.fileId || uploads[0]?.id || null;

    if (immediateFileId) {
      setPendingNewChat(false);
      setSelectedFileId(immediateFileId);
      setAllowAutoFileSelection(false);
      await createChatForFile(immediateFileId);
      return;
    }

    setSelectedFileId(null);
    setInsights('Upload a PDF or choose one from “Recent uploads” to begin this chat.');
    setPendingNewChat(true);
    setAllowAutoFileSelection(false);
  };

  const createChatForFile = async (fileId) => {
    try {
      const response = await axios.post(
        `${API_BASE}/api/pdf/chat`,
        { fileId, title: questionInput || 'New chat' },
        authorizedConfig
      );
      const chat = response.data.chat;
      if (chat) {
        setChatSummaries((prev) => [chat, ...prev]);
        setSelectedFileId(chat.fileId);
        setActiveChatId(chat.id);
        setQaThread([]);
        setInsights(EMPTY_THREAD_PROMPT);
        setQuestionInput('');
        setPendingNewChat(false);
        await loadChatEntries(chat.id);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to start a new chat.');
      setPendingNewChat(false);
    }
  };

  const handleDeleteUpload = async (fileId) => {
    const confirmed = window.confirm('Remove this PDF and its chats?');
    if (!confirmed) return;
    setError('');
    try {
      await axios.delete(`${API_BASE}/api/pdf/upload/${fileId}`, authorizedConfig);
      await fetchUploads();
      await fetchChats();
      if (selectedFileId === fileId) {
        setSelectedFileId(null);
        setAllowAutoFileSelection(true);
        setActiveChatId(null);
        setQaThread([]);
        setInsights('Select a chat or ask something new.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete upload.');
    }
  };

  const handleDeleteChat = async (chatId) => {
    const confirmed = window.confirm('Delete this chat?');
    if (!confirmed) return;
    setError('');
    try {
      await axios.delete(`${API_BASE}/api/pdf/chat/${chatId}`, authorizedConfig);
      await fetchChats();
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setQaThread([]);
        setInsights('Select another chat or ask a new question.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete chat.');
    }
  };

  const fetchUploads = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/pdf/uploads/recent`, authorizedConfig);
      const uploads = response.data.uploads || [];
      setUploads(uploads);
      if (allowAutoFileSelection && !selectedFileId && uploads.length) {
        const firstId = uploads[0].id;
        setSelectedFileId(firstId);
        setAllowAutoFileSelection(false);
        if (pendingNewChat) {
          await createChatForFile(firstId);
        }
      }
    } catch (err) {
      console.error(err);
      setError((prev) => prev || err.response?.data?.message || 'Failed to load uploads.');
    }
  };

  const fetchChats = async () => {
    setChatListLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/pdf/chats`, authorizedConfig);
      const chats = response.data.chats || [];
      setChatSummaries(chats);
    } catch (err) {
      console.error(err);
      setError((prev) => prev || err.response?.data?.message || 'Failed to load chats.');
    } finally {
      setChatListLoading(false);
    }
  };

  useEffect(() => {
    fetchUploads();
    fetchChats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!chatSummaries.length) return;

    if (!selectedFileId) {
      if (!activeChatId) {
        loadChatEntries(chatSummaries[0].id);
      }
      return;
    }

    const chatsForFile = chatSummaries.filter((chat) => chat.fileId === selectedFileId);
    if (chatsForFile.length === 0) {
      if (activeChatId) {
        setActiveChatId(null);
      }
      setInsights('No chats yet. Ask a question to create one.');
      return;
    }

    const isActiveChatForFile = chatsForFile.some((chat) => chat.id === activeChatId);
    if (isActiveChatForFile) {
      return;
    }

    loadChatEntries(chatsForFile[0].id);
  }, [selectedFileId, chatSummaries, activeChatId]);

  const handlePdfUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError('');

    try {
      const uploadedBatch = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(`${API_BASE}/api/pdf/upload`, formData, {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        uploadedBatch.push(response.data.metadata);
      }

      const updatedUploads = [...uploadedBatch, ...uploads].slice(0, 5);
      setUploads(updatedUploads);
      const firstNewId = uploadedBatch[0]?.id || null;
      setSelectedFileId(firstNewId);
      if (pendingNewChat && firstNewId) {
        await createChatForFile(firstNewId);
      }
      setInsights('Pick a file on the left and tap “Analyze all” to generate highlights.');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to upload PDF.');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyzePdf = async () => {
    if (!targetFileId) {
      setError('Select a PDF or existing chat first.');
      return;
    }
    setAnalyzing(true);
    setError('');

    try {
      const defaultPrompt = 'List important questions, chapter summary, and exam-ready revision bullets from this PDF.';
      const response = await axios.post(
        `${API_BASE}/api/pdf/analyze`,
        {
          fileId: targetFileId,
          question: questionInput || defaultPrompt,
          chatId: activeChatId,
        },
        authorizedConfig
      );
      const answer = response.data.answer;
      setInsights(answer);
      const newEntry =
        response.data.entry ||
        {
          id: crypto.randomUUID(),
          question: questionInput || 'Summaries + important questions',
          answer,
          timestamp: new Date().toISOString(),
        };
      setQaThread((prev) => [newEntry, ...prev]);
      if (response.data.chat) {
        setActiveChatId(response.data.chat.id);
        upsertChatSummary(response.data.chat);
      }
      setQuestionInput('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to analyze PDF.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAskPdfQuestion = async () => {
    if (!targetFileId) {
      setError('Select a PDF or existing chat first.');
      return;
    }
    if (!questionInput.trim()) return;

    setQaLoading(true);
    setError('');
    const trimmed = questionInput.trim();

    try {
      const response = await axios.post(
        `${API_BASE}/api/pdf/ask`,
        { fileId: targetFileId, question: trimmed, chatId: activeChatId },
        authorizedConfig
      );

      const answer = response.data.answer;
      const entry =
        response.data.entry ||
        {
          id: crypto.randomUUID(),
          question: trimmed,
          answer,
          timestamp: new Date().toISOString(),
        };
      setQaThread((prev) => [entry, ...prev]);
      setInsights(answer);
      if (response.data.chat) {
        setActiveChatId(response.data.chat.id);
        upsertChatSummary(response.data.chat);
      }
      setQuestionInput('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to answer question.');
    } finally {
      setQaLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-[32px] border border-amber-100 bg-gradient-to-br from-amber-50/80 via-white to-white px-6 py-6 shadow-lg shadow-amber-100/70">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500">PDF knowledge base</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Upload PDFs. Let AI summarize.</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-500">
              Drop in your syllabus PDFs, lab manuals, or mentor notes. PdfLab keeps the last uploads handy, crafts chapter summaries, and
              keeps every chat ready for quick revision.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {heroStats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-white/80 bg-white/80 px-5 py-3 text-left shadow-sm">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-400">
                  <Icon className="h-3.5 w-3.5 text-amber-500" />
                  <span>{label}</span>
                </div>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-amber-500">Upload PDFs AI</p>
            <h2 className="text-2xl font-semibold text-slate-900">Drop files to study smarter</h2>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-600 hover:border-amber-300">
            <UploadCloud className="h-4 w-4" />
            <input type="file" accept="application/pdf" multiple className="hidden" onChange={handlePdfUpload} />
            Upload PDF
          </label>
        </div>
        <p className="text-sm text-slate-500">
          We will keep the last five uploads handy. Analyze them to generate highlights, quick questions, cheat sheets, or viva prompts.
        </p>

        {error && <p className="rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-2 text-sm text-rose-600">{error}</p>}

        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 shadow-inner shadow-amber-100/70">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2 text-slate-700">
                  <BookOpen className="h-4 w-4 text-amber-500" /> <span>Recent uploads</span>
                </div>
                <button
                  type="button"
                  disabled={!uploads.length || analyzing}
                  onClick={handleAnalyzePdf}
                  className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-white/70 px-3 py-1 text-xs font-semibold text-amber-600 shadow-sm transition hover:border-amber-300 disabled:opacity-40"
                >
                  {analyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                  {analyzing ? 'Analyzing…' : 'Analyze file'}
                </button>
              </div>
              <div className="mt-3 space-y-3">
                {uploads.length === 0 && <p className="rounded-2xl bg-white/70 px-3 py-2 text-sm text-slate-500">Nothing yet. Upload a PDF to get started.</p>}
                {uploads.map((file) => (
                  <div key={file.id} className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedFileId(file.id)}
                      className={`group flex w-full items-center gap-3 rounded-2xl border px-3 py-2 text-left text-xs transition ${
                        activeFile?.id === file.id
                          ? 'border-amber-300 bg-white shadow-md shadow-amber-100/60'
                          : 'border-white bg-white/70 hover:border-amber-200 hover:bg-white'
                      }`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${activeFile?.id === file.id ? 'border-amber-200 bg-amber-50 text-amber-600' : 'border-slate-100 bg-white text-slate-400'}`}>
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 group-hover:text-slate-950">{file.originalName}</p>
                        <p className="text-slate-500">
                          {formatBytes(file.size)} · {formatTime(file.uploadedAt)}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                        Ready
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUpload(file.id);
                      }}
                      className="rounded-full border border-white bg-white/80 p-2 text-slate-400 shadow-sm transition hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Your chats</span>
                <button
                  type="button"
                  onClick={handleStartNewChat}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-slate-900"
                >
                  <span className="inline-flex items-center gap-1">
                    <span className="text-lg leading-none">✎</span>
                    <span>New chat</span>
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/80">Ctrl+Shift+O</span>
                </button>
              </div>
              <div className="mt-3 space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {chatListLoading && <p className="text-sm text-slate-500">Loading chats…</p>}
                {!chatListLoading && chatSummaries.length === 0 && (
                  <p className="text-sm text-slate-500">No chats yet. Ask a question to create one.</p>
                )}
                {chatSummaries.map((chat) => (
                  <div key={chat.id} className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => loadChatEntries(chat.id)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-xs transition ${
                        activeChatId === chat.id
                          ? 'border-amber-300 bg-amber-50/70 shadow-sm shadow-amber-100'
                          : 'border-slate-100 bg-white hover:border-amber-100'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-slate-400">
                        <span className="text-[11px] uppercase tracking-wide">{formatChatDate(chat.lastInteractionAt)}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          {chat.messageCount} msgs
                        </span>
                      </div>
                      <p className="mt-1 font-semibold text-slate-900">{chat.title}</p>
                      <p className="text-slate-500 line-clamp-2">{chat.preview || 'No messages yet. Ask away!'}</p>
                      <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-500">
                        <Sparkles className="h-3 w-3" />
                        <span>{chat.fileName || 'PDF thread'}</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChat(chat.id);
                      }}
                      className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[42px] border border-amber-200/60 bg-gradient-to-br from-[#f7f6f4] via-white to-[#f1eeea] p-6 text-slate-900 shadow-[0_25px_60px_rgba(15,23,42,0.08)]">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.4em] text-amber-500">
                  <FileText className="h-4 w-4" />
                  <span>Highlights & chat</span>
                </div>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{activeChat?.title || targetFileName}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-amber-600">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-amber-700">
                    <Sparkles className="h-3 w-3" />
                    {targetFileName}
                  </span>
                  {activeFileSizeLabel && (
                    <span className="rounded-full bg-white/60 px-3 py-1 text-amber-600">{activeFileSizeLabel}</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={handleAnalyzePdf}
                disabled={!targetFileId || analyzing}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500/90 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-300/50 transition hover:bg-amber-500 disabled:opacity-50"
              >
                {analyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>{analyzing ? 'Analyzing…' : 'Analyze all'}</span>
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-amber-700">
              <span className="rounded-full border border-amber-200 bg-white px-3 py-1">
                {qaThread.length || 0} replies
              </span>
              <span className="rounded-full border border-amber-200 bg-white px-3 py-1">Status · {statusLabel}</span>
              {lastUpdatedLabel && (
                <span className="rounded-full border border-amber-200 bg-white px-3 py-1">Updated {lastUpdatedLabel}</span>
              )}
            </div>

            <div className="mt-5 max-h-[360px] space-y-4 overflow-y-auto pr-2">
              {chatHistoryLoading && <p className="text-sm text-slate-500">Loading chat history…</p>}
              {!chatHistoryLoading && qaThread.length === 0 && (
                <p className="rounded-3xl border border-dashed border-amber-100 bg-white/70 px-4 py-3 text-sm text-slate-500">{EMPTY_THREAD_PROMPT}</p>
              )}

              {qaThread.map((entry) => (
                <div key={entry.id} className="space-y-2">
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-[28px] border border-amber-300/70 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 px-5 py-4 text-sm text-slate-900 shadow-lg shadow-amber-200/60">
                      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.35em] text-amber-800/70">
                        <span>You</span>
                        <span>{formatChatTimestamp(entry.timestamp)}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-base font-semibold">{entry.question}</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-[28px] border border-amber-200 bg-white px-5 py-4 text-sm text-slate-800 shadow-lg shadow-amber-100/50">
                      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.35em] text-amber-600/80">
                        <span>Study AI</span>
                        <span>{formatChatTimestamp(entry.timestamp)}</span>
                      </div>
                      <div className="mt-2 text-base leading-relaxed prose prose-sm max-w-none">
                        <ReactMarkdown>{entry.answer}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[36px] border border-amber-200 bg-white p-4 shadow-sm shadow-slate-200/50">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-500">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Ask anything about your PDF</span>
                <div className="ml-auto flex items-center gap-2 text-[10px] tracking-wide text-amber-400">
                  <span className="rounded-full border border-amber-200 px-2 py-0.5">Enter ↵</span>
                  <span className="rounded-full border border-amber-200 px-2 py-0.5">Shift + ↵ newline</span>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3 rounded-[30px] border border-slate-200/70 bg-white px-5 py-3 text-slate-900 shadow-sm">
                  <MessageSquare className="h-4 w-4 text-amber-500" />
                  <input
                    className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    placeholder={qaLoading ? 'Studying your PDF…' : 'Ask anything about your PDF'}
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        handleAskPdfQuestion();
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAskPdfQuestion}
                  disabled={qaLoading || !questionInput.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-400/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {qaLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
