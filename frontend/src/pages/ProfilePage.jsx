import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit3, Mail, Phone, MapPin } from 'lucide-react';
import { getStoredUser } from '../services/authStorage.js';

const cardBase = 'rounded-[28px] border border-amber-100 bg-white shadow-[0_20px_60px_rgba(255,193,111,0.25)]';

export default function ProfilePage() {
  const storedUser = getStoredUser();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 text-slate-900">
      {/* Profile Header with Banner */}
      <section className={`${cardBase} overflow-hidden px-0 py-0 animate-fadeInUp`}>
        {/* Banner */}
        <div className="relative h-48 w-full bg-gradient-to-br from-amber-300 via-amber-200 to-orange-100">
          {storedUser?.bannerUrl ? (
            <img src={storedUser.bannerUrl} alt="Profile banner" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full" />
          )}
          <button
            onClick={() => navigate('/app/edit-profile')}
            className="absolute right-6 top-6 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg transition hover:shadow-xl hover:-translate-y-0.5"
          >
            <Edit3 className="inline h-4 w-4 mr-2" />
            Edit Profile
          </button>
        </div>

        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          {/* Avatar positioned over banner */}
          <div className="mb-6 -mt-16 flex items-end justify-between">
            <div className="flex items-end gap-4">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-[28px] border-4 border-white bg-gradient-to-br from-amber-300 to-amber-500 text-4xl font-semibold text-white shadow-lg">
                {storedUser?.avatarUrl ? (
                  <img src={storedUser.avatarUrl} alt="Profile avatar" className="h-full w-full object-cover" />
                ) : (
                  storedUser?.name?.charAt(0) || 'M'
                )}
              </div>
              <div className="mb-2">
                <h1 className="text-3xl font-bold text-slate-900">{storedUser?.name || 'Malayali Dev'}</h1>
                <p className="text-sm text-amber-600 font-semibold">{storedUser?.role?.toUpperCase() || 'STUDENT'}</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Introduction & Contact Section */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className={`${cardBase} px-6 py-6 self-start animate-fadeInUp`}>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-600">Introduction</p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {storedUser?.introduction || `Hello, I am ${storedUser?.name || 'Malayali Dev'}. I have passion for web design and graphics. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`}
          </p>
          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-amber-400" />
              <span>{storedUser?.location || 'New York, USA - 10001'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-amber-400" />
              <span>{storedUser?.email || 'user@clearpath.app'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-amber-400" />
              <span>{storedUser?.phone || '+91 00000 00000'}</span>
            </div>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className={`${cardBase} px-6 py-6 animate-fadeInUp`} style={{ animationDelay: '0.08s' }}>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-600">Contact Information</p>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-500">Institution</p>
              <p className="font-semibold text-slate-900">{storedUser?.institution || 'Sir P P Institute Of Science'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="font-semibold text-slate-900">{storedUser?.email || 'user@clearpath.app'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Website</p>
              <p className="font-semibold text-slate-900">{storedUser?.website || 'www.xyz.com'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Location</p>
              <p className="font-semibold text-slate-900">{storedUser?.location || 'New York, USA - 10001'}</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
