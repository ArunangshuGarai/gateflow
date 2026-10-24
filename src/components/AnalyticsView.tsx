import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Target,
  Zap,
  ArrowUpRight,
  Filter,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { StudyPlanState } from '../utils/roadmapEngine';

interface AnalyticsViewProps {
  planState: StudyPlanState;
  onNavigateTab: (tab: string) => void;
  onLaunchTopicTest: (topic: string) => void;
}

interface SubjectMasteryData {
  name: string;
  category: string;
  mastery: number;
  accuracy: number;
  totalQuestions: number;
  avgTimeMin: number;
  weakTopics: string[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  planState,
  onNavigateTab,
  onLaunchTopicTest
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'Core CS' | 'Math & Aptitude'>('all');

  const subjectData: SubjectMasteryData[] = [
    {
      name: 'Algorithms & Data Structures',
      category: 'Core CS',
      mastery: 84,
      accuracy: 88,
      totalQuestions: 38,
      avgTimeMin: 2.1,
      weakTopics: ['Dynamic Programming on Trees']
    },
    {
      name: 'Engineering Mathematics',
      category: 'Math & Aptitude',
      mastery: 79,
      accuracy: 82,
      totalQuestions: 28,
      avgTimeMin: 1.8,
      weakTopics: ['Cayley-Hamilton Matrix Inverse']
    },
    {
      name: 'Operating Systems',
      category: 'Core CS',
      mastery: 71,
      accuracy: 68,
      totalQuestions: 32,
      avgTimeMin: 2.4,
      weakTopics: ['Process Synchronization & Semaphores', 'TLB Effective Access Time']
    },
    {
      name: 'Databases (DBMS)',
      category: 'Core CS',
      mastery: 76,
      accuracy: 80,
      totalQuestions: 24,
      avgTimeMin: 1.9,
      weakTopics: ['Conflict Serializability & View Equivalence']
    },
    {
      name: 'Computer Networks',
      category: 'Core CS',
      mastery: 58,
      accuracy: 61,
      totalQuestions: 26,
      avgTimeMin: 2.9,
      weakTopics: ['CIDR Subnetting & Usable Hosts', 'TCP Congestion Window Phases']
    },
    {
      name: 'Theory of Computation',
      category: 'Core CS',
      mastery: 73,
      accuracy: 75,
      totalQuestions: 22,
      avgTimeMin: 2.0,
      weakTopics: ['Undecidability of CFG Equivalence']
    },
    {
      name: 'Computer Architecture (COA)',
      category: 'Core CS',
      mastery: 64,
      accuracy: 66,
      totalQuestions: 18,
      avgTimeMin: 2.7,
      weakTopics: ['Pipelining Clock Overhead & Stalls']
    },
    {
      name: 'General Aptitude',
      category: 'Math & Aptitude',
      mastery: 89,
      accuracy: 92,
      totalQuestions: 34,
      avgTimeMin: 1.2,
      weakTopics: []
    }
  ];

  const filteredSubjects = activeCategory === 'all'
    ? subjectData
    : subjectData.filter(s => s.category === activeCategory);

  const getMasteryColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80';
    if (score >= 70) return 'text-indigo-300 bg-indigo-950/60 border-indigo-800/80';
    if (score >= 60) return 'text-amber-400 bg-amber-950/60 border-amber-800/80';
    return 'text-rose-400 bg-rose-950/60 border-rose-800/80';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 70) return 'bg-indigo-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-indigo-400">
              GATE 2027 Performance Intelligence
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-[11px] text-slate-400">
              Target: AIR &lt; 100
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white mt-1">
            Readiness &amp; Subject Mastery Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Real-time diagnostic metrics derived from CBT mock attempts, question bank accuracy, and mistake patterns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('exams')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow"
          >
            <Zap size={14} /> New Diagnostic CBT
          </button>
        </div>
      </div>

