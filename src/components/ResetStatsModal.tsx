import React, { useState } from 'react';
import {
  RotateCcw,
  Sliders,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2,
  Zap,
  Target,
  Clock,
  Flame,
  Award
} from 'lucide-react';
import { StudyPlanState, UserStudyProfile } from '../utils/roadmapEngine';

interface ResetStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  planState: StudyPlanState;
  onResetComplete: (freshPlanState: StudyPlanState) => void;
  onCalibrateComplete: (updatedPlanState: StudyPlanState) => void;
}

export const ResetStatsModal: React.FC<ResetStatsModalProps> = ({
  isOpen,
  onClose,
  planState,
  onResetComplete,
  onCalibrateComplete
}) => {
  const [activeTab, setActiveTab] = useState<'reset' | 'calibrate'>('reset');

  // Calibration Form State
  const [targetRank, setTargetRank] = useState(planState.profile.targetRankBand || 'AIR < 100');
  const [dailyHours, setDailyHours] = useState(planState.profile.dailyHours || 6);
  const [streakDays, setStreakDays] = useState(planState.profile.currentStreak || 0);
  const [studiedHours, setStudiedHours] = useState(planState.profile.totalHoursStudied || 0);
  const [xpPoints, setXpPoints] = useState(planState.profile.xpPoints || 0);

  if (!isOpen) return null;

  const handleFreshReset = () => {
    // Reset all nodes in phases to 'locked' or initial 'in_progress'
    const resetPhases = planState.phases.map((phase, pIdx) => ({
      ...phase,
      nodes: phase.nodes.map((node, nIdx) => ({
        ...node,
        status: pIdx === 0 && nIdx === 0 ? ('in_progress' as const) : ('locked' as const),
        masteryPercentage: 0,
        manualCheckouts: {}
      }))
    }));

    const freshState: StudyPlanState = {
      profile: {
        ...planState.profile,
        currentStreak: 0,
        totalHoursStudied: 0,
        xpPoints: 0,
        level: 'Rookie Aspirant'
      },
      phases: resetPhases,
      urgentRevisionQueue: []
    };

    onResetComplete(freshState);
    onClose();
  };

  const handleApplyCalibration = () => {
    const updatedState: StudyPlanState = {
      ...planState,
      profile: {
        ...planState.profile,
        targetRankBand: targetRank,
        dailyHours: Number(dailyHours),
        currentStreak: Number(streakDays),
        totalHoursStudied: Number(studiedHours),
        xpPoints: Number(xpPoints)
      }
    };

    onCalibrateComplete(updatedState);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-[#111318] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <RotateCcw size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Reset &amp; Calibrate Stats</h2>
              <p className="text-xs text-slate-400">Manage application-wide metrics and start fresh</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('reset')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'reset' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trash2 size={13} /> Reset to Fresh Slate (0 Stats)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calibrate')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'calibrate' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders size={13} /> Calibrate Custom Baseline
          </button>
        </div>

        {/* Tab 1: Fresh Slate Reset */}
        {activeTab === 'reset' && (
          <div className="space-y-4">
            <div className="bg-rose-950/30 border border-rose-900/50 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <AlertTriangle size={16} className="text-rose-400 shrink-0" />
                <span>Zero-State Reset Confirmation</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                This will reset all your preparation metrics across the entire application to start clean:
              </p>
              <ul className="list-disc list-inside text-slate-400 space-y-1 pl-1">
                <li>XP points reset to <strong>0 XP</strong> and Level reset to <strong>Rookie Aspirant</strong></li>
                <li>Study streak reset to <strong>0 days</strong></li>
                <li>Total studied hours reset to <strong>0.0 hrs</strong></li>
                <li>All roadmap topic progress &amp; manual checkouts cleared</li>
                <li>Mistake Notebook error logs &amp; mock exam scorecards cleared</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2.5 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFreshReset}
                className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Yes, Reset Everything to 0
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Custom Calibration */}
        {activeTab === 'calibrate' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Customize your baseline numbers so the app accurately reflects where you stand today in your GATE 2027 comeback:
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <Target size={12} className="text-emerald-400" /> Target AIR Band
                </label>
                <input
                  type="text"
                  value={targetRank}
                  onChange={(e) => setTargetRank(e.target.value)}
                  placeholder="AIR < 100"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <Clock size={12} className="text-indigo-400" /> Daily Target (Hours)
                </label>
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <Flame size={12} className="text-amber-400" /> Current Streak (Days)
                </label>
                <input
                  type="number"
                  min={0}
                  value={streakDays}
                  onChange={(e) => setStreakDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <Clock size={12} className="text-cyan-400" /> Verified Studied (Hours)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  value={studiedHours}
                  onChange={(e) => setStudiedHours(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <Award size={12} className="text-purple-400" /> Initial Experience Points (XP)
                </label>
                <input
                  type="number"
                  step="50"
                  min={0}
                  value={xpPoints}
                  onChange={(e) => setXpPoints(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2.5 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCalibration}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Save &amp; Update Stats
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
