import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, LogOut, Settings, UserRound } from 'lucide-react';

const menuActions = [
  {
    label: 'Tickets & updates',
    description: 'Jump to your ticket history',
    icon: ClipboardList,
    to: '/app/my-tickets',
  },
  {
    label: 'Edit profile',
    description: 'Update your info & avatar',
    icon: UserRound,
    to: '/app/profile',
  },
  {
    label: 'Support & settings',
    description: 'Raise a new ticket',
    icon: Settings,
    to: '/support',
  },
];

export default function UserMenuCard({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!menuRef.current || menuRef.current.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleNavigate = (path) => {
    setOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setOpen(false);
    onLogout?.();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-4 rounded-[32px] border border-white/60 bg-gradient-to-b from-white to-[#fff9f0] px-4 py-3 text-left shadow-[0_20px_40px_rgba(15,23,42,0.08)] transition hover:border-amber-200"
      >
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-b from-amber-300 to-amber-500 text-sm font-semibold text-amber-950 shadow-inner shadow-amber-200/50">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <span>{user?.name ? user.name.charAt(0) : 'M'}</span>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{user?.name || 'Malayali Dev'}</p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.7em] text-slate-400">Tap for menu</p>
        </div>
      </button>

      {open && (
        <div className="absolute left-0 bottom-[calc(100%+12px)] w-64 rounded-[28px] border border-amber-400/20 bg-gradient-to-b from-[#1c0f03] via-[#120902] to-[#0a0502] text-amber-50 shadow-[0_24px_50px_rgba(79,29,7,0.55)]">
          <div className="flex items-center gap-3 px-5 py-3">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-amber-100 to-amber-400 text-xs font-semibold text-amber-900">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span>{user?.name ? user.name.charAt(0) : 'M'}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{user?.name || 'Malayali Dev'}</p>
              <p className="text-xs text-amber-200/80">{user?.email || 'user@clearpath.app'}</p>
            </div>
          </div>
          <div className="border-t border-amber-50/10" />
          <div className="p-2 text-sm">
            {menuActions.map(({ label, description, icon: Icon, to }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleNavigate(to)}
                className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-amber-50 transition hover:bg-amber-50/5 first:mt-0"
              >
                <Icon className="h-4 w-4 text-amber-200" />
                <span>
                  <p className="font-semibold text-white/90">{label}</p>
                  <p className="text-xs text-amber-200/80">{description}</p>
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-rose-200 transition hover:bg-rose-200/5"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-semibold">Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
