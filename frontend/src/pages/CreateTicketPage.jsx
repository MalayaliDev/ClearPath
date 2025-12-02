import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Send, AlertCircle, CheckCircle } from 'lucide-react';
import { getStoredUser, getToken } from '../services/authStorage.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    description: '',
    priority: 'Medium',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const categories = ['General', 'Technical', 'Academic', 'Administrative', 'Other'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(
        `${API_BASE}/api/complaints`,
        formData,
        {
          headers: { Authorization: `Bearer ${getToken()}` },
          withCredentials: true,
        }
      );

      setSuccess(true);
      setFormData({ title: '', category: 'General', description: '', priority: 'Medium' });
      
      // Redirect to tickets page after 2 seconds
      setTimeout(() => {
        navigate('/app/tickets');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket. Please try again.');
      console.error('Ticket creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fff6ec] via-[#fff1de] to-[#ffe6c8]">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={() => navigate('/app/tickets')}
            className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-white p-2 hover:bg-amber-50 transition"
          >
            <ArrowLeft className="h-5 w-5 text-amber-600" />
          </button>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-600">Create support ticket</p>
            <h1 className="text-2xl font-semibold text-slate-900">New ticket</h1>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-[28px] border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900">Ticket created successfully!</p>
              <p className="text-sm text-emerald-700">Redirecting to your tickets...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-[28px] border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900">Error</p>
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div className="rounded-[36px] border border-amber-100 bg-white/95 p-8 shadow-[0_25px_60px_rgba(255,193,111,0.25)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-900 mb-2">
                Ticket title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Issue with PDF upload"
                className="w-full rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-100 transition"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-slate-500">Be specific about your issue</p>
            </div>

            {/* Category Field */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-slate-900 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm text-slate-900 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-100 transition"
                disabled={loading}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Priority Field */}
            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-slate-900 mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm text-slate-900 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-100 transition"
                disabled={loading}
              >
                {priorities.map(pri => (
                  <option key={pri} value={pri}>{pri}</option>
                ))}
              </select>
              <p className="mt-1 text-xs text-slate-500">Select how urgent this is</p>
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-900 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your issue in detail. Include any error messages or steps to reproduce..."
                rows="6"
                className="w-full rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-100 transition resize-none"
                disabled={loading}
              />
              <p className="mt-1 text-xs text-slate-500">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Info Box */}
            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
              <p className="text-xs text-amber-900">
                <strong>💡 Tip:</strong> The more details you provide, the faster our mentors can help you!
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/app/tickets')}
                disabled={loading}
                className="flex-1 rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-200/70 hover:bg-amber-600 transition disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Create ticket
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-8 rounded-2xl border border-amber-100 bg-white/80 p-6">
          <p className="text-xs text-slate-600 mb-3">
            <strong className="text-slate-900">Need help?</strong>
          </p>
          <ul className="space-y-2 text-xs text-slate-600">
            <li>• <strong>General:</strong> Questions about the platform</li>
            <li>• <strong>Technical:</strong> Bugs or technical issues</li>
            <li>• <strong>Academic:</strong> Course or learning related questions</li>
            <li>• <strong>Administrative:</strong> Account or billing issues</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