      {/* Top 3 High-Impact Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Exam Readiness & Projected Score */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-400" />
              Exam Readiness Composite
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
              High Confidence
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black font-mono text-white">685</span>
                <span className="text-xs text-slate-400 font-mono"> / 1000 Proj. Score</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black font-mono text-emerald-400">AIR 80 - 150</span>
                <div className="text-[10px] text-slate-400">Est. Rank Band</div>
              </div>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full" style={{ width: '68.5%' }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Overall Accuracy</span>
              <strong className="text-white font-mono">78.4%</strong>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Negative Mark Penalty</span>
              <strong className="text-rose-400 font-mono">-0.67 marks/exam</strong>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Data Sufficiency</span>
              <strong className="text-indigo-300 font-mono">142 questions / 4 tests</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Time Management & Speed Radar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Clock size={16} className="text-indigo-400" />
              Speed &amp; Time Distribution
            </span>
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/60 border border-indigo-800/80 px-2 py-0.5 rounded">
              Ideal Pace
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>1-Mark Questions (Avg)</span>
                <span className="font-mono font-bold text-white">1.3 min <span className="text-[10px] text-slate-500">(Target: 1.5)</span></span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>2-Mark Questions (Avg)</span>
                <span className="font-mono font-bold text-white">2.8 min <span className="text-[10px] text-slate-500">(Target: 3.0)</span></span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '90%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-300">
                <span className="text-rose-300">Time on Failed / Trap Questions</span>
                <span className="font-mono font-bold text-rose-400">4.1 min</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full" style={{ width: '65%' }} />
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-tight">
            Flag: 4+ minutes spent on tricky questions increases panic. Practice skipping and revisiting via CBT palette.
          </p>
        </div>

        {/* Card 3: 2-Year Gap Study Consistency */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-1.5">
              <TrendingUp size={16} className="text-amber-400" />
              Re-Start Cadence &amp; Streak
            </span>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded">
              5 Days Active
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-black font-mono text-white">38.5</span>
                <span className="text-xs text-slate-400 font-mono"> Hours Studied</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">+6.2h this week</span>
            </div>

            <div className="grid grid-cols-7 gap-1 pt-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                <div key={day} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-full h-8 rounded-md flex items-center justify-center font-mono text-[10px] font-bold ${
                      idx < 5
                        ? 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-950 border border-slate-800 text-slate-600'
                    }`}
                  >
                    {idx < 5 ? `${5 + (idx % 2)}h` : '-'}
                  </div>
                  <span className="text-[9px] text-slate-500">{day}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-slate-400">
            A 2-year gap is neutralized by consistency. Your study pattern is solidifying into long-term retention.
          </p>
        </div>
      </div>

      {/* Subject-Wise Mastery Heatmap Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers size={18} className="text-indigo-400" />
              Subject &amp; Topic Mastery Heatmap
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated across all test sessions and practice questions attempted.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {(['all', 'Core CS', 'Math & Aptitude'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeCategory === cat
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Subjects' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <th className="pb-3 font-semibold">Subject</th>
                <th className="pb-3 font-semibold">Mastery</th>
                <th className="pb-3 font-semibold">Accuracy</th>
                <th className="pb-3 font-semibold">Questions</th>
                <th className="pb-3 font-semibold">Avg Time</th>
                <th className="pb-3 font-semibold">Diagnosed Weakness</th>
                <th className="pb-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSubjects.map(sub => (
                <tr key={sub.name} className="hover:bg-slate-850/40 transition-colors group">
                  <td className="py-3.5 pr-4 font-bold text-white">
                    {sub.name}
                    <div className="text-[10px] text-slate-500 font-normal">{sub.category}</div>
                  </td>

                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] border ${getMasteryColor(sub.mastery)}`}>
                        {sub.mastery}%
                      </span>
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 hidden sm:block overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getProgressBarColor(sub.mastery)}`}
                          style={{ width: `${sub.mastery}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 pr-4 font-mono text-slate-200">
                    {sub.accuracy}%
                  </td>

                  <td className="py-3.5 pr-4 font-mono text-slate-400">
                    {sub.totalQuestions} Qs
                  </td>

                  <td className="py-3.5 pr-4 font-mono text-slate-300">
                    {sub.avgTimeMin} min
                  </td>

                  <td className="py-3.5 pr-4 text-slate-400">
                    {sub.weakTopics.length > 0 ? (
                      <span className="text-amber-400 font-medium">
                        {sub.weakTopics.join(', ')}
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Solid Understanding
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => onLaunchTopicTest(sub.name)}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-slate-950 hover:bg-slate-800 border border-slate-800 px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1"
                    >
                      Drill <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weekly Strategy Review & AI Actionable Recommendations */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Zap size={18} className="text-amber-400" />
          <div>
            <h3 className="text-base font-bold text-white">
              Weekly Strategy &amp; Syllabus Calibration
            </h3>
            <p className="text-xs text-slate-400">
              Prescriptive adjustments to optimize time allocation over the next 7 days.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <span>1. Reallocate Networks Time</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Your accuracy on Computer Networks is currently 58%. Shift 90 minutes from General Aptitude to CIDR subnetting and TCP sliding window calculations.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span>2. Eliminate NAT Decimal Errors</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Recent errors in Networks and Algorithms were due to forgetting broadcast offset (-2) and recurrence unwinding arithmetic. Always use the Virtual Scientific Calculator.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <span>3. Audit Mistake Binder</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              There are 2 pending mistakes flagged in Operating Systems. Re-solve them in the Mistake Binder before attempting your next weekend Full Mock Paper.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
