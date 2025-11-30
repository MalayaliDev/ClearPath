import React from 'react';
import { LifeBuoy } from 'lucide-react';
import useLandingTicketForm from '../hooks/useLandingTicketForm.js';

export default function TicketFormCard({ user, onOpenTicket }) {
  const {
    ticketForm,
    ticketError,
    ticketSuccess,
    creatingTicket,
    ticketDisabled,
    configError,
    updateTicketField,
    submitTicket,
    resetTicketSuccess,
  } = useLandingTicketForm(user);

  if (configError) {
    return (
      <div className="rounded-[36px] bg-white shadow-2xl border border-rose-100 p-6 md:p-8 space-y-4 text-center text-rose-700">
        Ticket service is temporarily unavailable. Please contact support directly.
      </div>
    );
  }

  return (
    <div className="rounded-[36px] bg-white shadow-2xl border border-amber-100 p-6 md:p-8 space-y-5">
      {!ticketSuccess && (
        <>
          <div className="space-y-1">
            <LifeBuoy className="h-8 w-8 text-amber-500" />
            <h2 className="text-2xl font-semibold">Tell us what’s up</h2>
            <p className="text-sm text-slate-500">
              Signed in as {user?.name || 'guest'}. We’ll keep the conversation inside your dashboard.
            </p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submitTicket();
            }}
            className="space-y-4"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Name</label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Subject *</label>
              <input
                type="text"
                value={ticketForm.subject}
                onChange={(event) => updateTicketField('subject', event.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-amber-400 focus:outline-none"
                placeholder="Issue regarding..."
                disabled={ticketDisabled}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Message *</label>
              <textarea
                value={ticketForm.message}
                onChange={(event) => updateTicketField('message', event.target.value)}
                className="mt-1 h-36 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-amber-400 focus:outline-none"
                placeholder="Give us as much context as possible"
                disabled={ticketDisabled}
              />
            </div>
            {ticketError && <p className="text-sm text-rose-600">{ticketError}</p>}
            <button
              type="submit"
              disabled={ticketDisabled}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-200/70 disabled:opacity-50"
            >
              {creatingTicket ? 'Creating ticket…' : 'Create ticket'}
            </button>
          </form>
        </>
      )}

      {ticketSuccess && (
        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-semibold">Ticket created</h2>
          <p className="text-sm text-slate-600">Thanks! We’ll reach out via the portal and email shortly.</p>
          <div className="rounded-3xl border border-amber-100 bg-[#fff9f2] p-4 text-left space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Summary</p>
            <p className="text-sm text-slate-600">Ticket ID</p>
            <p className="text-lg font-semibold text-slate-900">{ticketSuccess._id || ticketSuccess.id}</p>
            <p className="text-sm text-slate-600">Subject</p>
            <p className="text-lg font-semibold text-slate-900">{ticketSuccess.title}</p>
            <p className="text-sm text-slate-600">Status: {ticketSuccess.status || 'Pending'}</p>
          </div>
          <div className="flex flex-col gap-3 md:flex-row">
            <button
              type="button"
              onClick={onOpenTicket}
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm"
            >
              Open your ticket
            </button>
            <button
              type="button"
              onClick={resetTicketSuccess}
              className="flex-1 rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-200/70"
            >
              Create another ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
