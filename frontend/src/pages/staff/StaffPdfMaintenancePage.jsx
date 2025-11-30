import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { RefreshCcw, Trash2, UploadCloud } from 'lucide-react';
import { getToken } from '../../services/authStorage.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatBytes = (bytes = 0) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** idx;
  return `${value.toFixed(value > 10 ? 0 : 1)} ${units[idx]}`;
};

const formatDate = (iso) => {
  if (!iso) return 'Unknown';
  return new Date(iso).toLocaleString();
};

export default function StaffPdfMaintenancePage() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState('');

  const authorizedConfig = useMemo(
    () => ({
      headers: { Authorization: `Bearer ${getToken()}` },
    }),
    []
  );

  const refreshUploads = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE}/api/pdf/admin/uploads?limit=100`, authorizedConfig);
      setUploads(response.data?.uploads || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load uploads.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileInput = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError('');
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        await axios.post(`${API_BASE}/api/pdf/upload`, formData, {
          headers: {
            ...authorizedConfig.headers,
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      await refreshUploads();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to upload PDF.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDelete = async (fileId) => {
    if (!fileId) return;
    const confirmed = window.confirm('Remove this PDF from all students?');
    if (!confirmed) return;

    setDeletingId(fileId);
    setError('');
    try {
      await axios.delete(`${API_BASE}/api/pdf/admin/upload/${fileId}`, authorizedConfig);
      await refreshUploads();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to delete PDF.');
    } finally {
      setDeletingId('');
    }
  };

  React.useEffect(() => {
    refreshUploads();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const totals = useMemo(() => {
    const totalSize = uploads.reduce((sum, file) => sum + (file.size || 0), 0);
    return {
      count: uploads.length,
      sizeLabel: formatBytes(totalSize),
    };
  }, [uploads]);

  return (
    <div className="space-y-5 text-slate-900">
      <header className="rounded-3xl border border-amber-100 bg-gradient-to-br from-white via-amber-50 to-white p-5 shadow-sm">
        <p className="text-[11px] uppercase tracking-[0.3em] text-amber-500">PDF maintenance</p>
        <h2 className="mt-2 text-2xl font-semibold">Manage AI study files</h2>
        <p className="text-sm text-slate-500">Upload fresh PDFs or purge outdated content the students no longer need.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-amber-100 bg-white/90 px-4 py-3">
            <p className="text-xs text-slate-500">Total uploads</p>
            <p className="text-xl font-semibold text-slate-900">{totals.count}</p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-white/90 px-4 py-3">
            <p className="text-xs text-slate-500">Storage footprint</p>
            <p className="text-xl font-semibold text-slate-900">{totals.sizeLabel}</p>
          </div>
          <button
            type="button"
            onClick={refreshUploads}
            className="flex items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-white/90 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:border-amber-300"
            disabled={loading}
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh list
          </button>
        </div>
      </header>

      <section className="rounded-3xl border border-slate-100 bg-white/95 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Upload new PDFs</h3>
            <p className="text-sm text-slate-500">PDFs sync instantly to student Pdf Lab.</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm">
            <UploadCloud className="h-4 w-4" />
            {uploading ? 'Uploading…' : 'Select files'}
            <input type="file" accept="application/pdf" className="hidden" multiple onChange={handleFileInput} disabled={uploading} />
          </label>
        </div>
        <p className="mt-2 text-xs text-slate-500">Max size 25 MB per PDF. Multiple files allowed.</p>
      </section>

      {error && <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      <section className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-slate-100 bg-white/80 px-4 py-6 text-center text-sm text-slate-500">Loading uploads…</div>
        ) : uploads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-10 text-center text-sm text-slate-500">
            No PDFs found. Upload a file to get started.
          </div>
        ) : (
          uploads.map((file) => (
            <article
              key={file.id || file.storedName}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white/95 px-4 py-3 shadow-sm"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{file.originalName || file.storedName || 'PDF file'}</p>
                <p className="text-xs text-slate-500">
                  Uploaded {formatDate(file.uploadedAt)} · {formatBytes(file.size)} · Owner {file.studentId ? `#${file.studentId.slice(-6)}` : '—'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(file.id)}
                className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-1.5 text-sm font-semibold text-red-600 transition hover:border-red-300"
                disabled={deletingId === file.id}
              >
                <Trash2 className={`h-4 w-4 ${deletingId === file.id ? 'animate-pulse' : ''}`} />
                {deletingId === file.id ? 'Removing…' : 'Remove'}
              </button>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
