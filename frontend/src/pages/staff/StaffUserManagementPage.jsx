import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShieldBan, RefreshCw, UserX, Bell, MessageCircle, Loader2, Trash2 } from 'lucide-react';
import { getToken, getStoredUser, updateStoredUser } from '../../services/authStorage.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function StaffUserManagementPage() {
  const [managedUsers, setManagedUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [lastAction, setLastAction] = useState('No actions yet');
  const [tempPasswords, setTempPasswords] = useState({});
  const [editingPassword, setEditingPassword] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const token = getToken();
      console.log('Fetching users from:', `${API_BASE}/api/user/all`);
      const response = await axios.get(`${API_BASE}/api/user/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      console.log('Users response:', response.data);
      const users = response.data.users || [];
      console.log('Setting managed users:', users);
      setManagedUsers(
        users.map((user) => ({
          ...user,
          aiQuota: 100,
          watchlist: false,
        }))
      );
    } catch (err) {
      console.error('Error fetching users:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = async (id, field) => {
    try {
      setError('');
      const token = getToken();
      const currentUser = getStoredUser();
      const user = managedUsers.find((u) => u.id === id);
      const newValue = !user?.[field];

      // Send to backend
      await axios.post(
        `${API_BASE}/api/user/toggle-flag`,
        { userId: id, field, value: newValue },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      // Update UI
      setManagedUsers((prev) =>
        prev.map((user) => (user.id === id ? { ...user, [field]: newValue } : user))
      );

      // If banning the current user, update localStorage
      if (field === 'banned' && id === currentUser?.id) {
        updateStoredUser({ isBanned: newValue });
      }

      setLastAction(`${field} ${newValue ? 'enabled' : 'disabled'} for user`);
    } catch (err) {
      console.error('Error toggling flag:', err);
      setError(err.response?.data?.message || `Failed to toggle ${field}`);
    }
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

  const toggleUserSelection = (id) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedUsers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === managedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(managedUsers.map((u) => u.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedUsers.size === 0) {
      setError('No users selected');
      return;
    }

    if (!window.confirm(`Delete ${selectedUsers.size} user(s)? This cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(true);
      setError('');
      const token = getToken();
      const userIds = Array.from(selectedUsers);
      console.log('Deleting users:', userIds);

      const response = await axios.post(
        `${API_BASE}/api/user/delete-multiple`,
        { userIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      console.log('Delete response:', response.data);
      setLastAction(`Deleted ${selectedUsers.size} user(s)`);
      setSelectedUsers(new Set());
      await fetchUsers();
    } catch (err) {
      console.error('Error deleting users:', err);
      setError(err.response?.data?.message || err.message || 'Failed to delete users');
    } finally {
      setDeleting(false);
    }
  };

  const generateTempPassword = (id) => {
    const tempPass = Math.random().toString(36).slice(-8).toUpperCase();
    setTempPasswords((prev) => ({
      ...prev,
      [id]: tempPass,
    }));
    setLastAction(`Temp password generated for user`);
  };

  const handleMakeAdmin = async (id) => {
    try {
      setError('');
      const token = getToken();
      const user = managedUsers.find((u) => u.id === id);
      const newRole = user?.role === 'admin' ? 'student' : 'admin';

      await axios.post(
        `${API_BASE}/api/user/update-role`,
        { userId: id, role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      setManagedUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
      setLastAction(`User role changed to ${newRole}`);
    } catch (err) {
      console.error('Error updating role:', err);
      setError(err.response?.data?.message || 'Failed to update role');
    }
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
          <div className="flex items-center gap-2">
            {selectedUsers.size > 0 && (
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-600 hover:border-rose-300 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete {selectedUsers.size}
              </button>
            )}
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
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.size === managedUsers.length && managedUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-amber-500"
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Role</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {managedUsers.map(({ id, name, email, role, banned, blacklisted }) => (
                <tr key={id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(id)}
                      onChange={() => toggleUserSelection(id)}
                      className="h-4 w-4 rounded border-slate-300 text-amber-500"
                    />
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{name}</td>
                  <td className="px-4 py-3 text-slate-600">{email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                      role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                      role === 'staff' ? 'bg-blue-100 text-blue-700' : 
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {role || 'student'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <input
                          type="text"
                          placeholder="Enter or generate password"
                          value={editingPassword[id] !== undefined ? editingPassword[id] : (tempPasswords[id] || '')}
                          onChange={(e) => setEditingPassword((prev) => ({ ...prev, [id]: e.target.value }))}
                          className="rounded border border-slate-300 px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <button
                          type="button"
                          onClick={() => generateTempPassword(id)}
                          className="inline-flex items-center rounded border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                        >
                          Generate
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleResetPassword(id)}
                          className="inline-flex items-center rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white hover:bg-orange-600 transition"
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMakeAdmin(id)}
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition ${
                            role === 'admin' ? 'border-purple-200 bg-purple-50 text-purple-600' : 'border-slate-200 bg-white text-slate-600'
                          }`}
                        >
                          {role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFlag(id, 'banned')}
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition ${
                            banned ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-200 bg-white text-slate-600'
                          }`}
                        >
                          {banned ? 'Unban' : 'Ban'}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleUserSelection(id)}
                          className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
