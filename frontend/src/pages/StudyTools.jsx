import React, { useMemo, useState } from 'react';
import { ArrowRight, BookOpenCheck, CheckCircle2, Layers, Sparkles, Target } from 'lucide-react';

export default function StudyTools() {
  const [assetTitle, setAssetTitle] = useState('');
  const [assetType, setAssetType] = useState('notes');
  const [assetContent, setAssetContent] = useState('');
  const [assets, setAssets] = useState([
    { id: 'asset-1', title: 'Electrostatics viva', type: 'notes', updatedAt: 'Today · 10:20 AM' },
    { id: 'asset-2', title: 'Lab viva cues', type: 'transcript', updatedAt: 'Yesterday · 07:40 PM' },
  ]);

  const [decks, setDecks] = useState([
    { id: 'deck-1', title: 'Unit 3 flashcards', count: 20, score: 82, updatedAt: '2h ago' },
    { id: 'deck-2', title: 'Thermo quick quiz', count: 15, score: 74, updatedAt: 'Yesterday' },
  ]);

  const heroStats = useMemo(
    () => [
      { label: 'Assets created', value: assets.length, sub: 'Latest uploads', icon: Layers },
      { label: 'Decks ready', value: decks.length, sub: 'Flashcards + quizzes', icon: BookOpenCheck },
      { label: 'Avg accuracy', value: '81%', sub: 'Last 7 days', icon: Target },
    ],
    [assets.length, decks.length]
  );

  const handleCreateAsset = (event) => {
    event.preventDefault();
    if (!assetTitle.trim() || !assetContent.trim()) return;
    setAssets((prev) => [
      {
        id: crypto.randomUUID(),
        title: assetTitle.trim(),
        type: assetType,
        updatedAt: 'Just now',
      },
      ...prev,
    ]);
    setAssetTitle('');
    setAssetContent('');
  };

  const handleGenerateDeck = () => {
    const baseTitle = assetTitle.trim() || 'New practice deck';
    setDecks((prev) => [
      {
        id: crypto.randomUUID(),
        title: baseTitle,
        count: 10 + Math.floor(Math.random() * 10),
        score: 0,
        updatedAt: 'Just now',
      },
      ...prev,
    ]);
  };

  return (
    <div className="space-y-8 text-slate-900">
      <section className="rounded-[36px] border border-amber-100 bg-gradient-to-br from-[#fff5e6] via-white to-[#ffe4c6] px-6 py-7 shadow-[0_35px_90px_rgba(255,193,111,0.35)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-amber-600">Study tools</p>
            <div>
              <h1 className="text-3xl font-semibold leading-tight">Turn every PDF into flashcards and quizzes.</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-600">
                Upload notes, create transcripts, and spin up AI decks that stay in the warm workspace. Practice sessions sync back to the dashboard instantly.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1 text-xs font-semibold text-amber-700">
              <Sparkles className="h-4 w-4" /> Tip: keep assets short for crisp flashcards.
            </div>
          </div>
          <div className="rounded-3xl border border-amber-100 bg-white/90 px-5 py-4 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Active streak</p>
            <p className="mt-2 text-base font-semibold text-slate-900">4 days</p>
            <p className="text-xs text-slate-500">Keep revising daily to unlock mentor badges.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {heroStats.map(({ label, value, sub, icon: Icon }) => (
            <div key={label} className="rounded-2xl border border-white/80 bg-white/85 px-4 py-4 shadow-sm">
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

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleCreateAsset} className="rounded-[32px] border border-amber-100 bg-white px-6 py-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Create asset</p>
              <h2 className="text-xl font-semibold">Notes & transcripts</h2>
            </div>
            <Layers className="h-5 w-5 text-amber-500" />
          </div>
          <label className="text-xs font-semibold text-slate-500">
            Title
            <input
              className="mt-1 w-full rounded-2xl border border-amber-100 px-4 py-2 text-sm focus:border-amber-300 focus:outline-none"
              value={assetTitle}
              onChange={(e) => setAssetTitle(e.target.value)}
              placeholder="Eg. Unit 3 pulse checklist"
            />
          </label>
          <label className="text-xs font-semibold text-slate-500">
            Type
            <select
              className="mt-1 w-full rounded-2xl border border-amber-100 px-4 py-2 text-sm focus:border-amber-300 focus:outline-none"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value)}
            >
              <option value="notes">Notes</option>
              <option value="transcript">Transcript</option>
              <option value="summary">Summary</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-500">
            Content
            <textarea
              className="mt-1 min-h-[150px] w-full rounded-3xl border border-amber-100 px-4 py-3 text-sm text-slate-900 placeholder:text-amber-400 focus:border-amber-300 focus:outline-none"
              value={assetContent}
              onChange={(e) => setAssetContent(e.target.value)}
              placeholder="Paste highlights, transcript text, or bullet notes"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-200/70"
            >
              <Sparkles className="h-4 w-4" /> Save asset
            </button>
            <button
              type="button"
              onClick={handleGenerateDeck}
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-600"
            >
              <ArrowRight className="h-4 w-4" /> Generate deck
            </button>
          </div>
          <p className="text-xs text-slate-500">Assets stay private. Decks auto-sync with Exam Lab when you convert them into quizzes.</p>
        </form>

        <div className="rounded-[32px] border border-amber-100 bg-white px-6 py-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Recent assets</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {assets.map((asset) => (
              <li key={asset.id} className="rounded-2xl border border-amber-50 bg-amber-50/60 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{asset.title}</p>
                  <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-amber-600">{asset.type}</span>
                </div>
                <p className="text-xs text-slate-500">Updated {asset.updatedAt}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-[32px] border border-amber-100 bg-white px-6 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Decks & quizzes</p>
            <h2 className="text-xl font-semibold">Practice streak</h2>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {decks.map((deck) => (
            <div key={deck.id} className="rounded-3xl border border-amber-50 bg-gradient-to-br from-white via-[#fff8ef] to-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">{deck.title}</p>
              <p className="text-xs text-slate-500">{deck.count} cards · Updated {deck.updatedAt}</p>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-3xl font-semibold text-slate-900">{deck.score}%</p>
                  <p className="text-xs text-slate-500">Last attempt</p>
                </div>
                <button className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Practice</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
