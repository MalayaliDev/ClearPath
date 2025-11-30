import React, { useState } from 'react';
import { Settings2, Bot, Inbox, BookMarked } from 'lucide-react';

const defaultConfig = {
  autopilot: true,
  requireFiles: false,
  maxOpen: 5,
  autoCloseHours: 72,
  routing: 'mentor',
};

const automations = [
  { id: 'kb', title: 'Knowledge base reply', detail: 'Suggest top 2 docs when autopilot triage triggers.' },
  { id: 'mentor', title: 'Mentor ping', detail: 'Auto-tag assigned mentor when sentiment is negative.' },
  { id: 'ops', title: 'Ops escalation', detail: 'Escalate to ops if student is on watchlist.' },
];

export default function StaffTicketConfigPage() {
  const [config, setConfig] = useState(defaultConfig);
  const [automationsState, setAutomationsState] = useState({ kb: true, mentor: true, ops: false });

  const handleConfigChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAutomation = (id) => {
    setAutomationsState((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-amber-100 bg-white/90 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-amber-500">Ticket config</p>
            <h2 className="text-xl font-semibold text-slate-900">Portal guardrails</h2>
            <p className="text-sm text-slate-500">Keep service levels predictable by codifying your best practices.</p>
          </div>
          <Settings2 className="h-5 w-5 text-amber-500" />
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-sm space-y-3">
          <label className="flex items-center justify-between rounded-2xl border border-amber-50 bg-amber-50/60 px-3 py-2 text-sm font-medium text-slate-700">
            <span>Autopilot triage</span>
            <input
              type="checkbox"
              checked={config.autopilot}
              onChange={(e) => handleConfigChange('autopilot', e.target.checked)}
              className="h-4 w-4 text-amber-500"
            />
          </label>
          <label className="flex items-center justify-between rounded-2xl border border-slate-100 px-3 py-2 text-sm text-slate-700">
            <span>Require supporting files on new tickets</span>
            <input
              type="checkbox"
              checked={config.requireFiles}
              onChange={(e) => handleConfigChange('requireFiles', e.target.checked)}
              className="h-4 w-4 text-amber-500"
            />
          </label>
          <div>
            <p className="text-xs text-slate-500 mb-1">Max open tickets per student</p>
            <input
              type="number"
              min="1"
              max="10"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={config.maxOpen}
              onChange={(e) => handleConfigChange('maxOpen', Number(e.target.value))}
            />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Auto-close tickets after (hours)</p>
            <input
              type="number"
              min="24"
              max="168"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={config.autoCloseHours}
              onChange={(e) => handleConfigChange('autoCloseHours', Number(e.target.value))}
            />
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Routing preference</p>
            <select
              value={config.routing}
              onChange={(e) => handleConfigChange('routing', e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="mentor">Assign mentor first</option>
              <option value="ops">Send to ops first</option>
              <option value="round-robin">Round robin</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Bot className="h-4 w-4 text-amber-500" /> Autopilot automations
            </div>
            <p className="mt-1 text-xs text-slate-500">Toggle which helpers are active when autopilot is on.</p>
            <div className="mt-3 space-y-3 text-sm">
              {automations.map((automation) => (
                <label
                  key={automation.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 px-3 py-2 hover:border-amber-200"
                >
                  <span className="flex-1 pr-4 text-slate-600">
                    <span className="font-semibold text-slate-900">{automation.title}</span>
                    <br />
                    {automation.detail}
                  </span>
                  <input
                    type="checkbox"
                    checked={automationsState[automation.id]}
                    onChange={() => toggleAutomation(automation.id)}
                    className="h-4 w-4 text-amber-500"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white/95 p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Inbox className="h-4 w-4 text-amber-500" /> Ticket templates
            </div>
            <p className="mt-1 text-xs text-slate-500">Speed up support replies with saved macros.</p>
            <div className="mt-3 space-y-2 text-sm">
              {['Require more evidence', 'Soft reminder', 'Escalated to mentor'].map((template) => (
                <button
                  key={template}
                  type="button"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-left hover:border-amber-300"
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white/95 p-4 text-xs text-slate-500">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              <BookMarked className="h-4 w-4 text-amber-500" /> Playbook note
            </div>
            <p className="mt-1">
              Ticket config saves instantly. Changes propagate to mentors and autopilot without deploys.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
