import React from 'react';
import { AlertCircle, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clearAuth } from '../services/authStorage.js';

export default function BannedPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-lg">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-rose-100 p-4">
            <AlertCircle className="h-8 w-8 text-rose-600" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-slate-900">Account Suspended</h1>
        <p className="mb-6 text-sm text-slate-600">
          Your account has been suspended and you cannot access the platform at this time.
        </p>

        <div className="mb-6 rounded-lg border border-rose-100 bg-rose-50 p-4 text-left">
          <p className="text-xs font-semibold text-rose-700">Reason:</p>
          <p className="mt-1 text-sm text-rose-600">
            Your account was suspended due to a violation of our terms of service. If you believe this is a mistake, please contact support.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-rose-600 px-4 py-2 font-semibold text-white hover:bg-rose-700 transition"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>

        <p className="mt-4 text-xs text-slate-500">
          Need help? Contact{' '}
          <a href="mailto:support@clearpath.com" className="text-rose-600 hover:underline">
            support@clearpath.com
          </a>
        </p>
      </div>
    </div>
  );
}
