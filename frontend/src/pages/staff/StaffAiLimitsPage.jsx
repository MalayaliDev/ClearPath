import React, { useState } from 'react';
import { Gauge, Zap, ShieldCheck } from 'lucide-react';

const seedLimits = {
  dailyMentor: 150,
  pdfAnalysis: 80,
  examDrafts: 40,
};

const guardrails = [
  {
    id: 'cooldown',
    label: 'Cooldown if user sends > 5 prompts in 60 seconds',
  },
  {
    id: 'longform',
    label: 'Require staff approval for answers > 400 words',
  },
  {
    id: 'sensitive',
    label: 'Escalate "refund" or "legal" keywords to staff inbox',
  },
];

export default function StaffAiLimitsPage() {
  const [limits, setLimits] = useState(seedLimits);
  const [toggles, setToggles] = useState({ cooldown: true, longform: false, sensitive: true });

  const handleLimitChange = (field, value) => {
    setLimits((prev) => ({ ...prev, [field]: Number(value) }));
  };

  const handleToggle = (id) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-amber-100 bg-white/90 p-4 shadow-sm animate-fadeInUp">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-500">AI limiting</p>
            <h2 className="text-xl font-semibold text-slate-900">Mentor guardrails & quotas</h2>
            <p className="text-sm text-slate-500">Balance delightful answers with resource planning.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
            <Gauge className="h-3.5 w-3.5 text-amber-500" />
            {limits.dailyMentor + limits.pdfAnalysis + limits.examDrafts} prompts/day budget
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-sm animate-fadeInUp" style={{ animationDelay: '0.08s' }}>
          <h3 className="text-sm font-semibold text-slate-900">Quota sliders</h3>
          <p className="text-xs text-slate-500">Daily cap resets at midnight IST. Metrics sync to Prometheus.</p>
          <div className="mt-4 space-y-4">
            {[
              { label: 'Mentor AI', field: 'dailyMentor', max: 250 },
              { label: 'Pdf analysis', field: 'pdfAnalysis', max: 150 },
              { label: 'Exam drafts', field: 'examDrafts', max: 100 },
            ].map(({ label, field, max }) => (
              <div key={field}>
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500">{limits[field]} prompts</p>
                </div>
                <input
                  type="range"
                  min="10"
                  max={max}
                  value={limits[field]}
                  onChange={(e) => handleLimitChange(field, e.target.value)}
                  className="mt-2 w-full accent-amber-500"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-sm animate-fadeInUp" style={{ animationDelay: '0.16s' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Guardrails</h3>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-4 space-y-3 text-sm">
            {guardrails.map((rule) => (
              <label
                key={rule.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 px-3 py-2 hover:border-amber-200"
              >
                <span className="flex-1 pr-4 text-slate-600">{rule.label}</span>
                <input
                  type="checkbox"
                  checked={toggles[rule.id]}
                  onChange={() => handleToggle(rule.id)}
                  className="h-4 w-4 text-amber-500"
                />
              </label>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-700">
            <p className="font-semibold text-emerald-800">Pro tip</p>
            <p>Use cooldowns before bans so students get nudged with self-serve tips.</p>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-sm animate-fadeInUp" style={{ animationDelay: '0.24s' }}>
        <div className="flex items-center gap-3">
          <Zap className="h-4 w-4 text-amber-500" />
          <p className="text-sm font-semibold text-slate-900">Experiments & overrides</p>
        </div>
        <p className="mt-1 text-xs text-slate-500">Roll out new models to 10% of users before global enable.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
            <p className="text-slate-500">Mentor AI model</p>
            <p className="text-slate-900">claude-3.5-sonnet</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
            <p className="text-slate-500">Experiment</p>
            <p className="text-slate-900">Enabled (10%)</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-white px-3 py-2">
            <p className="text-slate-500">Last override</p>
            <p className="text-slate-900">2h ago · Safa</p>
          </div>
        </div>
      </section>
    </div>
  );
}
