import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { saveAuth, getStoredUser } from '../services/authStorage.js';
import MainNavbar from '../components/MainNavbar.jsx';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const heroStats = [
  { label: 'Tickets resolved', value: '128', meta: 'this month' },
  { label: 'Avg. first reply', value: '11m', meta: 'mentor pods live' },
  { label: 'AI drafts used', value: '84%', meta: 'keep tone consistent' },
];

const ritualSteps = [
  'Sign in → dashboard syncs with your last queue.',
  'Mentor runway shows macros + AI guidance for each ticket.',
  'Students see status changes instantly when you reply.',
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const user = getStoredUser();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, {
        email,
        password,
      });
      saveAuth(res.data.token, res.data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#fff8f0] via-[#fff2e1] to-[#fde6c5]">
      <MainNavbar user={user} />

      {/* Main */}
      <main className="flex-1 px-4 py-12">
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute inset-0 -z-10 rounded-[40px] bg-gradient-to-br from-[#fff5e4] via-[#fdf0d8] to-[#ffe6c4] blur-3xl opacity-80" />
          <div className="grid gap-8 md:grid-cols-[1.2fr,1fr] items-start bg-white/85 border border-amber-100 rounded-[32px] shadow-[0_35px_120px_rgba(0,0,0,0.15)] p-8 md:p-10 backdrop-blur">
            <div className="space-y-6">
              <p className="text-[11px] tracking-[0.3em] uppercase text-amber-600 font-semibold">ClearPath access</p>
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-semibold leading-tight text-[#2f1a0f]">
                  Welcome back to the Clean Path complaint hub
                </h1>
                <p className="text-sm md:text-base text-[#6b3f1f] max-w-xl">
                  Sign in to keep the conversation flowing, triage new submissions, and keep every SLA green with AI nudges.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-[#ffe6cc] bg-white px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-[#c17236]">{stat.label}</p>
                    <p className="mt-1 text-2xl font-semibold text-[#2f1a0f]">{stat.value}</p>
                    <p className="text-xs text-[#6b3f1f]">{stat.meta}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-3xl border border-[#ffe0bd] bg-[#fff9f2] p-5 space-y-3">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#b55c16]">
                  <ShieldCheck className="h-4 w-4" /> Clean Path ritual
                </div>
                <ul className="space-y-2 text-sm text-[#6b3f1f]">
                  {ritualSteps.map((step) => (
                    <li key={step} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="w-full bg-white rounded-3xl border border-amber-100 shadow-[0_25px_60px_rgba(0,0,0,0.12)] p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in</h2>
                <p className="mt-1 text-sm text-slate-500">Use your ClearPath credentials to continue.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-slate-700">Email</label>
                  <div className="flex items-center rounded-lg border border-amber-200 bg-[#f5f7ff] px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-amber-400">
                    <Mail className="h-4 w-4 text-slate-400 mr-2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-[#f5f7ff] outline-none text-slate-900 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-700">Password</label>
                  <div className="flex items-center rounded-lg border border-amber-200 bg-[#f5f7ff] px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-amber-400">
                    <Lock className="h-4 w-4 text-slate-400 mr-2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 bg-[#f5f7ff] outline-none text-slate-900 placeholder:text-slate-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="ml-2 text-slate-500 hover:text-slate-700"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && (
                  <p className="mt-2 rounded-md bg-rose-50 px-3 py-1.5 text-[13px] text-rose-600 text-center md:text-left">
                    {error}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(event) => setRememberDevice(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                    />
                    Remember this device
                  </label>
                  <Link to="/support" className="font-semibold text-amber-600 hover:text-amber-500">
                    Forgot details?
                  </Link>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex justify-center items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60 shadow-md"
                >
                  <LogIn className="h-4 w-4" />
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
              <div className="rounded-2xl border border-[#f4c28a] bg-[#fffaf3] px-4 py-3 text-xs text-[#6b3f1f]">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-[#b55c16]">
                  Register as student ↗
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 rounded-[28px] border border-[#ffe0bd] bg-white/90 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#c17236]">Need to switch devices?</p>
              <p className="text-sm text-[#6b3f1f]">Securely log out everywhere from the staff dashboard once you’re inside.</p>
            </div>
            <Link to="/support" className="inline-flex items-center gap-2 rounded-full border border-[#f4c28a] bg-white px-5 py-2 text-sm font-semibold text-[#b55c16]">
              Visit support
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-amber-200/80 bg-gradient-to-t from-[#fbe3c7] via-[#fdf2df] to-[#fdf6eb]">
        <div className="max-w-5xl mx-auto px-4 py-8 text-[11px] text-slate-600">
          <div className="grid gap-6 md:grid-cols-4 mb-6">
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-amber-700">Clean Path Portal</h3>
              <p className="text-[11px] text-slate-600">Warm dashboards for students, mentors, and admins to keep complaints transparent.</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-amber-700">Dashboards</h3>
              <ul className="space-y-1">
                <li><a href="/#home" className="hover:text-amber-700 transition-colors">Main landing</a></li>
                <li><a href="/#system" className="hover:text-amber-700 transition-colors">AI system view</a></li>
                <li><Link to="/support" className="hover:text-amber-700 transition-colors">Support HQ</Link></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-amber-700">Company</h3>
              <p className="text-slate-500">Internal Clear Path showcase</p>
              <p className="text-slate-500">Mongo · Node · React · Tailwind</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-amber-700">Contact</h3>
              <ul className="space-y-1">
                <li>support@cleanpath.com</li>
                <li>+91 00000 00000</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border-t border-amber-200/60 pt-3">
            <span className="text-slate-500">© {new Date().getFullYear()} Clean Path Complaints Portal. All rights reserved.</span>
            <span className="text-slate-500">Built for Clear Path challenge.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

