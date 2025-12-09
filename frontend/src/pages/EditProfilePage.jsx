import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Mail, Phone, MapPin } from 'lucide-react';
import { getStoredUser, updateStoredUser } from '../services/authStorage.js';

const cardBase = 'rounded-[28px] border border-amber-100 bg-white shadow-[0_20px_60px_rgba(255,193,111,0.25)]';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const storedUser = getStoredUser();
  const [profile, setProfile] = useState({
    name: storedUser?.name || 'Malayali Dev',
    email: storedUser?.email || 'user@clearpath.app',
    phone: storedUser?.phone || '+91 00000 00000',
    cohort: storedUser?.cohort || 'Fall 2025',
    introduction: storedUser?.introduction || `Hello, I am ${storedUser?.name || 'Malayali Dev'}. I have passion for web design and graphics. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    location: storedUser?.location || 'New York, USA - 10001',
    institution: storedUser?.institution || 'Sir P P Institute Of Science',
    website: storedUser?.website || 'www.xyz.com',
  });
  const [avatarPreview, setAvatarPreview] = useState(storedUser?.avatarUrl || '');
  const [bannerPreview, setBannerPreview] = useState(storedUser?.bannerUrl || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
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
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      navigate('/app/profile');
    }, 1500);
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
      {/* Header */}
      <div className="flex items-center gap-4 animate-fadeInUp">
        <button
          onClick={() => navigate('/app/profile')}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-200 bg-white text-amber-600 transition hover:bg-amber-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
          <p className="text-sm text-slate-600">Update your information and preferences</p>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-6 py-4 animate-fadeInUp">
          <p className="text-sm font-semibold text-green-700">✓ Profile updated successfully!</p>
        </div>
      )}

      {/* Banner Section */}
      <section className={`${cardBase} px-6 py-6 animate-fadeInUp`}>
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-600">Profile Banner</p>
          <h2 className="mt-2 text-xl font-semibold">Cover image</h2>
          <p className="text-sm text-slate-600">Recommended size: 1600 × 400 pixels</p>
        </div>
        <label className="text-sm font-semibold text-slate-700">
          <div className="mt-4 rounded-3xl border border-dashed border-amber-300 bg-amber-50/40 p-6">
            <div className="h-40 rounded-2xl bg-white/70 overflow-hidden">
              {bannerPreview ? (
                <img src={bannerPreview} alt="Banner preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-amber-400" />
                    <p>Click to upload banner image</p>
                  </div>
                </div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleMediaChange(event, 'banner')}
              className="mt-4 w-full text-xs text-slate-500 cursor-pointer"
            />
          </div>
        </label>
      </section>

      {/* Avatar Section */}
      <section className={`${cardBase} px-6 py-6 animate-fadeInUp`} style={{ animationDelay: '0.08s' }}>
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-600">Profile Avatar</p>
          <h2 className="mt-2 text-xl font-semibold">Profile picture</h2>
          <p className="text-sm text-slate-600">Square image recommended · PNG/JPG</p>
        </div>
        <label className="text-sm font-semibold text-slate-700">
          <div className="mt-4 flex flex-col items-center justify-center rounded-3xl border border-dashed border-amber-300 bg-amber-50/40 px-6 py-8 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-2xl font-semibold text-white overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" className="h-full w-full object-cover" />
              ) : (
                <span>{profile.name.charAt(0)}</span>
              )}
            </div>
            <p className="mt-4 text-xs text-slate-500">Upload square image · PNG/JPG</p>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => handleMediaChange(event, 'avatar')}
              className="mt-3 w-full text-xs text-slate-500 cursor-pointer"
            />
          </div>
        </label>
      </section>

      {/* Credentials Section */}
      <section className={`${cardBase} px-6 py-6 animate-fadeInUp`} style={{ animationDelay: '0.16s' }}>
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-600">Credentials & Contact</p>
          <h2 className="mt-2 text-xl font-semibold">Personal information</h2>
          <p className="text-sm text-slate-600">These fields feed your ticket signatures and mentor cards</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <label className="text-sm font-semibold text-slate-700">
              Full name
              <input
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="Your full name"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Email address
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="your.email@example.com"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Phone number
              <input
                name="phone"
                value={profile.phone}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="+91 00000 00000"
              />
            </label>
            <label className="text-sm font-semibold text-slate-700">
              Cohort / Track
              <input
                name="cohort"
                value={profile.cohort}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                placeholder="e.g., Fall 2025"
              />
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-200/70 transition hover:bg-amber-600 hover:-translate-y-0.5"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/profile')}
              className="inline-flex items-center justify-center rounded-2xl border border-amber-200 bg-white px-6 py-3 text-sm font-semibold text-amber-600 transition hover:bg-amber-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>

      {/* Introduction & Contact Section */}
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className={`${cardBase} px-6 py-6 self-start animate-fadeInUp`} style={{ animationDelay: '0.24s' }}>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-600">Introduction</p>
          <textarea
            name="introduction"
            placeholder="Tell us about yourself..."
            className="mt-4 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 resize-none"
            rows="5"
            value={profile.introduction}
            onChange={handleInputChange}
          />
          <div className="mt-6 space-y-4 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-amber-400" />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={profile.location}
                onChange={handleInputChange}
                className="flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-amber-400" />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={profile.email}
                onChange={handleInputChange}
                className="flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-amber-400" />
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={profile.phone}
                onChange={handleInputChange}
                className="flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
          </div>
        </div>

        {/* Contact Info Card */}
        <div className={`${cardBase} px-6 py-6 animate-fadeInUp`} style={{ animationDelay: '0.32s' }}>
          <p className="text-xs uppercase tracking-[0.3em] text-amber-600">Contact Information</p>
          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-500">Institution</p>
              <input
                type="text"
                name="institution"
                placeholder="Institution name"
                value={profile.institution}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={profile.email}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
            <div>
              <p className="text-xs text-slate-500">Website</p>
              <input
                type="url"
                name="website"
                placeholder="Website URL"
                value={profile.website}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
            <div>
              <p className="text-xs text-slate-500">Location</p>
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={profile.location}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
