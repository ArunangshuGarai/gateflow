import React, { useState } from 'react';
import { Sparkles, BrainCircuit, Play, Layers, Target, ShieldCheck, Flame } from 'lucide-react';
import { GateQuestion } from '../types';

interface AiTestStudioProps {
  currentBranch: string;
  weakTopics: string[];
  onStartGeneratedExam: (questions: GateQuestion[], title: string, durationMin: number) => void;
  onAddXp: (amount: number, reason: string) => void;
}

export const AiTestStudio: React.FC<AiTestStudioProps> = ({
  currentBranch,
  weakTopics,
  onStartGeneratedExam,
  onAddXp
}) => {
  const [topic, setTopic] = useState(weakTopics[0] || 'Recurrence Relations & Master Theorem');
  const [questionCount, setQuestionCount] = useState<number>(4);
  const [difficulty, setDifficulty] = useState<string>('GATE_Standard');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAndStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/gemini/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          branch: currentBranch,
          count: questionCount,
          difficulty
        })
      });

      const data = await res.json();
      if (data.success && data.data && data.data.questions) {
        const testData = data.data;
        const gateQuestions: GateQuestion[] = testData.questions.map((q: any, idx: number) => ({
          id: q.id || `gen-${idx + 1}`,
          section: idx < 2 ? 'General Aptitude' : 'Core Engineering',
          type: q.type || 'MCQ',
          marks: q.marks || (idx % 2 === 0 ? 1 : 2),
          subject: currentBranch,
          topic: topic,
          questionText: q.text,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          tolerance: q.tolerance,
          solution: q.solution || 'Standard analytical derivation.',
          explanation: q.explanation || 'GATE 2027 standard difficulty question.'
        }));

        onAddXp(50, `Generated AI Custom Test: ${topic}`);
        onStartGeneratedExam(
          gateQuestions,
          testData.testTitle || `AI Diagnostic Sprint: ${topic}`,
          testData.durationMinutes || questionCount * 3
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1">
          <BrainCircuit size={16} />
          AI Test Studio &amp; Custom Exam Generator
        </div>
        <h2 className="text-xl font-extrabold text-white">Generate Tailored GATE Mock Sprint</h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Create realistic GATE computer-based questions (MCQ, MSQ, and NAT) tailored to your exact branch, target difficulty, or weakness areas identified in past exams.
        </p>

        {weakTopics.length > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 space-y-2 text-xs">
            <span className="font-bold text-rose-300 block">
              🎯 Quick Drill Weak Topics (Diagnosed from Recent Tests):
            </span>
            <div className="flex flex-wrap gap-2">
              {weakTopics.map((w, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTopic(w)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors border ${
                    topic === w
                      ? 'bg-rose-600 text-white border-rose-500 font-bold'
                      : 'bg-slate-900 text-rose-200 border-rose-800/80 hover:bg-rose-950'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleGenerateAndStart} className="mt-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Test Topic or Concept Area:
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Process Synchronization, Eigenvalues, TCP Congestion Control, SQL Normalization..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Number of Questions:</label>
              <div className="grid grid-cols-4 gap-2">
                {[4, 8, 12, 16].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`py-2 rounded-lg border font-mono font-bold text-xs ${
                      questionCount === cnt
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cnt} Questions
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Difficulty &amp; Target Depth:</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white h-9"
              >
                <option value="GATE_Standard">Standard GATE 2027 Level (Balanced)</option>
                <option value="Rank_Booster_Tricky">Rank Booster (High Trick Potential &amp; Edge Cases)</option>
                <option value="Foundational_Speed">Foundational Speed Drill (Quick Formula Application)</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <ShieldCheck size={14} className="text-emerald-400" />
              Includes authentic distribution:
            </div>
            <p>• Multiple Choice Questions (MCQ) with -1/3 or -2/3 negative deduction.</p>
            <p>• Multiple Select Questions (MSQ) with 0 negative deduction.</p>
            <p>• Numerical Answer Type (NAT) with virtual keypad precision.</p>
          </div>

          <button
            type="submit"
            disabled={isGenerating || !topic.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Architecting Realistic GATE Test with AI...</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Generate Test &amp; Launch in TCS iON CBT Simulator</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
