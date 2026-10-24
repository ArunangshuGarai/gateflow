import React, { useState } from 'react';
import {
  RotateCcw,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  ChevronLeft,
  Eye,
  Filter,
  AlertTriangle,
  Play,
  Copy,
  Check,
  Zap
} from 'lucide-react';
import { ErrorLogItem, FlashcardItem } from '../types';
import { DEFAULT_FLASHCARDS, INITIAL_FORMULAS } from '../data/gateCuratedContent';
import { MathView } from './MathView';
import { MistakeNotebook } from './MistakeNotebook';

interface RevisionCenterProps {
  errorLogs: ErrorLogItem[];
  onUpdateErrorLog: React.Dispatch<React.SetStateAction<ErrorLogItem[]>>;
  onLaunchPracticeQuestion: (item: ErrorLogItem) => void;
  onAddXp: (amount: number, reason: string) => void;
}

export const RevisionCenter: React.FC<RevisionCenterProps> = ({
  errorLogs,
  onUpdateErrorLog,
  onLaunchPracticeQuestion,
  onAddXp
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'flashcards' | 'mistakes' | 'formulas'>('flashcards');

  // Flashcards state
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>(DEFAULT_FLASHCARDS);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [copiedLatex, setCopiedLatex] = useState<string | null>(null);

  // Formulas state
  const [formulaSearch, setFormulaSearch] = useState('');

  const filteredCards = subjectFilter === 'all'
    ? flashcards
    : flashcards.filter(c => c.subject === subjectFilter);

  const currentCard = filteredCards[currentCardIndex] || filteredCards[0];

  const handleConfidenceRating = (boxLevel: 1 | 2 | 3 | 4) => {
    if (!currentCard) return;
    const daysToAdd = boxLevel === 1 ? 'Tomorrow' : boxLevel === 2 ? 'In 2 days' : boxLevel === 3 ? 'In 4 days' : 'In 7 days';

    setFlashcards(prev => prev.map(c => {
      if (c.id === currentCard.id) {
        return {
          ...c,
          box: boxLevel,
          nextReviewDate: daysToAdd,
          lastReviewed: 'Just now'
        };
      }
      return c;
    }));

    onAddXp(20 * boxLevel, `Spaced Recall: ${currentCard.topic}`);
    setIsFlipped(false);
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handleCopyLatex = (latex: string) => {
    navigator.clipboard.writeText(latex);
    setCopiedLatex(latex);
    setTimeout(() => setCopiedLatex(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header with Sub-tab Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-rose-400">
              Active Recall &amp; Error Remediation
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-[11px] text-slate-400">GATE 2027 Retention Engine</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white mt-1">
            Revision Center &amp; Mistake Binder
          </h1>
          <p className="text-xs text-slate-400">
            Close knowledge gaps through Leitner spaced repetition, curated KaTeX formula sheets, and systematic mistake audits.
          </p>
        </div>

        {/* Sub-tab Pill Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
          <button
            onClick={() => setActiveSubTab('flashcards')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'flashcards'
                ? 'bg-rose-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={14} /> Flashcards ({flashcards.length})
          </button>

          <button
            onClick={() => setActiveSubTab('mistakes')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'mistakes'
                ? 'bg-rose-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCcw size={14} /> Mistake Binder ({errorLogs.length})
          </button>

          <button
            onClick={() => setActiveSubTab('formulas')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeSubTab === 'formulas'
                ? 'bg-rose-600 text-white font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen size={14} /> Formula Sheets
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: Spaced Repetition Flashcards */}
      {activeSubTab === 'flashcards' && (
        <div className="space-y-6">
          {/* Controls: Subject Filter & Card Counter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Subject:</span>
              <select
                value={subjectFilter}
                onChange={(e) => {
                  setSubjectFilter(e.target.value);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="all">All Subjects</option>
                <option value="Algorithms">Algorithms</option>
                <option value="Operating Systems">Operating Systems</option>
                <option value="Computer Networks">Computer Networks</option>
                <option value="Engineering Mathematics">Engineering Mathematics</option>
                <option value="Databases (DBMS)">Databases (DBMS)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 font-mono text-slate-400">
              <span>Card {filteredCards.length > 0 ? currentCardIndex + 1 : 0} of {filteredCards.length}</span>
              <span>·</span>
              <span className="text-indigo-400">Leitner Box {currentCard?.box || 1}</span>
            </div>
          </div>

          {/* Flashcard Component */}
          {filteredCards.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
              No flashcards for this filter.
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-4">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[320px] bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-8 flex flex-col justify-between cursor-pointer transition-all shadow-xl select-none"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-rose-400 uppercase tracking-wider">
                    {currentCard.subject} · {currentCard.topic}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Eye size={12} /> {isFlipped ? 'Answer Revealed' : 'Click to Flip'}
                  </span>
                </div>

                <div className="py-6 text-center space-y-4">
                  {!isFlipped ? (
                    <div className="space-y-3">
                      <p className="text-lg md:text-xl font-bold text-white leading-relaxed">
                        {currentCard.front}
                      </p>
                      <p className="text-xs text-slate-500">
                        Recall the exact mathematical condition or formula in your head before clicking.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-indigo-300">
                        <MathView math={currentCard.backLatex} displayMode={true} />
                      </div>
                      <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
                        {currentCard.explanation}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-3">
                  <span>Last: {currentCard.lastReviewed || 'Never'}</span>
                  <span>Next: {currentCard.nextReviewDate}</span>
                </div>
              </div>

              {/* Leitner Spaced Confidence Buttons */}
              {isFlipped ? (
                <div className="space-y-2">
                  <div className="text-center text-xs text-slate-400">How well did you recall this concept?</div>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      onClick={() => handleConfidenceRating(1)}
                      className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/80 hover:bg-rose-900/60 text-rose-300 text-xs font-bold transition-colors"
                    >
                      <div>Again</div>
                      <div className="text-[10px] text-rose-400/80 font-normal">Tomorrow</div>
                    </button>

                    <button
                      onClick={() => handleConfidenceRating(2)}
                      className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/80 hover:bg-amber-900/60 text-amber-300 text-xs font-bold transition-colors"
                    >
                      <div>Hard</div>
                      <div className="text-[10px] text-amber-400/80 font-normal">In 2 days</div>
                    </button>

                    <button
                      onClick={() => handleConfidenceRating(3)}
                      className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/80 hover:bg-indigo-900/60 text-indigo-300 text-xs font-bold transition-colors"
                    >
                      <div>Good</div>
                      <div className="text-[10px] text-indigo-400/80 font-normal">In 4 days</div>
                    </button>

                    <button
                      onClick={() => handleConfidenceRating(4)}
                      className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/80 hover:bg-emerald-900/60 text-emerald-300 text-xs font-bold transition-colors"
                    >
                      <div>Easy</div>
                      <div className="text-[10px] text-emerald-400/80 font-normal">In 7 days</div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center text-xs">
                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentCardIndex(prev => Math.max(0, prev - 1));
                    }}
                    disabled={currentCardIndex === 0}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>

                  <button
                    onClick={() => setIsFlipped(true)}
                    className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow transition-colors"
                  >
                    Show Solution
                  </button>

                  <button
                    onClick={() => {
                      setIsFlipped(false);
                      setCurrentCardIndex(prev => Math.min(filteredCards.length - 1, prev + 1));
                    }}
                    disabled={currentCardIndex === filteredCards.length - 1}
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 transition-colors flex items-center gap-1"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: Mistake Notebook (Error Log Binder) */}
      {activeSubTab === 'mistakes' && (
        <MistakeNotebook
          errorLogs={errorLogs}
          onUpdateErrorLog={onUpdateErrorLog}
          onAddXp={onAddXp}
          onLaunchPracticeQuestion={onLaunchPracticeQuestion}
        />
      )}

      {/* SUB-TAB 3: Formula Quick Sheets */}
      {activeSubTab === 'formulas' && (
        <div className="space-y-4">
          <div className="max-w-md">
            <input
              type="text"
              value={formulaSearch}
              onChange={(e) => setFormulaSearch(e.target.value)}
              placeholder="Search high-yield formulas (e.g. Master Theorem, Bayes, EMAT)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INITIAL_FORMULAS
              .filter(f => !formulaSearch || f.title.toLowerCase().includes(formulaSearch.toLowerCase()) || f.category.toLowerCase().includes(formulaSearch.toLowerCase()))
              .map((formula, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{formula.title}</span>
                    <span className="text-[10px] font-mono text-slate-500">{formula.category}</span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg overflow-x-auto text-indigo-300">
                    <MathView math={formula.latex} displayMode={true} />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {formula.notes}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                    <button
                      onClick={() => handleCopyLatex(formula.latex)}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      {copiedLatex === formula.latex ? (
                        <>
                          <Check size={12} className="text-emerald-400" /> Copied LaTeX
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copy LaTeX
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
