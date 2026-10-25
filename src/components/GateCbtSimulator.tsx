import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calculator,
  FileQuestion,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Award,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { GateQuestion, QuestionStatus, UserAnswerRecord, ErrorLogItem, ErrorCategory } from '../types';
import { evaluateAnswer, calculateExamResults, ExamResultSummary } from '../utils/gateScoring';
import { FormattedMathText } from './MathView';
import { GateVirtualCalculator } from './GateVirtualCalculator';

interface GateCbtSimulatorProps {
  questions: GateQuestion[];
  examTitle: string;
  durationMinutes: number;
  onFinishExam: (results: ExamResultSummary, errors: ErrorLogItem[]) => void;
  onExitExam: () => void;
  onOpenMistakeBinder?: () => void;
}

export const GateCbtSimulator: React.FC<GateCbtSimulatorProps> = ({
  questions,
  examTitle,
  durationMinutes,
  onFinishExam,
  onExitExam,
  onOpenMistakeBinder
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeSection, setActiveSection] = useState<'General Aptitude' | 'Core Engineering'>('General Aptitude');
  const [answers, setAnswers] = useState<Record<string, UserAnswerRecord>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(durationMinutes * 60);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isQuestionPaperModalOpen, setIsQuestionPaperModalOpen] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examResults, setExamResults] = useState<ExamResultSummary | null>(null);

  // Initialize answer states
  useEffect(() => {
    const initial: Record<string, UserAnswerRecord> = {};
    questions.forEach((q, idx) => {
      initial[q.id] = {
        questionId: q.id,
        answer: null,
        status: idx === 0 ? 'not_answered' : 'not_visited',
        timeSpentSeconds: 0
      };
    });
    setAnswers(initial);
  }, [questions]);

  // Keep answers reference up to date for timer auto-submit
  const answersRef = React.useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Exam Countdown Timer
  useEffect(() => {
    if (examSubmitted) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examSubmitted]);

  // Handle auto-submission when timer expires
  useEffect(() => {
    if (timeLeftSeconds <= 0 && !examSubmitted) {
      handleSubmitExam();
    }
  }, [timeLeftSeconds, examSubmitted]);

  const currentQ = questions[currentIndex] || questions[0];
  const currentRecord = answers[currentQ?.id] || {
    questionId: currentQ?.id,
    answer: null,
    status: 'not_visited',
    timeSpentSeconds: 0
  };

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Section filtered questions
  const sectionQuestions = questions.filter(q => q.section === activeSection);

  // Handle MCQ selection
  const handleSelectMcq = (optLetter: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        answer: optLetter
      }
    }));
  };

  // Handle MSQ selection (multiple)
  const handleToggleMsq = (optLetter: string) => {
    const currentList = Array.isArray(currentRecord.answer) ? [...currentRecord.answer] : [];
    const index = currentList.indexOf(optLetter);
    if (index >= 0) {
      currentList.splice(index, 1);
    } else {
      currentList.push(optLetter);
    }
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        answer: currentList
      }
    }));
  };

  // Handle NAT input
  const handleNatKey = (char: string) => {
    const currentVal = currentRecord.answer ? String(currentRecord.answer) : '';
    let nextVal = currentVal;
    if (char === 'CLEAR') {
      nextVal = '';
    } else if (char === 'BACKSPACE') {
      nextVal = currentVal.slice(0, -1);
    } else if (char === '-' && !currentVal) {
      nextVal = '-';
    } else if (char === '.' && !currentVal.includes('.')) {
      nextVal = currentVal ? currentVal + '.' : '0.';
    } else if (/\d/.test(char)) {
      nextVal = currentVal + char;
    }

    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        answer: nextVal
      }
    }));
  };

  // Navigation actions
  const handleSaveAndNext = () => {
    const hasAnswer = currentRecord.answer !== null && currentRecord.answer !== '' &&
      !(Array.isArray(currentRecord.answer) && currentRecord.answer.length === 0);

    const newStatus: QuestionStatus = hasAnswer ? 'answered' : 'not_answered';

    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        status: newStatus
      }
    }));

    goToNextQuestion();
  };

  const handleMarkForReviewAndNext = () => {
    const hasAnswer = currentRecord.answer !== null && currentRecord.answer !== '' &&
      !(Array.isArray(currentRecord.answer) && currentRecord.answer.length === 0);

    const newStatus: QuestionStatus = hasAnswer ? 'answered_marked' : 'marked_for_review';

    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        status: newStatus
      }
    }));

    goToNextQuestion();
  };

  const handleClearResponse = () => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        answer: null,
        status: 'not_answered'
      }
    }));
  };

  const goToNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextQ = questions[nextIndex];
      setCurrentIndex(nextIndex);
      setActiveSection(nextQ.section);

      setAnswers(prev => {
        const nextRecord = prev[nextQ.id];
        if (nextRecord && nextRecord.status === 'not_visited') {
          return {
            ...prev,
            [nextQ.id]: {
              ...nextRecord,
              status: 'not_answered'
            }
          };
        }
        return prev;
      });
    }
  };

  const goToPrevQuestion = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevQ = questions[prevIndex];
      setCurrentIndex(prevIndex);
      setActiveSection(prevQ.section);
    }
  };

  const jumpToQuestion = (targetIndex: number) => {
    const targetQ = questions[targetIndex];
    if (!targetQ) return;
    setCurrentIndex(targetIndex);
    setActiveSection(targetQ.section);

    setAnswers(prev => {
      const record = prev[targetQ.id];
      if (record && record.status === 'not_visited') {
        return {
          ...prev,
          [targetQ.id]: {
            ...record,
            status: 'not_answered'
          }
        };
      }
      return prev;
    });
  };

  // Submit and evaluate
  const handleSubmitExam = () => {
    if (examSubmitted) return;
    setIsSubmitModalOpen(false);

    const currentAnswers = answersRef.current || answers;
    const errorItems: ErrorLogItem[] = [];

    const submissions = questions.map(q => {
      const rec = currentAnswers[q.id];
      const isCorrect = evaluateAnswer(q.type, rec?.answer ?? null, q.correctAnswer, q.tolerance);
      const isAttempted = rec?.answer !== null && rec?.answer !== '' &&
        !(Array.isArray(rec?.answer) && rec?.answer.length === 0);

      if (!isCorrect) {
        let cat: ErrorCategory = 'conceptual_gap';
        if (q.type === 'NAT') cat = 'calculation_calc_error';
        else if (q.questionText.includes('tautology') || q.questionText.includes('NOT') || q.questionText.includes('TRUE')) {
          cat = 'silly_reading_trap';
        } else if (q.questionText.includes('recurrence') || q.questionText.includes('formula')) {
          cat = 'formula_lapse';
        }

        errorItems.push({
          id: `err-${Date.now()}-${q.id}`,
          question: q,
          userAnswer: rec?.answer ?? null,
          timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          category: cat,
          userNotes: isAttempted
            ? `Chosen under exam conditions. Need to review boundary state and theorem nuances.`
            : 'Unattempted under timed exam conditions.',
          resolved: false
        });
      }

      return {
        questionId: q.id,
        type: q.type,
        marks: q.marks,
        userAnswer: rec?.answer ?? null,
        correctAnswer: q.correctAnswer,
        tolerance: q.tolerance,
        subject: q.subject,
        topic: q.topic
      };
    });

    const results = calculateExamResults(submissions);
    setExamResults(results);
    setExamSubmitted(true);

    // Defer notifying parent to prevent setState during render warning
    setTimeout(() => {
      onFinishExam(results, errorItems);
    }, 0);
  };

  // Palette status counts
  const counts = {
    answered: Object.values(answers).filter(a => a.status === 'answered').length,
    not_answered: Object.values(answers).filter(a => a.status === 'not_answered').length,
    not_visited: Object.values(answers).filter(a => a.status === 'not_visited').length,
    marked_for_review: Object.values(answers).filter(a => a.status === 'marked_for_review').length,
    answered_marked: Object.values(answers).filter(a => a.status === 'answered_marked').length
  };

  // Helper for question palette button colors
  const getPaletteStyle = (status: QuestionStatus) => {
    switch (status) {
      case 'answered':
        return 'bg-emerald-600 text-white font-bold border-emerald-500';
      case 'not_answered':
        return 'bg-rose-600 text-white font-bold border-rose-500';
      case 'marked_for_review':
        return 'bg-purple-600 text-white font-bold border-purple-500 rounded-full';
      case 'answered_marked':
        return 'bg-purple-600 text-white font-bold border-purple-500 relative after:content-[""] after:w-2 after:h-2 after:bg-emerald-400 after:rounded-full after:absolute after:bottom-0.5 after:right-0.5';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  // If exam has been submitted, render the comprehensive Review Screen
  if (examSubmitted && examResults) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <CheckCircle size={16} /> Examination Concluded & Evaluated
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">{examTitle}</h2>
            <p className="text-xs text-slate-400">Strict GATE Negative Marking Evaluated</p>
          </div>
          <div className="flex items-center gap-3">
            {onOpenMistakeBinder && (
              <button
                onClick={onOpenMistakeBinder}
                className="bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-md transition-colors"
              >
                <AlertTriangle size={14} className="text-rose-400" /> Open Mistake Binder
              </button>
            )}
            <button
              onClick={onExitExam}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              Return to Roadmap <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Scorecard Hero Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Marks Obtained</span>
            <div className="text-3xl font-extrabold text-emerald-400 mt-1">
              {examResults.marksObtained} <span className="text-sm text-slate-500">/ {examResults.totalMarks}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Net of negative marking</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Predicted GATE Score</span>
            <div className="text-3xl font-extrabold text-indigo-400 mt-1">
              {examResults.predictedGateScore} <span className="text-sm text-slate-500">/ 1000</span>
            </div>
            <p className="text-[10px] text-indigo-300 font-medium mt-1 truncate">{examResults.estimatedAirBand}</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Accuracy</span>
            <div className="text-3xl font-extrabold text-amber-400 mt-1">
              {examResults.accuracyPercentage}%
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {examResults.correct} Correct, {examResults.incorrect} Wrong
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Negative Marks Lost</span>
            <div className="text-3xl font-extrabold text-rose-400 mt-1">
              -{examResults.negativeMarks}
            </div>
            <p className="text-[10px] text-rose-300 mt-1">Silly errors on MCQs</p>
          </div>
        </div>

        {/* CONNECTED FEEDBACK LOOP: Weak Topics Alert */}
        {examResults.weakTopics.length > 0 && (
          <div className="bg-rose-950/30 border border-rose-900/60 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <AlertTriangle size={18} className="text-rose-400" />
              <span>Adaptive Study Engine Notice: Weak Areas Detected</span>
            </div>
            <p className="text-xs text-rose-200">
              The following topics showed low accuracy or negative hits during this test. They have been synchronized with your <strong>GATE 2027 Study Roadmap</strong> as high-priority revision missions:
            </p>
            <div className="flex flex-wrap gap-2">
              {examResults.weakTopics.map((topic, i) => (
                <span
                  key={i}
                  className="bg-rose-900/50 border border-rose-700/60 text-rose-200 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-ping" />
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Solutions & Explanations Review */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-400" /> Question-by-Question Solution & Verification
          </h3>

          <div className="space-y-3">
            {questions.map((q, idx) => {
              const rec = answers[q.id];
              const isCorrect = evaluateAnswer(q.type, rec?.answer ?? null, q.correctAnswer, q.tolerance);
              const isAttempted = rec?.answer !== null && rec?.answer !== '' &&
                !(Array.isArray(rec?.answer) && rec?.answer.length === 0);

              return (
                <div key={q.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">Question {idx + 1}</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {q.type} • {q.marks} Mark{q.marks > 1 ? 's' : ''}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-medium">
                        {q.subject} &gt; {q.topic}
                      </span>
                    </div>

                    <div>
                      {isCorrect ? (
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                          ✓ Correct (+{q.marks})
                        </span>
                      ) : isAttempted ? (
                        <span className="bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded font-bold">
                          ✗ Incorrect ({q.type === 'MCQ' ? `-${q.marks === 1 ? '0.33' : '0.67'}` : '0'})
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                          Unattempted (0)
                        </span>
                      )}
                    </div>
                  </div>

                  <FormattedMathText text={q.questionText} className="text-slate-200" />

                  {/* Options if MCQ/MSQ */}
                  {q.options && q.options.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 my-2">
                      {q.options.map((opt, oIdx) => {
                        const optLetter = opt.charAt(0);
                        const isCorrectOpt = Array.isArray(q.correctAnswer)
                          ? q.correctAnswer.includes(optLetter)
                          : q.correctAnswer === optLetter;
                        const isUserOpt = Array.isArray(rec?.answer)
                          ? rec?.answer.includes(optLetter)
                          : rec?.answer === optLetter;

                        return (
                          <div
                            key={oIdx}
                            className={`p-2 rounded border text-xs ${
                              isCorrectOpt
                                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                                : isUserOpt
                                ? 'bg-rose-950/50 border-rose-500 text-rose-200'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                          >
                            <FormattedMathText text={opt} />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Answers & Detailed Explanation */}
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2 mt-2">
                    <div className="flex flex-wrap gap-4 text-xs font-semibold">
                      <span className="text-slate-400">
                        Your Response: <strong className="text-white">{rec?.answer ? (Array.isArray(rec.answer) ? rec.answer.join(', ') : String(rec.answer)) : 'None'}</strong>
                      </span>
                      <span className="text-emerald-400">
                        Correct Answer: <strong>{Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : String(q.correctAnswer)}</strong>
                      </span>
                    </div>

                    <div className="text-slate-300 text-xs">
                      <span className="font-bold text-indigo-400 block mb-0.5">Solution:</span>
                      <FormattedMathText text={q.solution} />
                    </div>

                    {q.explanation && (
                      <div className="text-[11px] text-slate-400 italic">
                        <strong>Insight:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Active TCS iON CBT Exam Screen
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl text-slate-200 select-none">
      {/* Header bar matching official TCS iON format */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-white text-base shadow-md">
            GATE
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white tracking-wide">{examTitle}</h1>
            <p className="text-[11px] text-slate-400 font-mono">Candidate ID: GATE2027-ASPIRANT • Session: CBT Center Mock</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Virtual Scientific Calculator trigger */}
          <button
            onClick={() => setIsCalculatorOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Calculator size={14} /> Calculator
          </button>

          {/* Time Remaining */}
          <div className={`px-3 py-1.5 rounded-lg border font-mono font-bold text-xs flex items-center gap-1.5 ${
            timeLeftSeconds < 300
              ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
              : 'bg-slate-900 border-slate-700 text-amber-400'
          }`}>
            <Clock size={14} />
            <span>Time Left: {formatTimer(timeLeftSeconds)}</span>
          </div>

          {/* Question Paper summary button */}
          <button
            onClick={() => setIsQuestionPaperModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
          >
            Question Paper
          </button>
        </div>
      </div>

      {/* Section Switcher Tabs */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-2 flex items-center gap-2 text-xs">
        <span className="text-slate-500 font-semibold uppercase text-[10px] mr-2">Sections:</span>
        <button
          onClick={() => setActiveSection('General Aptitude')}
          className={`px-3 py-1 rounded font-semibold transition-colors ${
            activeSection === 'General Aptitude'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          General Aptitude ({questions.filter(q => q.section === 'General Aptitude').length})
        </button>

        <button
          onClick={() => setActiveSection('Core Engineering')}
          className={`px-3 py-1 rounded font-semibold transition-colors ${
            activeSection === 'Core Engineering'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Core Engineering ({questions.filter(q => q.section === 'Core Engineering').length})
        </button>
      </div>

      {/* Main Examination Viewport: Question on Left, Palette on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[520px]">
        {/* Left Column: Question Area */}
        <div className="lg:col-span-9 p-5 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800 space-y-4">
          <div className="space-y-4">
            {/* Question Subheader */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">Question No. {currentIndex + 1}</span>
                <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded text-[10px] font-bold">
                  {currentQ?.type}
                </span>
                {currentQ?.pyqYear && (
                  <span className="bg-slate-800 text-amber-300 px-2 py-0.5 rounded text-[10px] font-mono">
                    GATE {currentQ.pyqYear}
                  </span>
                )}
              </div>

              <div className="text-slate-400 text-xs font-mono">
                Marks for correct: <strong className="text-emerald-400">+{currentQ?.marks}</strong> | Negative: <strong className="text-rose-400">{currentQ?.type === 'MCQ' ? `-${currentQ.marks === 1 ? '0.33' : '0.67'}` : '0'}</strong>
              </div>
            </div>

            {/* Question Text */}
            <div className="text-slate-100 text-sm leading-relaxed p-2">
              <FormattedMathText text={currentQ?.questionText || ''} />
            </div>

            {/* Answer Interaction Area */}
            <div className="pt-2">
              {/* Type 1: MCQ (Single Choice Radio) */}
              {currentQ?.type === 'MCQ' && currentQ.options && (
                <div className="space-y-2">
                  {currentQ.options.map((opt, oIdx) => {
                    const optLetter = opt.charAt(0);
                    const isSelected = currentRecord.answer === optLetter;
                    return (
                      <label
                        key={oIdx}
                        onClick={() => handleSelectMcq(optLetter)}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-500 text-white'
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${currentQ.id}`}
                          checked={isSelected}
                          onChange={() => handleSelectMcq(optLetter)}
                          className="mt-1 text-indigo-600 focus:ring-0"
                        />
                        <div className="text-xs">
                          <FormattedMathText text={opt} />
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Type 2: MSQ (Multiple Select Checkboxes) */}
              {currentQ?.type === 'MSQ' && currentQ.options && (
                <div className="space-y-2">
                  <div className="text-[11px] text-amber-400 font-semibold mb-1">
                    [Multiple Select: One or more options may be correct. NO negative marking.]
                  </div>
                  {currentQ.options.map((opt, oIdx) => {
                    const optLetter = opt.charAt(0);
                    const isSelected = Array.isArray(currentRecord.answer) && currentRecord.answer.includes(optLetter);
                    return (
                      <label
                        key={oIdx}
                        onClick={() => handleToggleMsq(optLetter)}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-500 text-white'
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-850 text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleMsq(optLetter)}
                          className="mt-1 rounded text-indigo-600 focus:ring-0"
                        />
                        <div className="text-xs">
                          <FormattedMathText text={opt} />
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Type 3: NAT (Numerical Answer Type with Virtual Keypad) */}
              {currentQ?.type === 'NAT' && (
                <div className="space-y-3 max-w-sm">
                  <div className="text-[11px] text-emerald-400 font-semibold">
                    [Numerical Answer Type: Use virtual keypad below. NO negative marking.]
                  </div>
                  <div className="bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-center font-mono text-lg font-bold text-white tracking-widest min-h-[44px]">
                    {currentRecord.answer !== null && currentRecord.answer !== '' ? String(currentRecord.answer) : '—'}
                  </div>

                  {/* Virtual Numerical Keypad */}
                  <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                    {['7', '8', '9', 'BACKSPACE', '4', '5', '6', 'CLEAR', '1', '2', '3', '-', '0', '.'].map((key) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleNatKey(key)}
                        className={`py-2 rounded font-bold border transition-colors ${
                          key === 'BACKSPACE' || key === 'CLEAR'
                            ? 'bg-rose-950 text-rose-300 border-rose-800 text-[10px]'
                            : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                        }`}
                      >
                        {key === 'BACKSPACE' ? 'Bksp' : key === 'CLEAR' ? 'Clear' : key}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAndNext}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors"
              >
                Save &amp; Next
              </button>

              <button
                onClick={handleClearResponse}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs px-3 py-2 rounded-lg transition-colors"
              >
                Clear Response
              </button>

              <button
                onClick={handleMarkForReviewAndNext}
                className="bg-purple-700 hover:bg-purple-600 text-white text-xs px-3 py-2 rounded-lg transition-colors"
              >
                Mark for Review &amp; Next
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevQuestion}
                disabled={currentIndex === 0}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs px-3 py-2 rounded-lg transition-colors disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                onClick={goToNextQuestion}
                disabled={currentIndex === questions.length - 1}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs px-3 py-2 rounded-lg transition-colors disabled:opacity-40 flex items-center gap-1"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Question Palette Panel */}
        <div className="lg:col-span-3 bg-slate-900/60 p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="h-5 w-5 rounded bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  {counts.answered}
                </span>
                <span>Answered</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="h-5 w-5 rounded bg-rose-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  {counts.not_answered}
                </span>
                <span>Not Answered</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="h-5 w-5 rounded bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                  {counts.not_visited}
                </span>
                <span>Not Visited</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                  {counts.marked_for_review}
                </span>
                <span>Marked for Review</span>
              </div>

              <div className="col-span-2 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded bg-purple-600 text-white font-bold relative after:content-[''] after:w-1.5 after:h-1.5 after:bg-emerald-400 after:rounded-full after:absolute after:bottom-0.5 after:right-0.5 flex items-center justify-center text-[10px] shrink-0">
                  {counts.answered_marked}
                </span>
                <span>Answered &amp; Marked for Review (Evaluated)</span>
              </div>
            </div>

            {/* Questions Grid Palette */}
            <div>
              <div className="text-xs font-bold text-white mb-2">
                Section: {activeSection}
              </div>
              <div className="grid grid-cols-5 gap-2 max-h-56 overflow-y-auto pr-1">
                {questions.map((q, idx) => {
                  const rec = answers[q.id] || { status: 'not_visited' };
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => jumpToQuestion(idx)}
                      className={`h-8 w-8 rounded text-xs font-bold border transition-all flex items-center justify-center ${
                        getPaletteStyle(rec.status)
                      } ${isCurrent ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-900 scale-105' : ''}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit Exam Button */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs py-2.5 rounded-lg shadow-lg transition-transform active:scale-95"
            >
              Submit Examination
            </button>
          </div>
        </div>
      </div>

      {/* Official Virtual Scientific Calculator Modal */}
      <GateVirtualCalculator
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Confirmation Modal for Exam Submission */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-base font-bold text-white">Confirm Exam Submission</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to conclude the exam? Once submitted, your answers will be finalized and evaluated against the GATE 2027 marking scheme.
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div>Total Questions: <strong>{questions.length}</strong></div>
              <div>Answered: <strong className="text-emerald-400">{counts.answered + counts.answered_marked}</strong></div>
              <div>Not Answered: <strong className="text-rose-400">{counts.not_answered}</strong></div>
              <div>Marked for Review: <strong className="text-purple-400">{counts.marked_for_review}</strong></div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded-lg font-medium"
              >
                Return to Exam
              </button>
              <button
                onClick={handleSubmitExam}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-md"
              >
                Yes, Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Paper View Modal */}
      {isQuestionPaperModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl space-y-4 text-slate-100 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white">Full Question Paper Overview</h3>
              <button
                onClick={() => setIsQuestionPaperModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="grow overflow-y-auto space-y-4 pr-1 text-xs">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-300">
                    <span>Q{idx + 1} ({q.type} - {q.marks} Mark{q.marks > 1 ? 's' : ''})</span>
                    <span className="text-indigo-400 font-normal">{q.subject}</span>
                  </div>
                  <FormattedMathText text={q.questionText} className="text-slate-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
