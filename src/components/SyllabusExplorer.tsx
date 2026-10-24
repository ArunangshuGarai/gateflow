import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  Play,
  Tv,
  ChevronDown,
  ChevronRight,
  Filter,
  BarChart,
  Award,
  Layers
} from 'lucide-react';
import { SyllabusSubject, SyllabusTopic } from '../types';
import { OFFICIAL_GATE_SYLLABUS } from '../data/gateCuratedContent';

interface SyllabusExplorerProps {
  onSelectTopicForVideo: (topic: string, subject: string) => void;
  onLaunchTopicTest: (topic: string) => void;
}

export const SyllabusExplorer: React.FC<SyllabusExplorerProps> = ({
  onSelectTopicForVideo,
  onLaunchTopicTest
}) => {
  const [syllabus, setSyllabus] = useState<SyllabusSubject[]>(OFFICIAL_GATE_SYLLABUS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'General Aptitude' | 'Engineering Mathematics' | 'Core CS/IT'>('all');
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(syllabus[0]?.id || null);

  const toggleTopicStatus = (subjectId: string, topicId: string) => {
    setSyllabus(prev => prev.map(sub => {
      if (sub.id !== subjectId) return sub;
      return {
        ...sub,
        topics: sub.topics.map(t => {
          if (t.id !== topicId) return t;
          const nextStatus: SyllabusTopic['status'] =
            t.status === 'unvisited'
              ? 'in_progress'
              : t.status === 'in_progress'
              ? 'mastered'
              : 'unvisited';
          return { ...t, status: nextStatus };
        })
      };
    }));
  };

  // Compute coverage stats
  const totalTopics = syllabus.flatMap(s => s.topics);
  const masteredTopics = totalTopics.filter(t => t.status === 'mastered').length;
  const inProgressTopics = totalTopics.filter(t => t.status === 'in_progress').length;
  const completionPercentage = Math.round((masteredTopics / Math.max(1, totalTopics.length)) * 100);

  // Filter subjects and topics
  const filteredSyllabus = syllabus.filter(sub => {
    if (selectedCategory !== 'all' && sub.category !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesSubject = sub.name.toLowerCase().includes(q);
    const matchesTopic = sub.topics.some(t => t.name.toLowerCase().includes(q));
    return matchesSubject || matchesTopic;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-indigo-400">
              Official GATE 2027 Syllabus Coverage
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-[11px] text-slate-400">Computer Science &amp; Information Technology</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-white mt-1">
            Hierarchical Syllabus Tracker
          </h1>
          <p className="text-xs text-slate-400">
            Map every chapter and topic to high-yield video lectures, past year questions, and diagnostic tests.
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-4">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-mono">Total Mastery</div>
            <div className="text-base font-black font-mono text-emerald-400">
              {completionPercentage}% <span className="text-xs text-slate-500 font-normal">({masteredTopics}/{totalTopics.length})</span>
            </div>
          </div>
          <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${completionPercentage}%` }} />
          </div>
        </div>
      </div>

      {/* Controls: Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic (e.g. Semaphores, Pipelining)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          {(['all', 'Core CS/IT', 'Engineering Mathematics', 'General Aptitude'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat === 'all' ? 'All Areas' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Syllabus Tree List */}
      <div className="space-y-4">
        {filteredSyllabus.map(subject => {
          const isExpanded = expandedSubjectId === subject.id || !!searchQuery.trim();
          const subMastered = subject.topics.filter(t => t.status === 'mastered').length;
          const subPercent = Math.round((subMastered / Math.max(1, subject.topics.length)) * 100);

          return (
            <div
              key={subject.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all shadow"
            >
              {/* Subject Header */}
              <div
                onClick={() => setExpandedSubjectId(isExpanded ? null : subject.id)}
                className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-850/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-950 border border-indigo-800/80 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {subject.weightageMarks}M
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{subject.name}</h3>
                      <span className="text-[10px] font-mono text-slate-500">· {subject.category}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {subject.topics.length} Key Topics · Approx. {subject.weightageMarks} Marks in GATE
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
                    <span>{subMastered}/{subject.topics.length} Mastered</span>
                    <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${subPercent}%` }} />
                    </div>
                  </div>

                  <div className="text-slate-400 hover:text-white p-1">
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                </div>
              </div>

              {/* Topics List */}
              {isExpanded && (
                <div className="border-t border-slate-800/80 bg-slate-950/70 p-4 space-y-2">
                  {subject.topics.map(topic => (
                    <div
                      key={topic.id}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleTopicStatus(subject.id, topic.id)}
                          title="Click to toggle status: Unvisited -> In Progress -> Mastered"
                          className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                            topic.status === 'mastered'
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : topic.status === 'in_progress'
                              ? 'bg-amber-600/20 border-amber-500 text-amber-400'
                              : 'border-slate-700 bg-slate-950'
                          }`}
                        >
                          {topic.status === 'mastered' && <CheckCircle2 size={13} className="stroke-[3]" />}
                          {topic.status === 'in_progress' && <span className="h-2 w-2 rounded-full bg-amber-400" />}
                        </button>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{topic.name}</span>
                            <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                              topic.status === 'mastered'
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                : topic.status === 'in_progress'
                                ? 'bg-amber-950 text-amber-300 border-amber-800'
                                : 'bg-slate-950 text-slate-500 border-slate-800'
                            }`}>
                              {topic.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Weightage: ~{topic.weightagePercentage}% of subject · {topic.pyqCount} past PYQs
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => onSelectTopicForVideo(topic.name, subject.name)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
                        >
                          <Tv size={12} /> Lecture
                        </button>

                        <button
                          onClick={() => onLaunchTopicTest(topic.name)}
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-1"
                        >
                          <Play size={11} className="fill-current" /> Practice Test
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
