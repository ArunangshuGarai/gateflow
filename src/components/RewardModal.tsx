import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Flame, Zap, ArrowRight, X } from 'lucide-react';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  xpGained: number;
  streakCount: number;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  xpGained,
  streakCount
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-indigo-500/40 rounded-2xl p-6 shadow-2xl text-center space-y-4 text-slate-100 relative">
        <button
          onClick={onClose}
          aria-label="Close reward modal"
          className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X size={18} />
        </button>

        <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Award size={36} className="text-white" />
        </div>

        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            Level Up &amp; Milestone Unlocked
          </span>
          <h3 className="text-xl font-black text-white mt-1">{title}</h3>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            "{message}"
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 py-2">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">XP Awarded</span>
            <div className="text-xl font-mono font-bold text-emerald-400">+{xpGained} XP</div>
          </div>
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Comeback Streak</span>
            <div className="text-xl font-mono font-bold text-amber-400 flex items-center justify-center gap-1">
              <Flame size={16} /> {streakCount} Days
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5"
        >
          <span>Keep the Intensity Burning</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
