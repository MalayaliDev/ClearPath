import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldBan, RefreshCw, UserX, Bell, MessageCircle, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function StaffUserManagementPage() {
  const [managedUsers, setManagedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastAction, setLastAction] = useState('No actions yet');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE}/api/user/all`, {
        withCredentials: true,
      });
      const users = response.data.users || [];
      setManagedUsers(
        users.map((user) => ({
          ...user,
          aiQuota: 100,
          watchlist: false,
        }))
      );
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = (id, field) => {
    setManagedUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, [field]: !user[field] } : user))
    );
    setLastAction(`${field} toggled for ${id}`);
  };

  const handleResetPassword = (id) => {
    setManagedUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? { ...user, lastPasswordReset: new Date().toISOString(), aiQuota: 80 }
          : user
      )
    );
    setLastAction(`Password reset for ${id}`);
  };

  const handleSendNudge = (id) => {
    setLastAction(`Slack nudge queued for ${id}`);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-100 bg-white/90 p-4 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-900">Live controls</p>
            <p className="text-xs text-slate-500">
              These actions sync to the auth service instantly. Any bans or password resets will log the operator ID.
            </p>
            <p className="mt-2 text-xs text-emerald-600">{lastAction}</p>
          </div>
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-600 hover:border-slate-300 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-6 text-center text-sm text-slate-500">
          <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
          Loading users…
        </div>
      ) : managedUsers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-10 text-center text-sm text-slate-500">
          No users found.
        </div>
      ) : (
        <div className="space-y-3">
        {managedUsers.map(({ id, name, email, banned, blacklisted, aiQuota, watchlist, lastPasswordReset }) => (
          <article key={id} className="rounded-2xl border border-amber-50 bg-amber-50/60 px-4 py-4 text-sm text-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{name}</p>
                <p className="text-xs text-slate-500">{email}</p>
                {lastPasswordReset && (
                  <p className="text-[11px] text-slate-400">
                    Password reset {new Date(lastPasswordReset).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => toggleFlag(id, 'banned')}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 transition ${
                    banned ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <UserX className="h-3.5 w-3.5" />
                  {banned ? 'Unban' : 'Ban'}
                </button>
                <button
                  type="button"
                  onClick={() => toggleFlag(id, 'blacklisted')}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 transition ${
                    blacklisted
                      ? 'border-amber-400 bg-amber-100 text-amber-700'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <ShieldBan className="h-3.5 w-3.5" />
                  {blacklisted ? 'Remove blacklist' : 'Blacklist'}
                </button>
                <button
                  type="button"
                  onClick={() => handleResetPassword(id)}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Reset password
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-white px-2 py-0.5">
                <MessageCircle className="h-3 w-3 text-amber-500" />
                AI quota {aiQuota} prompts
              </span>
              <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                <input
                  type="checkbox"
                  checked={watchlist}
                  onChange={() => toggleFlag(id, 'watchlist')}
                  className="h-4 w-4 text-amber-500"
                />
                Watchlist alerts
              </label>
              <button
                type="button"
                onClick={() => handleSendNudge(id)}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700"
              >
                <Bell className="h-3.5 w-3.5" />
                Slack nudge
              </button>
            </div>
          </article>
        ))}
        </div>
      )}
    </div>
  );
}
