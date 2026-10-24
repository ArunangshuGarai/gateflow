import React, { useState } from 'react';
import {
  BrainCircuit,
  Filter,
  Play,
  Search,
  CheckCircle2,
  HelpCircle,
  Clock,
  Sparkles,
  Zap,
  BookOpen,
  Eye,
  EyeOff,
  ChevronRight,
  Layers
} from 'lucide-react';
import { GateQuestion } from '../types';
import { INITIAL_GATE_EXAM_QUESTIONS } from '../data/gateCuratedContent';
import { MathView } from './MathView';
import { AiTestStudio } from './AiTestStudio';

interface PracticeStudioProps {
  currentBranch: string;
  weakTopics: string[];
  onStartGeneratedExam: (questions: GateQuestion[], title: string, durationMin: number) => void;
  onAddXp: (amount: number, reason: string) => void;
}

export const PracticeStudio: React.FC<PracticeStudioProps> = ({
  currentBranch,
  weakTopics,
  onStartGeneratedExam,
  onAddXp
}) => {
  const [activeTab, setActiveTab] = useState<'pyq_bank' | 'ai_generator'>('pyq_bank');

  // PYQ Bank Filters
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});

  const toggleSolution = (id: string) => {
    setRevealedSolutions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredQuestions = INITIAL_GATE_EXAM_QUESTIONS.filter(q => {
    if (subjectFilter !== 'all' && q.subject !== subjectFilter) return false;
    if (typeFilter !== 'all' && q.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchText = q.questionText.toLowerCase().includes(query);
      const matchTopic = q.topic.toLowerCase().includes(query);
      if (!matchText && !matchTopic) return false;
    }
    return true;
  });

  const subjects = ['all', ...Array.from(new Set(INITIAL_GATE_EXAM_QUESTIONS.map(q => q.subject)))];

  const handleLaunchSingleQuestionCbt = (q: GateQuestion) => {
    onStartGeneratedExam([q], `PYQ Practice Drill: ${q.topic}`, q.marks === 1 ? 4 : 6);
  };

  const handleLaunchFilteredCbt = () => {
    if (filteredQuestions.length === 0) return;
    const estTime = Math.max(5, Math.round(filteredQuestions.length * 2.5));
    onStartGeneratedExam(
      filteredQuestions,
      `GATE Practice Sprint (${filteredQuestions.length} Questions)`,
      estTime
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-cyan-400">
              Practice &amp; Question Bank Arena
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-[11px] text-slate-400">Verified PYQs &amp; AI Generator</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white mt-1">
            Question Bank &amp; Practice Studio
          </h1>
          <p className="text-xs text-slate-400">
            Solve official previous year questions with step-by-step solutions or generate personalized weakness drills.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('pyq_bank')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'pyq_bank'
                ? 'bg-cyan-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={14} /> Verified PYQs ({INITIAL_GATE_EXAM_QUESTIONS.length})
          </button>

          <button
            onClick={() => setActiveTab('ai_generator')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'ai_generator'
                ? 'bg-cyan-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap size={14} /> AI Test Studio
          </button>
        </div>
      </div>

      {/* TAB 1: Verified PYQ Question Bank */}
      {activeTab === 'pyq_bank' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search question or topic..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Subject Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Subject:</span>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {subjects.map(s => (
                    <option key={s} value={s}>{s === 'all' ? 'All Subjects' : s}</option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">All (MCQ / MSQ / NAT)</option>
                  <option value="MCQ">MCQ</option>
                  <option value="MSQ">MSQ</option>
                  <option value="NAT">NAT (Virtual Calc)</option>
                </select>
              </div>
            </div>

            {/* Launch Filtered Set into CBT CTA */}
            {filteredQuestions.length > 0 && (
              <button
                onClick={handleLaunchFilteredCbt}
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow transition-colors shrink-0"
              >
                <Play size={13} className="fill-current" />
                Practice All {filteredQuestions.length} in CBT
              </button>
            )}
          </div>

          {/* Questions Stream */}
          <div className="space-y-4">
            {filteredQuestions.length === 0 ? (
              <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
                No questions match your current filter selection.
              </div>
            ) : (
              filteredQuestions.map((q, idx) => {
                const isRevealed = !!revealedSolutions[q.id];

                return (
                  <div
                    key={q.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-colors"
                  >
                    {/* Question Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          Q{idx + 1}
                        </span>
                        <span className="text-slate-500">·</span>
                        <span className="text-xs text-white font-semibold">{q.subject}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-xs text-slate-400">{q.topic}</span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        {q.pyqYear && (
                          <span className="bg-amber-950/60 border border-amber-800/80 text-amber-300 px-2 py-0.5 rounded">
                            GATE {q.pyqYear}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded border ${
                          q.type === 'NAT'
                            ? 'bg-purple-950/60 border-purple-800/80 text-purple-300'
                            : q.type === 'MSQ'
                            ? 'bg-blue-950/60 border-blue-800/80 text-blue-300'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}>
                          {q.type}
                        </span>
                        <span className="text-emerald-400 font-bold">{q.marks} Mark{q.marks > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Question Body */}
                    <div className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                      <MathView math={q.questionText} />
                    </div>

                    {/* Options (if MCQ/MSQ) */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-slate-300"
                          >
                            <MathView math={opt} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* NAT Notice */}
                    {q.type === 'NAT' && (
                      <div className="text-[11px] text-purple-300 bg-purple-950/30 border border-purple-900/50 p-2.5 rounded-lg">
                        Numerical Answer Type: Virtual scientific keypad calculation required without choices.
                      </div>
                    )}

                    {/* Solution Reveal Accordion */}
                    {isRevealed && (
                      <div className="bg-slate-950 border border-emerald-900/40 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 size={14} /> Correct Answer: <span className="font-mono text-white text-sm ml-1">{Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}</span>
                          </span>
                          <span className="text-[10px] text-slate-400">Verified Answer Key</span>
                        </div>

                        <div className="text-xs text-slate-300 leading-relaxed border-t border-slate-850 pt-2">
                          <MathView math={q.solution} />
                        </div>

                        {q.explanation && (
                          <p className="text-[11px] text-slate-400 border-t border-slate-850 pt-2 italic">
                            Exam Tip: {q.explanation}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Card Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => toggleSolution(q.id)}
                        className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-medium transition-colors"
                      >
                        {isRevealed ? (
                          <>
                            <EyeOff size={13} /> Hide Solution
                          </>
                        ) : (
                          <>
                            <Eye size={13} /> View Solution &amp; Answer Key
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleLaunchSingleQuestionCbt(q)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                      >
                        Solve with CBT Timer <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: AI Test Studio */}
      {activeTab === 'ai_generator' && (
        <AiTestStudio
          currentBranch={currentBranch}
          weakTopics={weakTopics}
          onStartGeneratedExam={onStartGeneratedExam}
          onAddXp={onAddXp}
        />
      )}
    </div>
  );
};
