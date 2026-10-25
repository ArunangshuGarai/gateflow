import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  Award,
  Bell,
  Tv,
  FileSpreadsheet,
  Compass,
  BrainCircuit,
  BookOpen,
  Timer,
  Play,
  RotateCcw,
  BarChart3,
  CheckCircle2,
  X,
  LayoutDashboard,
  Layers,
  ChevronDown,
  Cloud,
  Database,
  User as UserIcon,
  LogOut,
  LogIn
} from 'lucide-react';
import { NotificationItem } from '../types';
import type { User } from 'firebase/auth';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  streakDays: number;
  xpPoints: number;
  userLevel: string;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onLaunchFullMock: () => void;
  unresolvedMistakesCount?: number;
  cloudSyncStatus?: 'synced' | 'syncing' | 'offline';
  currentUser?: User | null;
  onSignInGoogle?: () => void;
  onSignOut?: () => void;
  onOpenAuthModal?: () => void;
  onOpenResetStatsModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  streakDays,
  xpPoints,
  userLevel,
  notifications,
  onMarkNotificationRead,
  onLaunchFullMock,
  unresolvedMistakesCount = 0,
  cloudSyncStatus = 'synced',
  currentUser,
  onSignInGoogle,
  onSignOut,
  onOpenAuthModal,
  onOpenResetStatsModal
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [timeToGate, setTimeToGate] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Countdown to GATE 2027 (First Saturday of Feb 2027: Feb 6, 2027, 09:00:00 IST)
  useEffect(() => {
    const targetDate = new Date('2027-02-06T09:00:00+05:30').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance <= 0) {
        setTimeToGate({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeToGate({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planner', label: 'Planner', icon: Compass },
    { id: 'learn', label: 'Learn', icon: Tv },
    { id: 'practice', label: 'Practice', icon: BrainCircuit },
    { id: 'exams', label: 'Mock Exams', icon: FileSpreadsheet },
    {
      id: 'revision',
      label: 'Revision',
      icon: RotateCcw,
      badge: unresolvedMistakesCount > 0 ? unresolvedMistakesCount : undefined
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'syllabus', label: 'Syllabus', icon: Layers },
    { id: 'vault', label: 'Formulas', icon: BookOpen },
    { id: 'focus', label: 'Deep Work', icon: Timer }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100 px-3 py-2">
      <div className="w-full flex items-center justify-between gap-2 px-1">
        {/* Brand & GATE 2027 Countdown */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="h-8 w-8 rounded-lg bg-[#A3E635] flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-[#A3E635]/20 group-hover:scale-105 transition-transform">
              <BookOpen size={16} className="text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-black text-white text-xs tracking-tight">GATEFLOW</span>
                <span className="text-[9px] font-mono font-bold bg-[#A3E635]/20 text-[#A3E635] border border-[#A3E635]/40 px-1 py-0.2 rounded">
                  2027
                </span>
              </div>
            </div>
          </div>

          {/* Real-time countdown to Feb 2027 */}
          <div className="hidden lg:flex items-center gap-1 bg-[#171b22] border border-slate-800 px-2 py-0.5 rounded text-[11px] font-mono text-amber-400">
            <Clock size={11} className="text-[#FBBF24]" />
            <span className="font-bold">{timeToGate.days}d</span>
            <span className="text-slate-500">:</span>
            <span className="font-bold">{timeToGate.hours}h</span>
            <span className="text-slate-500">:</span>
            <span className="font-bold">{timeToGate.minutes}m</span>
            <span className="text-slate-500">:</span>
            <span className="font-bold text-slate-300">{timeToGate.seconds}s</span>
          </div>
        </div>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-0.5 text-[11px] font-semibold">
          {navLinks.map(link => {
            const Icon = link.icon;
            const isActive = currentTab === link.id;

            return (
              <button
                key={link.id}
                onClick={() => onTabChange(link.id)}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 transition-colors relative whitespace-nowrap ${
                  isActive
                    ? 'bg-[#222731] text-[#A3E635] border border-slate-700 font-bold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-[#A3E635]' : 'text-slate-400'} />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="bg-[#F87171] text-white text-[9px] px-1 rounded-full font-bold font-mono">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Status (Streak, XP, Notifications, Cloud/Auth & Full Mock CTA) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Streak Indicator */}
          <div
            className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-400"
            title="Daily Study Streak"
          >
            <Flame size={13} className="text-amber-500 animate-pulse" />
            <span className="font-mono">{streakDays}d</span>
          </div>

          {/* XP Badge */}
          <div
            className="hidden sm:flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-xs"
            title={userLevel}
          >
            <Award size={13} className="text-indigo-400" />
            <span className="font-mono font-bold text-indigo-300">{xpPoints} XP</span>
          </div>

          {/* Notification Center Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 hover:text-white relative transition-colors"
              aria-label="Study Notifications"
            >
              <Bell size={15} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-white">Study &amp; Weakness Alerts</span>
                  <button
                    onClick={() => setIsNotifOpen(false)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center py-4">No active reminders.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          onMarkNotificationRead(n.id);
                          if (n.actionRoute) onTabChange(n.actionRoute);
                          setIsNotifOpen(false);
                        }}
                        className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          n.read
                            ? 'bg-slate-950 border-slate-800 text-slate-400'
                            : n.type === 'urgent'
                            ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                            : 'bg-indigo-950/40 border-indigo-800 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold mb-0.5">
                          <span className="truncate">{n.title}</span>
                          <span className="text-[10px] text-slate-500 shrink-0 ml-1">{n.timeAgo}</span>
                        </div>
                        <p className="text-[11px] leading-tight text-slate-300">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

            {/* Cloud Database Sync Status & Account Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
                title={cloudSyncStatus === 'synced' ? 'Connected to Firestore Database' : cloudSyncStatus === 'syncing' ? 'Syncing data to Cloud...' : 'Cloud offline'}
              >
                <Database size={13} className={cloudSyncStatus === 'synced' ? 'text-emerald-400' : cloudSyncStatus === 'syncing' ? 'text-amber-400 animate-spin' : 'text-slate-500'} />
                <span className="hidden md:inline font-mono text-[11px]">
                  {cloudSyncStatus === 'syncing' ? 'Syncing...' : 'Cloud'}
                </span>
                <span className={`h-1.5 w-1.5 rounded-full ${cloudSyncStatus === 'synced' ? 'bg-emerald-400' : cloudSyncStatus === 'syncing' ? 'bg-amber-400 animate-ping' : 'bg-slate-500'}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3.5 z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                        {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'G'}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold text-white truncate">
                          {currentUser?.displayName || (currentUser?.isAnonymous ? 'Guest Aspirant' : 'GATE Candidate')}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {currentUser?.email || (currentUser?.isAnonymous ? 'UID: ' + currentUser.uid.slice(0, 8) + '...' : 'Cloud Synchronized')}
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setIsUserMenuOpen(false)} className="text-slate-400 hover:text-white text-xs">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Database Engine:</span>
                      <span className="font-semibold text-emerald-400 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Firestore
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Sync Status:</span>
                      <span className="text-slate-200 font-mono capitalize">{cloudSyncStatus}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight pt-1">
                      Mistake Notebook entries, custom formulas, and mock exam scores are persisted to cloud storage.
                    </div>
                  </div>

                  <div className="pt-1 space-y-2">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        if (onOpenAuthModal) onOpenAuthModal();
                        else if (onSignInGoogle) onSignInGoogle();
                      }}
                      className="w-full bg-[#A3E635] hover:bg-[#86efac] text-slate-950 font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                    >
                      <LogIn size={13} /> {currentUser?.isAnonymous ? 'Sign In / Register' : 'Switch / Manage Account'}
                    </button>

                    {onOpenResetStatsModal && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenResetStatsModal();
                        }}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-rose-300 font-semibold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 border border-rose-900/40 transition-colors"
                      >
                        <RotateCcw size={13} className="text-rose-400" /> Reset &amp; Update Stats
                      </button>
                    )}

                    {!currentUser?.isAnonymous && onSignOut && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onSignOut();
                        }}
                        className="w-full bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 font-semibold text-xs py-1.5 rounded-lg flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
                      >
                        <LogOut size={13} /> Sign Out
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Mock Examination CTA */}
            <button
              onClick={onLaunchFullMock}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-md transition-transform active:scale-95 shrink-0"
            >
              <Play size={11} className="fill-current" />
              <span className="hidden sm:inline">CBT Mock</span>
            </button>
          </div>
        </div>

      {/* Mobile / Tablet Horizontal Navigation Scroll */}
      <div className="flex xl:hidden items-center gap-1 pt-2 mt-2 border-t border-slate-800 text-xs overflow-x-auto no-scrollbar">
        {navLinks.map(link => {
          const isActive = currentTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => onTabChange(link.id)}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap flex items-center gap-1 transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
              }`}
            >
              <span>{link.label}</span>
              {link.badge && (
                <span className="bg-rose-500 text-white text-[9px] px-1 rounded-full font-bold font-mono">
                  {link.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
