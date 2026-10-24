import React from 'react';
import {
  Compass,
  Play,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Clock,
  Award,
  BookOpen,
  ArrowRight,
  Tv,
  BrainCircuit,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Target,
  Zap,
  BarChart3,
  Layers,
  Timer,
  Check
} from 'lucide-react';
import { StudyPlanState } from '../utils/roadmapEngine';
import { DailyTaskItem, ErrorLogItem, GateQuestion } from '../types';
import { CURATED_GATE_VIDEOS } from '../data/gateCuratedContent';

interface DashboardViewProps {
  planState: StudyPlanState;
  dailyTasks: DailyTaskItem[];
  onToggleTask: (taskId: string) => void;
  onNavigateTab: (tab: string) => void;
  onSelectTopicForVideo: (topic: string, subject: string) => void;
  onLaunchTopicTest: (topic: string) => void;
  onLaunchFullMock: () => void;
  errorLogs: ErrorLogItem[];
  onAddXp: (amount: number, reason: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  planState,
  dailyTasks,
  onToggleTask,
  onNavigateTab,
  onSelectTopicForVideo,
  onLaunchTopicTest,
  onLaunchFullMock,
  errorLogs,
  onAddXp
}) => {
  const unresolvedMistakes = errorLogs.filter(e => !e.resolved);
  const completedTasksCount = dailyTasks.filter(t => t.completed).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Top Greeting Header (Matches image_fef8b187.png) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Good evening. Let&apos;s make today count.
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Saturday, 24 October · Your preparation overview
          </p>
        </div>

        {/* Top Right Countdown Card (Matches image_fef8b187.png) */}
        <div
          onClick={() => onNavigateTab('exams')}
          className="bg-[#171b22] border border-slate-800/80 hover:border-slate-700 px-3.5 py-2 rounded-xl flex items-center gap-3 cursor-pointer transition-all hover:scale-[1.02] shadow-sm shrink-0 w-fit"
          title="Click to view GATE 2027 Mock Exam Papers"
        >
          <div className="p-1.5 rounded-lg bg-slate-800 text-[#A3E635]">
            <Clock size={16} />
          </div>
          <div>
            <div className="text-xs font-black text-white font-mono flex items-center gap-1.5">
              <span>GATE 2027</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Countdown</div>
          </div>
        </div>
      </div>

      {/* Recommended Next HERO CARD (Matches image_fef8b187.png) */}
      <div className="bg-[#171b22] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <span className="bg-[#60A5FA]/15 border border-[#60A5FA]/40 text-[#60A5FA] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            Recommended next
          </span>
          <span className="text-xs font-mono text-slate-400 font-medium">45 min</span>
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            Operating Systems
          </h2>
          <h3 className="text-sm font-semibold text-slate-300 mt-0.5">
            Process Scheduling — concept learning
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
            Continue from your last session. Review CPU scheduling criteria, then solve 8 practice questions.
          </p>
        </div>

        {/* Progress Bar & Continue Session CTA */}
        <div className="space-y-3 pt-1">
          <div className="w-full bg-[#111318] rounded-full h-1.5 overflow-hidden">
            <div className="bg-[#A3E635] h-full rounded-full transition-all duration-300" style={{ width: '65%' }} />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
            <span className="text-xs text-slate-400 font-mono">
              Topic progress · <strong className="text-slate-200">65%</strong>
            </span>

            {/* "Continue session ->" CTA taking user straight to YouTube Workspace with OS preloaded */}
            <button
              onClick={() => onSelectTopicForVideo('CPU Scheduling', 'Operating Systems')}
              className="bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs px-4 py-2 rounded-full flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-[1.02] active:scale-95 w-full sm:w-auto"
            >
              <span>Continue session</span>
              <ArrowRight size={14} className="stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards (2x2 Grid Matching image_fef8b187.png) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Focused Study Today (Blue icon) */}
        <div className="bg-[#171b22] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center text-[#60A5FA]">
            <Clock size={16} />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">3h 20m</div>
            <div className="text-xs text-slate-400 mt-0.5">Focused study today</div>
          </div>
        </div>

        {/* Metric 2: Recent Practice Accuracy (Lime icon) */}
        <div className="bg-[#171b22] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center text-[#A3E635]">
            <Target size={16} />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">72%</div>
            <div className="text-xs text-slate-400 mt-0.5">Recent practice accuracy</div>
          </div>
        </div>

        {/* Metric 3: Syllabus Completed (Blue icon) */}
        <div className="bg-[#171b22] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center text-[#60A5FA]">
            <BookOpen size={16} />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">38%</div>
            <div className="text-xs text-slate-400 mt-0.5">Syllabus completed</div>
          </div>
        </div>

        {/* Metric 4: Topics Due for Revision (Amber icon) */}
        <div
          onClick={() => onNavigateTab('revision')}
          className="bg-[#171b22] border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between space-y-2 cursor-pointer transition-colors"
        >
          <div className="flex items-center text-[#FBBF24]">
            <RotateCcw size={16} />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">
              {Math.max(6, unresolvedMistakes.length)}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Topics due for revision</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Plan Checklist & Study Consistency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Plan (Checklist card matching image_fef8b187.png) */}
        <div className="bg-[#171b22] border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-bold text-white">Today&apos;s plan</h3>
              <span className="text-xs text-slate-400 font-mono">3 tasks · 2h 15m planned</span>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              {/* Task 1: Finish Process Scheduling lecture */}
              <div
                onClick={() => onSelectTopicForVideo('CPU Scheduling', 'Operating Systems')}
                className="flex items-center justify-between gap-3 text-xs cursor-pointer group py-1"
              >
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-[#A3E635] flex items-center justify-center text-slate-950 shrink-0">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200 line-through text-slate-400 group-hover:text-white transition-colors">
                      Finish Process Scheduling lecture
                    </span>
                    <p className="text-[11px] text-slate-500">Learning · 35 min</p>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-[#A3E635]" />
              </div>

              {/* Task 2: Solve a topic-wise mini test */}
              <div
                onClick={() => onLaunchTopicTest('CPU Scheduling')}
                className="flex items-center justify-between gap-3 text-xs cursor-pointer group py-1"
              >
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full border border-slate-600 flex items-center justify-center group-hover:border-[#A3E635] shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                      Solve a topic-wise mini test
                    </span>
                    <p className="text-[11px] text-slate-500">Practice · 25 min</p>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-slate-600" />
              </div>

              {/* Task 3: Review yesterday's formula cards */}
              <div
                onClick={() => onNavigateTab('vault')}
                className="flex items-center justify-between gap-3 text-xs cursor-pointer group py-1"
              >
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full border border-slate-600 flex items-center justify-center group-hover:border-[#A3E635] shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                      Review yesterday&apos;s formula cards
                    </span>
                    <p className="text-[11px] text-slate-500">Revision · 15 min</p>
                  </div>
                </div>
                <div className="h-2 w-2 rounded-full bg-slate-600" />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400">
            1 of 3 tasks completed
          </div>
        </div>

        {/* Study Consistency Barchart (Matching image_fef8b187.png) */}
        <div className="bg-[#171b22] border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Study consistency</h3>
            <p className="text-xs text-slate-400 mt-0.5">Illustrative weekly focused study hours</p>
          </div>

          {/* 7-Day Bar Chart */}
          <div className="pt-4 pb-2">
            <div className="h-32 flex items-end justify-between gap-2 px-2">
              {[
                { day: 'Sun', height: '40%', active: false, hours: '3.0h' },
                { day: 'Mon', height: '65%', active: false, hours: '5.2h' },
                { day: 'Tue', height: '45%', active: false, hours: '3.5h' },
                { day: 'Wed', height: '85%', active: false, hours: '6.8h' },
                { day: 'Thu', height: '30%', active: false, hours: '2.4h' },
                { day: 'Fri', height: '70%', active: false, hours: '5.5h' },
                { day: 'Sat', height: '55%', active: true, hours: '4.2h' }
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-default">
                  <div className="w-full flex justify-center h-28 items-end">
                    <div
                      className={`w-full max-w-[32px] rounded-md transition-all duration-300 ${
                        bar.active
                          ? 'bg-[#A3E635] shadow-lg shadow-[#A3E635]/20'
                          : 'bg-[#2b3342] group-hover:bg-slate-600'
                      }`}
                      style={{ height: bar.height }}
                      title={`${bar.day}: ${bar.hours}`}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-medium ${
                      bar.active ? 'text-[#A3E635] font-bold' : 'text-slate-400'
                    }`}
                  >
                    {bar.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
            <span>Weekly Target: <strong className="text-white">35h</strong></span>
            <span className="text-[#A3E635] font-bold">Ahead of Target</span>
          </div>
        </div>
      </div>

      {/* Quick Access to Preparation Hubs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <button
          onClick={() => onNavigateTab('learn')}
          className="bg-[#171b22] border border-slate-800 hover:border-[#A3E635]/60 rounded-xl p-3 text-left transition-all group"
        >
          <Tv size={16} className="text-[#A3E635] mb-1 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-bold text-white">Learn Workspace</div>
          <div className="text-[10px] text-slate-400">YouTube + AI Tutor</div>
        </button>

        <button
          onClick={onLaunchFullMock}
          className="bg-[#171b22] border border-slate-800 hover:border-[#60A5FA]/60 rounded-xl p-3 text-left transition-all group"
        >
          <FileSpreadsheet size={16} className="text-[#60A5FA] mb-1 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-bold text-white">CBT Exam Paper</div>
          <div className="text-[10px] text-slate-400">TCS iON Simulator</div>
        </button>

        <button
          onClick={() => onNavigateTab('revision')}
          className="bg-[#171b22] border border-slate-800 hover:border-[#F87171]/60 rounded-xl p-3 text-left transition-all group"
        >
          <RotateCcw size={16} className="text-[#F87171] mb-1 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-bold text-white">Mistake Binder</div>
          <div className="text-[10px] text-slate-400">{unresolvedMistakes.length} Pending audits</div>
        </button>

        <button
          onClick={() => onNavigateTab('vault')}
          className="bg-[#171b22] border border-slate-800 hover:border-[#FBBF24]/60 rounded-xl p-3 text-left transition-all group"
        >
          <BookOpen size={16} className="text-[#FBBF24] mb-1 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-bold text-white">Formula Vault</div>
          <div className="text-[10px] text-slate-400">KaTeX cheat-sheets</div>
        </button>
      </div>
    </div>
  );
};
