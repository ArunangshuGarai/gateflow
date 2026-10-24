import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  Tag,
  Filter,
  Check,
  Zap,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { ErrorLogItem, ErrorCategory, QuestionType } from '../types';
import { FormattedMathText } from './MathView';
import { evaluateAnswer } from '../utils/gateScoring';

interface MistakeNotebookProps {
  errorLogs: ErrorLogItem[];
  onUpdateErrorLog: (updated: ErrorLogItem[]) => void;
  onAddXp: (amount: number, reason: string) => void;
  onLaunchPracticeQuestion: (item: ErrorLogItem) => void;
}

export const MistakeNotebook: React.FC<MistakeNotebookProps> = ({
  errorLogs,
  onUpdateErrorLog,
  onAddXp,
  onLaunchPracticeQuestion
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'unresolved' | 'resolved'>('unresolved');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNoteText, setTempNoteText] = useState('');

  // Retry state for inline question practice
  const [practicingId, setPracticingId] = useState<string | null>(null);
  const [practiceAnswer, setPracticeAnswer] = useState<string | string[] | number | null>(null);
  const [practiceFeedback, setPracticeFeedback] = useState<{ isCorrect: boolean; show: boolean } | null>(null);

  const filteredLogs = errorLogs.filter(item => {
    const matchesResolved = activeTab === 'resolved' ? item.resolved : !item.resolved;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesResolved && matchesCategory;
  });

  const getCategoryBadge = (cat: ErrorCategory) => {
    switch (cat) {
      case 'conceptual_gap':
        return <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[10px] px-2 py-0.5 rounded font-bold">Conceptual Gap</span>;
      case 'formula_lapse':
        return <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] px-2 py-0.5 rounded font-bold">Formula Lapse</span>;
      case 'calculation_calc_error':
        return <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] px-2 py-0.5 rounded font-bold">Calculation Slip</span>;
      case 'silly_reading_trap':
        return <span className="bg-purple-950 text-purple-300 border border-purple-800 text-[10px] px-2 py-0.5 rounded font-bold">Question Reading Trap</span>;
      default:
        return null;
    }
  };

  const handleUpdateCategory = (id: string, newCat: ErrorCategory) => {
    const updated = errorLogs.map(item => item.id === id ? { ...item, category: newCat } : item);
    onUpdateErrorLog(updated);
  };

  const handleSaveNote = (id: string) => {
    const updated = errorLogs.map(item => item.id === id ? { ...item, userNotes: tempNoteText } : item);
    onUpdateErrorLog(updated);
    setEditingNoteId(null);
  };

  const handleToggleResolve = (id: string) => {
    const updated = errorLogs.map(item => {
      if (item.id === id) {
        const nextState = !item.resolved;
        if (nextState) {
          onAddXp(40, 'Eliminated Weakness from Mistake Notebook');
        }
        return { ...item, resolved: nextState };
      }
      return item;
    });
    onUpdateErrorLog(updated);
  };

  const handleStartPractice = (item: ErrorLogItem) => {
    setPracticingId(item.id);
    setPracticeAnswer(null);
    setPracticeFeedback(null);
  };

  const handleVerifyPractice = (item: ErrorLogItem) => {
    const isCorrect = evaluateAnswer(item.question.type, practiceAnswer, item.question.correctAnswer, item.question.tolerance);
    setPracticeFeedback({ isCorrect, show: true });
    if (isCorrect) {
      onAddXp(50, `Successfully Re-solved ${item.question.topic}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400">
            <AlertTriangle size={14} />
            GATE 2027 Mistake Notebook (Error Log Binder)
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">Audit Every Lost Mark &amp; Re-Solve</h2>
          <p className="text-xs text-slate-400">
            Top rankers in GATE maintain an uncompromising error log. Analyze root causes so you never repeat a single error on exam day.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Pending Traps: </span>
            <strong className="text-rose-400">{errorLogs.filter(e => !e.resolved).length}</strong>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Mastered: </span>
            <strong className="text-emerald-400">{errorLogs.filter(e => e.resolved).length}</strong>
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('unresolved')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'unresolved'
                ? 'bg-rose-950 text-rose-300 border border-rose-800 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            Active Weaknesses ({errorLogs.filter(e => !e.resolved).length})
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'resolved'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            Resolved &amp; Mastered ({errorLogs.filter(e => e.resolved).length})
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <Filter size={13} className="text-slate-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1 text-xs"
          >
            <option value="all">All Error Types</option>
            <option value="conceptual_gap">Conceptual Gap</option>
            <option value="formula_lapse">Formula Lapse</option>
            <option value="calculation_calc_error">Calculation / Virtual Calc Slip</option>
            <option value="silly_reading_trap">Question Reading Trap</option>
          </select>
        </div>
      </div>

      {/* Error Items List */}
      {filteredLogs.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="text-sm font-bold text-white">
            {activeTab === 'unresolved' ? 'No Active Mistakes Pending!' : 'No Resolved Mistakes Yet'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeTab === 'unresolved'
              ? 'Every mistake from your CBT tests has been audited and resolved. Take a Full Mock or AI Test to test yourself further!'
              : 'When you re-attempt and master questions from your mistake binder, they will appear here as conquered trophies.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLogs.map((item) => (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-xl p-5 space-y-4 transition-all ${
                item.resolved ? 'border-slate-800 opacity-80' : 'border-rose-900/60 shadow-md'
              }`}
            >
              {/* Top Meta Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-200">{item.question.subject}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-indigo-400">{item.question.topic}</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                    {item.question.type} • {item.question.marks}M
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {getCategoryBadge(item.category)}
                  <select
                    value={item.category}
                    onChange={(e) => handleUpdateCategory(item.id, e.target.value as ErrorCategory)}
                    className="bg-slate-950 border border-slate-800 text-slate-400 text-[10px] rounded px-1.5 py-0.5"
                    title="Change error classification"
                  >
                    <option value="conceptual_gap">Conceptual Gap</option>
                    <option value="formula_lapse">Formula Lapse</option>
                    <option value="calculation_calc_error">Calculation Slip</option>
                    <option value="silly_reading_trap">Reading Trap</option>
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-slate-200 text-xs leading-relaxed">
                <FormattedMathText text={item.question.questionText} />
              </div>

              {/* Options if MCQ/MSQ */}
              {item.question.options && item.question.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {item.question.options.map((opt, oIdx) => {
                    const optLetter = opt.charAt(0);
                    const isCorrect = Array.isArray(item.question.correctAnswer)
                      ? item.question.correctAnswer.includes(optLetter)
                      : item.question.correctAnswer === optLetter;
                    const isUserPick = Array.isArray(item.userAnswer)
                      ? item.userAnswer.includes(optLetter)
                      : item.userAnswer === optLetter;

                    return (
                      <div
                        key={oIdx}
                        className={`p-2 rounded border text-xs ${
                          isCorrect
                            ? 'bg-emerald-950/50 border-emerald-500/80 text-emerald-200'
                            : isUserPick
                            ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <FormattedMathText text={opt} />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Answer comparison */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Your Test Response</span>
                  <strong className="text-rose-400">
                    {item.userAnswer !== null ? (Array.isArray(item.userAnswer) ? item.userAnswer.join(', ') : String(item.userAnswer)) : 'Unattempted'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Official Answer</span>
                  <strong className="text-emerald-400">
                    {Array.isArray(item.question.correctAnswer) ? item.question.correctAnswer.join(', ') : String(item.question.correctAnswer)}
                  </strong>
                </div>
              </div>

              {/* Solution breakdown */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                <span className="text-indigo-400 font-bold block">Why this is the solution:</span>
                <FormattedMathText text={item.question.solution} className="text-slate-300" />
              </div>

              {/* Aspirant's Reflection Note */}
              <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                    <BookOpen size={13} className="text-amber-400" /> Candidate Reflection &amp; Lesson Learned
                  </span>
                  {editingNoteId !== item.id && (
                    <button
                      onClick={() => {
                        setEditingNoteId(item.id);
                        setTempNoteText(item.userNotes || '');
                      }}
                      className="text-[11px] text-indigo-400 hover:underline"
                    >
                      {item.userNotes ? 'Edit Lesson' : '+ Add Lesson Note'}
                    </button>
                  )}
                </div>

                {editingNoteId === item.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={tempNoteText}
                      onChange={(e) => setTempNoteText(e.target.value)}
                      placeholder="e.g. Remember to check if graph has negative edges before assuming Dijkstra holds..."
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white h-16"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingNoteId(null)}
                        className="bg-slate-800 text-slate-300 text-[11px] px-2.5 py-1 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveNote(item.id)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-3 py-1 rounded"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-300 italic text-[11px]">
                    {item.userNotes ? `"${item.userNotes}"` : 'No reflection note saved yet. Document the trick to retain it!'}
                  </p>
                )}
              </div>

              {/* Interactive Retry Mode right here! */}
              {practicingId === item.id ? (
                <div className="bg-indigo-950/30 border border-indigo-800/60 rounded-xl p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between font-bold text-white">
                    <span>Re-Attempting Question Now:</span>
                    <button
                      onClick={() => setPracticingId(null)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>

                  {item.question.type === 'MCQ' && item.question.options && (
                    <div className="grid grid-cols-2 gap-2">
                      {item.question.options.map((opt, idx) => {
                        const optLetter = opt.charAt(0);
                        return (
                          <button
                            key={idx}
                            onClick={() => setPracticeAnswer(optLetter)}
                            className={`p-2 rounded border text-left text-xs transition-colors ${
                              practiceAnswer === optLetter
                                ? 'bg-indigo-600 text-white font-bold border-indigo-500'
                                : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <FormattedMathText text={opt} />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {item.question.type === 'NAT' && (
                    <div className="flex items-center gap-2 max-w-xs">
                      <input
                        type="text"
                        value={practiceAnswer ? String(practiceAnswer) : ''}
                        onChange={(e) => setPracticeAnswer(e.target.value)}
                        placeholder="Type numerical answer..."
                        className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white w-full"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleVerifyPractice(item)}
                      disabled={practiceAnswer === null || practiceAnswer === ''}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded disabled:opacity-50"
                    >
                      Verify Answer
                    </button>

                    {practiceFeedback?.show && (
                      <span className={`font-bold ${practiceFeedback.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {practiceFeedback.isCorrect ? '✓ Correctly Solved! (+50 XP)' : '✗ Still incorrect. Review the theorem derivation.'}
                      </span>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Bottom Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartPractice(item)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <RotateCcw size={13} /> Re-Solve This Question
                  </button>
                </div>

                <button
                  onClick={() => handleToggleResolve(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    item.resolved
                      ? 'bg-slate-800 text-slate-400 hover:text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  }`}
                >
                  <Check size={14} />
                  <span>{item.resolved ? 'Mark Unresolved' : 'Mark Conquered & Resolved'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
