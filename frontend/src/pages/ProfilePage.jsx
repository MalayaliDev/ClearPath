import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Edit3, Mail, Phone, ShieldCheck, User } from 'lucide-react';
import { getStoredUser, updateStoredUser } from '../services/authStorage.js';

const cardBase = 'rounded-[32px] border border-amber-100 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]';

export default function ProfilePage() {
  const storedUser = getStoredUser();
  const [profile, setProfile] = useState({
    name: storedUser?.name || 'Malayali Dev',
    email: storedUser?.email || 'user@clearpath.app',
    phone: storedUser?.phone || '+91 00000 00000',
    cohort: storedUser?.cohort || 'Fall 2025',
  });
  const [avatarPreview, setAvatarPreview] = useState(storedUser?.avatarUrl || '');
  const [bannerPreview, setBannerPreview] = useState(storedUser?.bannerUrl || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const contactBadges = useMemo(
    () => [
      { label: 'Tickets logged', value: 26 },
      { label: 'Avg. response', value: '28m' },
      { label: 'Mentor syncs', value: 12 },
    ],
    []
  );

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Wire to backend profile update endpoint once available
    const persisted = updateStoredUser({
      ...profile,
      avatarUrl: avatarPreview,
      bannerUrl: bannerPreview,
    });
    console.info('Profile update requested:', {
      profile: persisted,
      avatarFile,
      bannerFile,
    });
  };

  const handleMediaChange = (event, type) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (!reader.result || typeof reader.result !== 'string') return;
      if (type === 'avatar') {
        setAvatarFile(file);
        setAvatarPreview(reader.result);
      } else {
        setBannerFile(file);
        setBannerPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 text-slate-900">
      <section className={`${cardBase} px-6 py-6`}>
        {bannerPreview && (
          <div className="mb-5 overflow-hidden rounded-[28px] border border-amber-50">
            <img src={bannerPreview} alt="Workspace banner" className="h-36 w-full object-cover" />
          </div>
        )}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[24px] bg-gradient-to-br from-amber-100 to-amber-300 text-3xl font-semibold text-amber-900">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Profile avatar" className="h-full w-full object-cover" />
              ) : (
                profile.name.charAt(0)
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">Welcome back</p>
              <h1 className="text-3xl font-semibold text-slate-900">{profile.name}</h1>
              <p className="text-sm text-slate-500">Keep your information fresh so mentors stay in sync.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {contactBadges.map((badge) => (
              <div key={badge.label} className="rounded-2xl border border-amber-50 bg-[#fffdf8] px-4 py-3 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-500">{badge.label}</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">{badge.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className={`${cardBase} px-6 py-6 self-start`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Profile details</p>
              <h2 className="mt-2 text-2xl font-semibold">Credentials & contact</h2>
              <p className="text-sm text-slate-500">These fields feed your ticket signatures and mentor cards.</p>
            </div>
            <Edit3 className="h-5 w-5 text-amber-500" />
          </div>
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Full name
                <input
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Email
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Phone
                <input
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Cohort / track
                <input
                  name="cohort"
                  value={profile.cohort}
                  onChange={handleInputChange}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Profile avatar
                <div className="mt-2 flex flex-col items-center justify-center rounded-3xl border border-dashed border-amber-200 bg-amber-50/40 px-4 py-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-400 text-lg font-semibold text-amber-900">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar preview" className="h-full w-full rounded-2xl object-cover" />
                    ) : (
                      <span>{profile.name.charAt(0)}</span>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-slate-500">Upload square image · PNG/JPG</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleMediaChange(event, 'avatar')}
                    className="mt-2 w-full text-xs text-slate-500"
                  />
                </div>
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Workspace banner
                <div className="mt-2 rounded-3xl border border-dashed border-amber-200 bg-amber-50/40 p-3">
                  <div className="h-32 rounded-2xl bg-white/70">
                    {bannerPreview ? (
                      <img src={bannerPreview} alt="Banner preview" className="h-full w-full rounded-2xl object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-500">
                        1600 × 400 cover recommended
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleMediaChange(event, 'banner')}
                    className="mt-2 w-full text-xs text-slate-500"
                  />
                </div>
              </label>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-200/70 transition hover:-translate-y-0.5"
            >
              Save changes
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className={`${cardBase} px-6 py-6`}>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-500">Activity & actions</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <Link
                to="/app/my-tickets"
                className="flex items-center justify-between rounded-2xl border border-amber-50 bg-amber-50/60 px-4 py-3 font-semibold text-slate-900 transition hover:border-amber-200 hover:bg-white"
              >
                <span>Open ticket history</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/support"
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 font-semibold text-slate-900 transition hover:border-amber-200 hover:bg-white"
              >
                <span>Create support ticket</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Mentor streamline</p>
                <p className="mt-2 text-sm text-slate-700">
                  Keep descriptions short and structured. Latest update synced 4 minutes ago.
                </p>
              </div>
            </div>
          </div>

          <div className={`${cardBase} px-6 py-6`}>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">Security</p>
                <h3 className="text-xl font-semibold text-slate-900">Devices & access</h3>
              </div>
            </div>
            <div className="mt-5 space-y-4 text-sm text-slate-600">
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="font-semibold text-slate-900">Two factor</p>
                    <p className="text-xs text-slate-500">Coming soon — synced with mentor identity</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-emerald-600">Planned</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="font-semibold text-slate-900">Notification email</p>
                    <p className="text-xs text-slate-500">{profile.email}</p>
                  </div>
                </div>
                <button className="text-xs font-semibold text-amber-600">Update</button>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-slate-500" />
                  <div>
                    <p className="font-semibold text-slate-900">SMS handoff</p>
                    <p className="text-xs text-slate-500">{profile.phone}</p>
                  </div>
                </div>
                <button className="text-xs font-semibold text-amber-600">Verify</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
