import React, { useState } from 'react';
import {
  Compass,
  AlertCircle,
  CheckCircle,
  Lock,
  Play,
  RotateCcw,
  Sliders,
  Flame,
  Award,
  Zap,
  ChevronRight,
  BookOpen,
  Calendar,
  Clock,
  ArrowUpRight,
  Check
} from 'lucide-react';
import { StudyPlanState, RoadmapNode, RoadmapPhase, generateInitialRoadmap } from '../utils/roadmapEngine';

interface AdaptiveRoadmapViewProps {
  planState: StudyPlanState;
  onUpdatePlan: (updatedPlan: StudyPlanState) => void;
  onSelectTopicForVideo: (topic: string, subject: string) => void;
  onLaunchTopicTest: (topic: string) => void;
  onAddXp: (amount: number, reason: string) => void;
  onOpenResetStatsModal?: () => void;
}

export const AdaptiveRoadmapView: React.FC<AdaptiveRoadmapViewProps> = ({
  planState,
  onUpdatePlan,
  onSelectTopicForVideo,
  onLaunchTopicTest,
  onAddXp,
  onOpenResetStatsModal
}) => {
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Config form state
  const [targetBranch, setTargetBranch] = useState(planState.profile.branch);
  const [dailyHours, setDailyHours] = useState(planState.profile.dailyHours);
  const [targetRank, setTargetRank] = useState(planState.profile.targetRankBand);

  const handleSaveConfig = () => {
    const updated: StudyPlanState = {
      ...planState,
      profile: {
        ...planState.profile,
        branch: targetBranch,
        dailyHours: dailyHours,
        targetRankBand: targetRank
      }
    };
    onUpdatePlan(updated);
    setIsConfigModalOpen(false);
    onAddXp(25, 'Calibrated GATE 2027 Study Strategy');
  };

  // Helper to ensure every node has its complete syllabus subtopics
  const getSubtopicsForNode = (node: RoadmapNode): string[] => {
    if (node.subtopics && node.subtopics.length > 0) {
      return node.subtopics;
    }
    const defaultPhases = generateInitialRoadmap(planState.profile.branch || 'CS');
    for (const ph of defaultPhases) {
      const match = ph.nodes.find(n => n.id === node.id || n.topic === node.topic);
      if (match && match.subtopics && match.subtopics.length > 0) {
        return match.subtopics;
      }
    }
    return [
      'Core Theoretical Framework & Definitions',
      'Standard Formulas, Bounds & Time Complexities',
      'GATE Standard Solved Problems (1-Mark & 2-Mark)',
      'Previous 15-Year PYQ Pattern Breakdown',
      'Common Traps, Edge Cases & Speed Shortcuts'
    ];
  };

  // Toggle individual subtopic manual checkout
  const handleToggleSubtopic = (nodeId: string, subtopic: string) => {
    let nextNodeState: RoadmapNode | null = null;
    let gainedXp = 0;

    const updatedPhases = planState.phases.map(phase => ({
      ...phase,
      nodes: phase.nodes.map(n => {
        if (n.id === nodeId) {
          const nodeSubtopics = getSubtopicsForNode(n);
          const currentCheckouts = { ...(n.manualCheckouts || {}) };
          const willBeChecked = !currentCheckouts[subtopic];
          currentCheckouts[subtopic] = willBeChecked;

          const totalSubtopics = nodeSubtopics.length || 1;
          const checkedCount = Object.values(currentCheckouts).filter(Boolean).length;
          const newMastery = Math.min(100, Math.round((checkedCount / totalSubtopics) * 100));

          let newStatus: RoadmapNode['status'] = n.status;
          if (newMastery === 100) {
            newStatus = 'completed';
          } else if (newMastery > 0) {
            newStatus = 'in_progress';
          }

          if (willBeChecked) {
            gainedXp = 15;
          }

          const updatedNode: RoadmapNode = {
            ...n,
            subtopics: nodeSubtopics,
            manualCheckouts: currentCheckouts,
            masteryPercentage: newMastery,
            status: newStatus
          };

          nextNodeState = updatedNode;
          return updatedNode;
        }
        return n;
      })
    }));

    onUpdatePlan({
      ...planState,
      phases: updatedPhases
    });

    if (gainedXp > 0) {
      onAddXp(gainedXp, `Manual Checkout: ${subtopic}`);
    }

    if (nextNodeState && selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(nextNodeState);
    }
  };

  const handleMarkNodeComplete = (nodeId: string) => {
    let completedNode: RoadmapNode | null = null;
    const updatedPhases = planState.phases.map(phase => ({
      ...phase,
      nodes: phase.nodes.map(n => {
        if (n.id === nodeId) {
          const nodeSubtopics = getSubtopicsForNode(n);
          const allChecked: { [k: string]: boolean } = {};
          nodeSubtopics.forEach(sub => {
            allChecked[sub] = true;
          });

          const nodeCompleted: RoadmapNode = {
            ...n,
            subtopics: nodeSubtopics,
            status: 'completed',
            masteryPercentage: 100,
            manualCheckouts: allChecked
          };
          completedNode = nodeCompleted;
          return nodeCompleted;
        }
        return n;
      })
    }));

    onUpdatePlan({
      ...planState,
      phases: updatedPhases
    });
    onAddXp(100, `Completed Milestone: ${selectedNode?.topic || 'Topic'}`);
    if (completedNode && selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(completedNode);
    }
  };

  const handleResolveUrgentItem = (topic: string) => {
    const updatedQueue = planState.urgentRevisionQueue.filter(q => q.topic !== topic);
    onUpdatePlan({
      ...planState,
      urgentRevisionQueue: updatedQueue
    });
    onAddXp(50, `Cleared Weakness Item: ${topic}`);
  };

  // Node status helper
  const getNodeBadge = (status: RoadmapNode['status']) => {
    switch (status) {
      case 'completed':
        return <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">Mastered</span>;
      case 'urgent_priority':
        return <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[10px] px-2 py-0.5 rounded font-bold animate-pulse">Critical Weakness</span>;
      case 'needs_revision':
        return <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] px-2 py-0.5 rounded font-bold">Needs Revision</span>;
      case 'in_progress':
        return <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] px-2 py-0.5 rounded font-bold">Active Sprint</span>;
      default:
        return <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded">Locked</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Connected Strategy & Profile Status */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <Compass size={14} />
            Adaptive GATE 2027 Comeback Strategy Engine
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Targeting {planState.profile.targetRankBand} • Branch: {planState.profile.branch}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Paced for: <strong>{planState.profile.dailyHours} Hours/Day</strong> • Comeback Gap: <strong>{planState.profile.gapYears} Years</strong> • Dynamic syllabus subtopic checkouts active
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenResetStatsModal && (
            <button
              onClick={onOpenResetStatsModal}
              className="bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-900/50 hover:border-rose-700 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Reset progress to 0 or calibrate baseline numbers"
            >
              <RotateCcw size={14} className="text-rose-400" /> Reset / Calibrate Stats
            </button>
          )}

          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Sliders size={14} /> Strategy Settings
          </button>
        </div>
      </div>

      {/* CONNECTED FEEDBACK LOOP: Urgent Priority Weakness Queue */}
      {planState.urgentRevisionQueue.length > 0 && (
        <div className="bg-rose-950/30 border border-rose-900/60 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <AlertCircle size={18} className="text-rose-400 animate-pulse" />
              <span>Priority Revision Queue ({planState.urgentRevisionQueue.length} Urgent Weaknesses from Exam Tests)</span>
            </div>
            <span className="text-[10px] text-rose-400 uppercase font-mono tracking-wider">Exam Loop Feedback</span>
          </div>

          <p className="text-xs text-rose-200/90 leading-relaxed">
            Your recent exam attempts revealed vulnerabilities in these topics. Study them in the YouTube Cockpit and take a diagnostic test to remove the red alert!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {planState.urgentRevisionQueue.map((item, idx) => (
              <div key={idx} className="bg-slate-950/90 border border-rose-800/60 rounded-xl p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm">{item.topic}</span>
                  <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[10px] px-2 py-0.5 rounded font-mono">
                    {item.subject}
                  </span>
                </div>

                <div className="text-slate-300 text-xs">
                  <span className="text-rose-400 font-semibold block mb-0.5">Diagnosed Reason:</span>
                  {item.reason}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectTopicForVideo(item.topic, item.subject)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-2.5 py-1 rounded flex items-center gap-1 font-semibold transition-colors"
                    >
                      <Play size={12} /> Watch Lecture
                    </button>

                    <button
                      onClick={() => onLaunchTopicTest(item.topic)}
                      className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-2.5 py-1 rounded flex items-center gap-1 font-semibold transition-colors"
                    >
                      <Zap size={12} /> Test Again
                    </button>
                  </div>

                  <button
                    onClick={() => handleResolveUrgentItem(item.topic)}
                    className="text-[11px] text-slate-400 hover:text-white underline"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Roadmap Phases Timeline */}
      <div className="space-y-6">
        {planState.phases.map((phase) => (
          <div key={phase.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-400 uppercase">
                  <span>Phase {phase.id}</span> • <span>{phase.timeframe}</span>
                </div>
                <h3 className="text-base font-extrabold text-white mt-0.5">{phase.title}</h3>
                <p className="text-xs text-slate-400">{phase.subtitle}</p>
              </div>

              <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-emerald-400 font-mono">
                Target: {phase.targetObjective}
              </div>
            </div>

            {/* Nodes in Phase */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {phase.nodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;
                const nodeSubtopics = getSubtopicsForNode(node);
                const checkedCount = Object.values(node.manualCheckouts || {}).filter(Boolean).length;
                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/50 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                        : node.status === 'urgent_priority'
                        ? 'bg-rose-950/20 border-rose-800 hover:border-rose-600'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-slate-400">{node.subject}</span>
                      {getNodeBadge(node.status)}
                    </div>

                    <h4 className="font-bold text-white text-xs mb-2 leading-snug">{node.topic}</h4>

                    {/* Mastery Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Mastery</span>
                        <span className="font-mono font-bold text-slate-200">{node.masteryPercentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            node.status === 'urgent_priority'
                              ? 'bg-rose-500'
                              : node.masteryPercentage >= 80
                              ? 'bg-emerald-500'
                              : 'bg-indigo-500'
                          }`}
                          style={{ width: `${node.masteryPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono text-[10px] text-slate-400">
                        {checkedCount}/{nodeSubtopics.length} subtopics
                      </span>
                      <span className="text-indigo-400 font-medium flex items-center gap-0.5">
                        Details <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected Node Drawer / Detail View */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl space-y-4 text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-semibold text-indigo-400 uppercase">{selectedNode.subject}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedNode.topic}</h3>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 px-2 py-1 rounded"
              >
                Close
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Status:</span>
                <div>{getNodeBadge(selectedNode.status)}</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Mastery Level:</span>
                <span className="font-mono font-bold text-emerald-400">{selectedNode.masteryPercentage}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Estimated Effort:</span>
                <span className="text-slate-200">{selectedNode.estimatedHours} hours (including revision)</span>
              </div>
            </div>

            {/* Subtopics Detailed Manual Checklist (Independent of video progress) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Syllabus Subtopics &amp; Manual Checkout</span>
                  <span className="text-[10px] text-slate-400">
                    Track completion manually (independent of video timeline progress)
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#A3E635] bg-[#A3E635]/10 border border-[#A3E635]/20 px-2 py-0.5 rounded">
                  {Object.values(selectedNode.manualCheckouts || {}).filter(Boolean).length} / {getSubtopicsForNode(selectedNode).length} Checked
                </span>
              </div>

              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-2.5 space-y-1.5 max-h-52 overflow-y-auto">
                {getSubtopicsForNode(selectedNode).map((subtopic, sIdx) => {
                  const isChecked = !!selectedNode.manualCheckouts?.[subtopic];
                  return (
                    <div
                      key={sIdx}
                      onClick={() => handleToggleSubtopic(selectedNode.id, subtopic)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                        isChecked
                          ? 'bg-[#142318] border-emerald-600/50 text-white'
                          : 'bg-[#111318] border-slate-800/80 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div
                          className={`h-4 w-4 rounded flex items-center justify-center shrink-0 border transition-colors ${
                            isChecked
                              ? 'bg-[#A3E635] border-[#A3E635] text-slate-950 font-black'
                              : 'border-slate-600 bg-slate-900'
                          }`}
                        >
                          {isChecked && <Check size={11} className="stroke-[3]" />}
                        </div>
                        <span className={`text-xs ${isChecked ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                          {subtopic}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#A3E635] shrink-0 font-semibold">
                        {isChecked ? '+15 XP' : 'Click to checkout'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedNode.suggestedVideos.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300">Recommended Core Video:</span>
                {selectedNode.suggestedVideos.map((vid, idx) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-white">{vid.title}</p>
                      <p className="text-[10px] text-slate-400">{vid.durationMin} minutes</p>
                    </div>
                    <button
                      onClick={() => {
                        onSelectTopicForVideo(selectedNode.topic, selectedNode.subject);
                        setSelectedNode(null);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-2.5 py-1 rounded font-medium flex items-center gap-1"
                    >
                      <Play size={11} /> Open
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  onLaunchTopicTest(selectedNode.topic);
                  setSelectedNode(null);
                }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md"
              >
                <Zap size={14} /> Take Topic Diagnostic Test
              </button>

              <button
                onClick={() => handleMarkNodeComplete(selectedNode.id)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-lg border border-slate-700 flex items-center gap-1"
              >
                <CheckCircle size={14} className="text-emerald-400" /> Mark All Mastered (+100 XP)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Strategy Configuration Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders size={16} className="text-indigo-400" /> Calibrate GATE 2027 Schedule & Parameters
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Engineering Branch:</label>
                <select
                  value={targetBranch}
                  onChange={(e) => setTargetBranch(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="CS">Computer Science & Information Technology (CS)</option>
                  <option value="DA">Data Science & Artificial Intelligence (DA)</option>
                  <option value="EC">Electronics & Communication Engineering (EC)</option>
                  <option value="EE">Electrical Engineering (EE)</option>
                  <option value="ME">Mechanical Engineering (ME)</option>
                  <option value="CE">Civil Engineering (CE)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Daily Study Intensity Hours:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[4, 6, 8, 10].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setDailyHours(hrs)}
                      className={`p-2 rounded-lg border font-mono font-bold text-xs ${
                        dailyHours === hrs
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {hrs}h / day
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target GATE Score & Rank Band:</label>
                <select
                  value={targetRank}
                  onChange={(e) => setTargetRank(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="AIR 1 - 50 (Dream IISc / IIT Bombay)">AIR 1 - 50 (IISc Bangalore & IIT Bombay)</option>
                  <option value="AIR 50 - 250 (Top IITs & PSUs)">AIR 50 - 250 (Top 5 IITs & Navratna PSUs)</option>
                  <option value="AIR 250 - 800 (Top NITs & New IITs)">AIR 250 - 800 (Top NITs & Newer IITs)</option>
                  <option value="AIR 800 - 2500 (Qualifying & M.Tech Admissions)">AIR 800 - 2500 (Qualifying & Good M.Tech)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="bg-slate-800 text-slate-300 text-xs px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfig}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-md"
              >
                Save &amp; Adapt Roadmap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
