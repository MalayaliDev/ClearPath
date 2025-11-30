import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import MainNavbar from '../components/MainNavbar.jsx';
import { getStoredUser } from '../services/authStorage.js';

const registerPerks = [
  'Live status timeline and ticket history.',
  'AI suggestions to phrase your issue clearly.',
  'Secure channel with mentors + staff.',
];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
      });
      setSuccess('Registration successful. You can now log in.');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#fff8f0] via-[#fff2e1] to-[#fde6c5]">
      <MainNavbar user={user} />

      <main className="flex-1 px-4 py-12">
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute inset-0 -z-10 rounded-[40px] bg-gradient-to-br from-[#fff5e4] via-[#fdf0d8] to-[#ffe6c4] blur-3xl opacity-80" />
          <div className="grid gap-8 md:grid-cols-[1.1fr,1fr] items-start bg-white/85 border border-amber-100 rounded-[32px] shadow-[0_35px_120px_rgba(0,0,0,0.15)] p-8 md:p-10 backdrop-blur">
            <div className="space-y-5">
              <p className="text-[11px] tracking-[0.3em] uppercase text-amber-600 font-semibold">Join Clean Path</p>
              <h1 className="text-3xl md:text-4xl font-semibold leading-tight text-slate-900">Create your student account</h1>
              <p className="text-sm md:text-base text-slate-600 max-w-xl">
                Report issues, follow responses, and keep every complaint organised in one warm portal. Registration is for students—staff receive invites from ops.
              </p>
              <div className="rounded-3xl bg-white/95 border border-amber-100 shadow-sm p-5 space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-600">Why register?</p>
                <ul className="text-sm text-slate-600 space-y-2">
                  {registerPerks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="w-full bg-white rounded-3xl border border-amber-100 shadow-[0_25px_60px_rgba(0,0,0,0.12)] p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Student registration</h2>
                <p className="mt-1 text-sm text-slate-500">Fill in your details to start using ClearPath.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-slate-700">Full name</label>
                  <div className="flex items-center rounded-lg border border-amber-200 bg-[#fefbf6] px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-amber-400">
                    <User className="h-4 w-4 text-slate-400 mr-2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-700">Email</label>
                  <div className="flex items-center rounded-lg border border-amber-200 bg-[#fefbf6] px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-amber-400">
                    <Mail className="h-4 w-4 text-slate-400 mr-2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-700">Password</label>
                  <div className="flex items-center rounded-lg border border-amber-200 bg-[#fefbf6] px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-amber-400">
                    <Lock className="h-4 w-4 text-slate-400 mr-2" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-rose-500">{error}</p>}
                {success && <p className="text-sm text-emerald-600">{success}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex justify-center items-center rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60 shadow-md"
                >
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </form>
              <div className="rounded-2xl border border-[#f4c28a] bg-[#fffaf3] px-4 py-3 text-xs text-[#6b3f1f] text-center">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-[#b55c16]">
                  Sign in ↗
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 rounded-[28px] border border-[#ffe0bd] bg-white/90 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#c17236]">Need help registering?</p>
              <p className="text-sm text-[#6b3f1f]">Support can walk you through the form or send a mentor invite.</p>
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
