/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { YoutubeCockpit } from './components/YoutubeCockpit';
import { GateCbtSimulator } from './components/GateCbtSimulator';
import { AdaptiveRoadmapView } from './components/AdaptiveRoadmapView';
import { PracticeStudio } from './components/PracticeStudio';
import { RevisionCenter } from './components/RevisionCenter';
import { AnalyticsView } from './components/AnalyticsView';
import { SyllabusExplorer } from './components/SyllabusExplorer';
import { FormulaVault } from './components/FormulaVault';
import { DeepWorkFocusHub } from './components/DeepWorkFocusHub';
import { RewardModal } from './components/RewardModal';
import { AuthModal } from './components/AuthModal';
import { ResetStatsModal } from './components/ResetStatsModal';
import {
  GateQuestion,
  NotificationItem,
  ErrorLogItem,
  MockExamPreset,
  DailyTaskItem
} from './types';
import {
  INITIAL_GATE_EXAM_QUESTIONS,
  MOTIVATIONAL_QUOTES,
  MOCK_EXAM_PRESETS,
  DEFAULT_DAILY_TASKS,
  CURATED_GATE_VIDEOS
} from './data/gateCuratedContent';
import {
  StudyPlanState,
  generateInitialRoadmap,
  injectExamFeedbackIntoRoadmap,
  calculateLevel
} from './utils/roadmapEngine';
import { ExamResultSummary } from './utils/gateScoring';
import {
  Sparkles,
  X,
  Play,
  Clock,
  Award,
  Layers,
  Sliders,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  auth,
  testConnection,
  signInAsGuest,
  signInWithGoogle,
  signOutUser,
  syncUserProfileToCloud,
  loadUserProfileFromCloud,
  syncErrorLogToCloud,
  loadErrorLogsFromCloud,
  syncExamResultToCloud,
  syncCustomFormulaToCloud,
  loadCustomFormulasFromCloud,
  resetUserCloudData
} from './services/firebase';

const STORAGE_KEY = 'gateforge_2027_state_v2';

export default function App() {
  // Firebase Cloud Database State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('syncing');

  // Multi-user Auth & Reset Stats Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isResetStatsModalOpen, setIsResetStatsModalOpen] = useState(false);

  // Navigation tab: 'dashboard' | 'planner' | 'learn' | 'practice' | 'exams' | 'revision' | 'analytics' | 'syllabus' | 'vault' | 'focus'
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedLearnVideoId, setSelectedLearnVideoId] = useState<string>('vid-os-srtf');

  // Study Plan and Adaptive Roadmap State
  const [planState, setPlanState] = useState<StudyPlanState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.planState && parsed.planState.phases) {
          const freshPhases = generateInitialRoadmap(parsed.planState.profile?.branch || 'CS');
          const mergedPhases = freshPhases.map((freshPhase, pIdx) => {
            const savedPhase = parsed.planState.phases[pIdx] || freshPhase;
            return {
              ...savedPhase,
              nodes: freshPhase.nodes.map((freshNode, nIdx) => {
                const savedNode = savedPhase.nodes?.[nIdx] || freshNode;
                const nodeSubtopics = (savedNode.subtopics && savedNode.subtopics.length > 0) 
                  ? savedNode.subtopics 
                  : (freshNode.subtopics || []);
                return {
                  ...freshNode,
                  ...savedNode,
                  subtopics: nodeSubtopics,
                  manualCheckouts: savedNode.manualCheckouts || freshNode.manualCheckouts || {}
                };
              })
            };
          });
          return {
            ...parsed.planState,
            phases: mergedPhases
          };
        }
      }
    } catch (e) {}

    return {
      profile: {
        targetExamYear: 2027,
        branch: 'CS',
        gapYears: 2,
        dailyHours: 6,
        targetRankBand: 'AIR < 100',
        currentStreak: 5,
        totalHoursStudied: 38.5,
        xpPoints: 680,
        level: 'Consistent Warrior'
      },
      phases: generateInitialRoadmap('CS'),
      urgentRevisionQueue: [
        {
          topic: 'Process Synchronization, Semaphores & Deadlocks',
          subject: 'Operating Systems',
          identifiedAt: 'Yesterday',
          reason: 'Diagnosed from diagnostic test: missed bounded waiting and semaphores condition.',
          recommendedAction: 'Watch Amit Khurana IPC masterclass and take a 5-question re-test.'
        }
      ]
    };
  });

  // Daily 4-Step Checklist State
  const [dailyTasks, setDailyTasks] = useState<DailyTaskItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.dailyTasks && parsed.dailyTasks.length > 0) return parsed.dailyTasks;
      }
    } catch (e) {}
    return DEFAULT_DAILY_TASKS;
  });

  // Custom Formulas added by user
  const [customFormulas, setCustomFormulas] = useState<
    { title: string; category: string; latex: string; notes: string }[]
  >(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.customFormulas) return parsed.customFormulas;
      }
    } catch (e) {}
    return [];
  });

  // Mistake Notebook (Error Log Binder) State
  const [errorLogs, setErrorLogs] = useState<ErrorLogItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.errorLogs && parsed.errorLogs.length > 0) return parsed.errorLogs;
      }
    } catch (e) {}

    return [
      {
        id: 'err-seed-1',
        question: INITIAL_GATE_EXAM_QUESTIONS[5], // OS Synchronization
        userAnswer: 'A',
        timestamp: 'Yesterday, 19:45',
        category: 'conceptual_gap',
        userNotes: 'Confused mutex mutual exclusion with bounded waiting requirement. Review peterson algorithm strict turn variable behavior.',
        resolved: false
      },
      {
        id: 'err-seed-2',
        question: INITIAL_GATE_EXAM_QUESTIONS[7], // Computer Networks subnet calculation NAT
        userAnswer: '1024',
        timestamp: '2 days ago, 14:20',
        category: 'calculation_calc_error',
        userNotes: 'Forgot to subtract 2 for network address and directed broadcast in /22 subnet. 2^(32-22) - 2 = 1022 usable host addresses.',
        resolved: true
      }
    ];
  });

  // CBT Exam Arena Filter & Configuration State
  const [examCategoryFilter, setExamCategoryFilter] = useState<string>('all');
  const [configModalPreset, setConfigModalPreset] = useState<MockExamPreset | null>(null);
  const [selectedSectionPart, setSelectedSectionPart] = useState<'all' | 'Core Engineering' | 'General Aptitude' | 'rapid_half'>('all');
  const [customTimeMultiplier, setCustomTimeMultiplier] = useState<number>(1.0); // 1.0 = standard, 0.75 = speed drill

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Urgent Weakness Alert',
      message: 'Process Synchronization was flagged with negative hits. Urgent revision slot created on roadmap.',
      timeAgo: '1h ago',
      type: 'urgent',
      read: false,
      actionRoute: 'revision'
    },
    {
      id: 'notif-2',
      title: 'Daily Motivational Push',
      message: 'A 2-year gap is not a disadvantage — it is your fuel. You know the value of time better than anyone!',
      timeAgo: '3h ago',
      type: 'motivational',
      read: false
    }
  ]);

  // Active Exam Simulator State
  const [activeExam, setActiveExam] = useState<{
    questions: GateQuestion[];
    title: string;
    durationMin: number;
  } | null>(null);

  // Celebratory Reward Modal
  const [rewardModal, setRewardModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    xpGained: number;
  }>({
    isOpen: false,
    title: '',
    message: '',
    xpGained: 0
  });

  // Floating Motivation Popups
  const [motivationToast, setMotivationToast] = useState<string | null>(
    'You are close, just a bit! Keep the intensity blazing.'
  );

  // Periodically rotate motivational messages
  useEffect(() => {
    const timer = setInterval(() => {
      const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      setMotivationToast(randomQuote);
    }, 50000);
    return () => clearInterval(timer);
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          planState,
          dailyTasks,
          customFormulas,
          errorLogs
        })
      );
    } catch (e) {}
  }, [planState, dailyTasks, customFormulas, errorLogs]);

  // Firebase Auth initialization and cloud restore
  useEffect(() => {
    testConnection().then(ok => {
      if (!ok) setCloudSyncStatus('offline');
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setCloudSyncStatus('syncing');
        try {
          const cloudProfile = await loadUserProfileFromCloud(user.uid);
          if (cloudProfile && cloudProfile.profile) {
            setPlanState(prev => ({
              ...prev,
              profile: {
                ...prev.profile,
                ...cloudProfile.profile
              }
            }));
          }
          const cloudErrors = await loadErrorLogsFromCloud(user.uid);
          if (cloudErrors && cloudErrors.length > 0) {
            setErrorLogs(prev => {
              const existingIds = new Set(prev.map(e => e.id));
              const merged = [...prev];
              cloudErrors.forEach(ce => {
                if (!existingIds.has(ce.id)) merged.push(ce);
              });
              return merged;
            });
          }
          const cloudFormulas = await loadCustomFormulasFromCloud(user.uid);
          if (cloudFormulas && cloudFormulas.length > 0) {
            setCustomFormulas(prev => {
              const titles = new Set(prev.map(p => p.title));
              const merged = [...prev];
              cloudFormulas.forEach(cf => {
                if (!titles.has(cf.title)) merged.push(cf);
              });
              return merged;
            });
          }
          setCloudSyncStatus('synced');
        } catch (err) {
          console.warn('Cloud sync initialization warning:', err);
          setCloudSyncStatus('synced');
        }
      } else {
        // Automatically authenticate candidate as guest for seamless cloud persistence
        signInAsGuest().then(u => {
          if (u) setCurrentUser(u);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Debounced auto-sync of roadmap metrics to Firestore
  useEffect(() => {
    if (!currentUser || currentUser.isAnonymous || !auth.currentUser) {
      setCloudSyncStatus('synced');
      return;
    }
    setCloudSyncStatus('syncing');
    const timer = setTimeout(async () => {
      try {
        await syncUserProfileToCloud(currentUser.uid, planState);
        setCloudSyncStatus('synced');
      } catch (e) {
        console.warn('Firestore profile sync note:', e);
        setCloudSyncStatus('synced');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [currentUser, planState]);

  // XP addition helper
  const handleAddXp = (amount: number, reason: string) => {
    const newXp = planState.profile.xpPoints + amount;
    setPlanState(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        xpPoints: newXp,
        level: calculateLevel(newXp)
      }
    }));
  };

  const handleAddStudyHours = (hours: number) => {
    setPlanState(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        totalHoursStudied: Math.round((prev.profile.totalHoursStudied + hours) * 10) / 10
      }
    }));
  };

  const handleToggleDailyTask = (taskId: string) => {
    setDailyTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextState = !t.completed;
        if (nextState) {
          handleAddXp(t.xpReward, `Completed daily blueprint task: ${t.title}`);
        }
        return { ...t, completed: nextState };
      }
      return t;
    }));
  };

  // 1. Launch Full Mock Examination (Authentic 3-Hour TCS iON Simulator)
  const handleLaunchFullMock = () => {
    setActiveExam({
      questions: INITIAL_GATE_EXAM_QUESTIONS,
      title: 'GATE 2027 Official 3-Hour Grand Mock Paper (65 Qs)',
      durationMin: 180
    });
    setCurrentTab('exams');
  };

  // Handle Application-wide Stats Reset (0 Stats Fresh Slate)
  const handleResetComplete = async (freshState: StudyPlanState) => {
    setPlanState(freshState);
    setErrorLogs([]);
    setDailyTasks(prev => prev.map(t => ({ ...t, completed: false })));
    setCustomFormulas([]);
    if (currentUser && !currentUser.isAnonymous && auth.currentUser) {
      try {
        await resetUserCloudData(currentUser.uid);
      } catch (e) {
        console.warn('Cloud reset warning:', e);
      }
    }
    setMotivationToast('Application progress reset to 0 stats. Ready for a fresh start!');
  };

  // Handle Application-wide Stats Calibration (Custom baseline numbers)
  const handleCalibrateComplete = async (updatedState: StudyPlanState) => {
    setPlanState(updatedState);
    if (currentUser && !currentUser.isAnonymous && auth.currentUser) {
      try {
        await syncUserProfileToCloud(currentUser.uid, updatedState);
      } catch (e) {
        console.warn('Cloud calibration sync warning:', e);
      }
    }
    setMotivationToast(`Application metrics updated: ${updatedState.profile.dailyHours}h/day, target: ${updatedState.profile.targetRankBand}.`);
  };

  // 2. Launch Specific Preset or Configured Part
  const handleLaunchPreset = (
    preset: MockExamPreset,
    part: 'all' | 'Core Engineering' | 'General Aptitude' | 'rapid_half' = 'all',
    timeMultiplier = 1.0
  ) => {
    let questions = preset.questions;
    let titleSuffix = '';

    if (part === 'Core Engineering') {
      const filtered = preset.questions.filter(q => q.section === 'Core Engineering');
      if (filtered.length > 0) questions = filtered;
      titleSuffix = ' [Core Engineering Section]';
    } else if (part === 'General Aptitude') {
      const filtered = preset.questions.filter(q => q.section === 'General Aptitude');
      if (filtered.length > 0) questions = filtered;
      titleSuffix = ' [General Aptitude Section]';
    } else if (part === 'rapid_half') {
      questions = preset.questions.slice(0, Math.max(3, Math.ceil(preset.questions.length / 2)));
      titleSuffix = ' [Rapid Sprint Part]';
    }

    const calculatedDuration = Math.max(
      5,
      Math.round(preset.durationMinutes * (questions.length / preset.questions.length) * timeMultiplier)
    );

    setActiveExam({
      questions,
      title: `${preset.title}${titleSuffix}`,
      durationMin: calculatedDuration
    });
    setConfigModalPreset(null);
    setCurrentTab('exams');
  };

  // 3. Launch Quick Video Quiz
  const handleLaunchQuickQuiz = (topic: string, count: number) => {
    const subset = INITIAL_GATE_EXAM_QUESTIONS.filter(
      q => q.topic.toLowerCase().includes(topic.toLowerCase()) || q.subject.toLowerCase().includes(topic.toLowerCase())
    );
    const questionsToUse = subset.length > 0 ? subset : INITIAL_GATE_EXAM_QUESTIONS.slice(0, count);

    setActiveExam({
      questions: questionsToUse,
      title: `GATE Retention Sprint: ${topic}`,
      durationMin: 12
    });
    setCurrentTab('exams');
  };

  // 4. Launch AI-Generated Exam
  const handleStartGeneratedExam = (questions: GateQuestion[], title: string, durationMin: number) => {
    setActiveExam({
      questions,
      title,
      durationMin
    });
    setCurrentTab('exams');
  };

  // 5. Handle Exam Finish
  const handleExamCompleted = (results: ExamResultSummary, errorItems: ErrorLogItem[]) => {
    // 1. Inject feedback into roadmap
    const updatedPlan = injectExamFeedbackIntoRoadmap(
      planState,
      results.weakTopics,
      results.topicBreakdown
    );
    setPlanState(updatedPlan);

    // 2. Append new errors to Mistake Notebook
    if (errorItems && errorItems.length > 0) {
      setErrorLogs(prev => {
        const existingIds = new Set(prev.map(e => e.question.id));
        const newUnique = errorItems.filter(e => !existingIds.has(e.question.id));
        return [...newUnique, ...prev];
      });
    }

    // 3. Add notification if weak topics found
    if (results.weakTopics.length > 0) {
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Exam Analysis: ${results.weakTopics.length} Weak Areas Detected`,
        message: `Scores on ${results.weakTopics.join(', ')} were low. ${errorItems.length} questions logged in Mistake Notebook. Urgent revision scheduled on roadmap.`,
        timeAgo: 'Just now',
        type: 'urgent',
        read: false,
        actionRoute: 'revision'
      };
      setNotifications(prev => [newNotif, ...prev]);
    }

    // 4. Trigger reward popup with encouragement
    let quote = 'Outstanding commitment. Every mistake audited today is a mark protected on exam day!';
    if (results.accuracyPercentage >= 80) {
      quote = 'Phenomenal precision! Top 100 rank discipline in full display!';
    } else if (results.negativeMarks > 1) {
      quote = 'You are close, just a bit! Keep refining negative marking discipline on tricky MCQs.';
    }

    setRewardModal({
      isOpen: true,
      title: `Exam Evaluated: ${results.marksObtained} Marks (Score: ${results.predictedGateScore})`,
      message: quote,
      xpGained: 150 + results.correct * 20
    });
  };

  // Connect Topic to YouTube Cockpit
  const handleSelectTopicForVideo = (topic: string, subject: string) => {
    const matching = CURATED_GATE_VIDEOS.find(
      v => v.topic.toLowerCase().includes(topic.toLowerCase()) || 
           v.title.toLowerCase().includes(topic.toLowerCase()) ||
           v.subject.toLowerCase().includes(subject.toLowerCase())
    );
    if (matching) {
      setSelectedLearnVideoId(matching.id);
    }
    setCurrentTab('learn');
    setMotivationToast(`Opening high-yield lecture for ${topic}. Take notes and test immediately!`);
  };

  // Connect Topic to Topic Test
  const handleLaunchTopicTest = (topic: string) => {
    handleLaunchQuickQuiz(topic, 4);
  };

  const filteredPresets = MOCK_EXAM_PRESETS.filter(p => {
    if (examCategoryFilter === 'all') return true;
    return p.category === examCategoryFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Cockpit Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'exams' && tab !== 'cbt') setActiveExam(null);
        }}
        streakDays={planState.profile.currentStreak}
        xpPoints={planState.profile.xpPoints}
        userLevel={planState.profile.level}
        notifications={notifications}
        onMarkNotificationRead={(id) => {
          setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        }}
        onLaunchFullMock={handleLaunchFullMock}
        unresolvedMistakesCount={errorLogs.filter(e => !e.resolved).length}
        currentUser={currentUser}
        cloudSyncStatus={cloudSyncStatus}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenResetStatsModal={() => setIsResetStatsModalOpen(true)}
        onSignOut={async () => {
          await signOutUser();
          setMotivationToast('Signed out. Data preserved in Firestore.');
        }}
      />

      {/* Floating Motivational Banner */}
      {motivationToast && (
        <aside aria-label="Motivational Affirmation" className="bg-gradient-to-r from-indigo-950/90 via-slate-900/90 to-emerald-950/90 border-b border-indigo-900/50 px-4 py-2 text-xs flex items-center justify-between gap-3 text-slate-200">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <Sparkles size={14} className="text-amber-400 shrink-0 animate-pulse" />
            <span className="font-medium">
              <strong className="text-amber-300">Daily Comeback Affirmation:</strong> &ldquo;{motivationToast}&rdquo;
            </span>
          </div>
          <button
            onClick={() => setMotivationToast(null)}
            className="text-slate-400 hover:text-white text-xs p-1"
            aria-label="Dismiss motivation banner"
          >
            <X size={13} />
          </button>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="grow max-w-7xl w-full mx-auto p-4 md:p-6">
        {/* Tab 1: Dashboard (Daily Command Center) */}
        {currentTab === 'dashboard' && (
          <DashboardView
            planState={planState}
            dailyTasks={dailyTasks}
            onToggleTask={handleToggleDailyTask}
            onNavigateTab={setCurrentTab}
            onSelectTopicForVideo={handleSelectTopicForVideo}
            onLaunchTopicTest={handleLaunchTopicTest}
            onLaunchFullMock={handleLaunchFullMock}
            errorLogs={errorLogs}
            onAddXp={handleAddXp}
            onOpenResetStatsModal={() => setIsResetStatsModalOpen(true)}
          />
        )}

        {/* Tab 2: Study Planner & Adaptive Roadmap */}
        {(currentTab === 'planner' || currentTab === 'roadmap') && (
          <AdaptiveRoadmapView
            planState={planState}
            onUpdatePlan={setPlanState}
            onSelectTopicForVideo={handleSelectTopicForVideo}
            onLaunchTopicTest={handleLaunchTopicTest}
            onAddXp={handleAddXp}
            onOpenResetStatsModal={() => setIsResetStatsModalOpen(true)}
          />
        )}

        {/* Tab 3: Learn Workspace (YouTube Cockpit + Notes) */}
        {(currentTab === 'learn' || currentTab === 'youtube') && (
          <YoutubeCockpit
            initialVideoId={selectedLearnVideoId}
            onLaunchQuickQuiz={handleLaunchQuickQuiz}
            onSaveNoteToVault={(note) => {
              setCustomFormulas(prev => [note, ...prev]);
              handleAddXp(25, 'Saved Formula to Vault');
              setMotivationToast(`Saved "${note.title}" to Formula Vault!`);
            }}
            onAddXp={handleAddXp}
          />
        )}

        {/* Tab 4: Practice Bank & AI Studio */}
        {(currentTab === 'practice' || currentTab === 'ai_test') && (
          <PracticeStudio
            currentBranch={planState.profile.branch}
            weakTopics={planState.urgentRevisionQueue.map(q => q.topic)}
            onStartGeneratedExam={handleStartGeneratedExam}
            onAddXp={handleAddXp}
          />
        )}

        {/* Tab 5: TCS iON GATE CBT Exam Simulator & Arena */}
        {(currentTab === 'exams' || currentTab === 'cbt') && (
          <div className="space-y-6">
            {activeExam ? (
              <GateCbtSimulator
                questions={activeExam.questions}
                examTitle={activeExam.title}
                durationMinutes={activeExam.durationMin}
                onFinishExam={handleExamCompleted}
                onExitExam={() => {
                  setActiveExam(null);
                  setCurrentTab('dashboard');
                }}
                onOpenMistakeBinder={() => {
                  setActiveExam(null);
                  setCurrentTab('revision');
                }}
              />
            ) : (
              <div className="space-y-6">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                      <Award size={15} /> Authentic TCS iON Exam Center
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      Model Question Papers &amp; Official PYQs
                    </h2>
                    <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                      Practice under strict GATE exam hall conditions: official TCS iON layout, countdown clock, on-screen Virtual Scientific Calculator, and negative marking penalty (-0.33 / -0.67 on MCQs, 0 on MSQ/NAT). Appear the entire paper or configure a specific section.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleLaunchFullMock}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                    >
                      <Play size={14} className="fill-current" /> Instant Full Mock
                    </button>
                    <button
                      onClick={() => setCurrentTab('practice')}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                    >
                      <Sparkles size={14} /> AI Test Studio
                    </button>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'all', label: 'All Exam Papers' },
                      { id: '3-Hour Full Mock', label: '3-Hour Full Mocks (180m)' },
                      { id: 'Sectional Mock', label: 'Sectional Mocks (90m)' },
                      { id: '30-Min Revision Mock', label: 'Revision Mocks (30m)' },
                      { id: '15-Min Rapid Sprint', label: 'Rapid Sprints (15m)' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setExamCategoryFilter(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          examCategoryFilter === tab.id
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs font-mono text-slate-400">
                    Showing {filteredPresets.length} available papers
                  </span>
                </div>

                {/* Exam Preset Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPresets.map(preset => (
                    <div
                      key={preset.id}
                      className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-lg group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                            preset.category === '3-Hour Full Mock'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : preset.category === 'Sectional Mock'
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                              : preset.category === '30-Min Revision Mock'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-rose-950 text-rose-300 border-rose-800'
                          }`}>
                            {preset.category}
                          </span>

                          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock size={12} className="text-slate-500" /> {preset.durationMinutes} min
                            </span>
                            <span>•</span>
                            <span>{preset.questionCount} Questions</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-bold">{preset.totalMarks} Marks</span>
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {preset.title}
                        </h3>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {preset.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            setConfigModalPreset(preset);
                            setSelectedSectionPart('all');
                            setCustomTimeMultiplier(1.0);
                          }}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 py-1.5 px-2 rounded hover:bg-slate-800 transition-colors"
                        >
                          <Sliders size={13} /> Configure Part / Time
                        </button>

                        <button
                          onClick={() => handleLaunchPreset(preset, 'all', 1.0)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 shadow transition-colors"
                        >
                          <Play size={13} className="fill-current" /> Appear Full Paper
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 6: Revision Center & Mistake Binder */}
        {(currentTab === 'revision' || currentTab === 'mistakes') && (
          <RevisionCenter
            errorLogs={errorLogs}
            onUpdateErrorLog={setErrorLogs}
            onAddXp={handleAddXp}
            onLaunchPracticeQuestion={(item) => {
              setActiveExam({
                questions: [item.question],
                title: `Mistake Re-Test: ${item.question.topic}`,
                durationMin: 5
              });
              setCurrentTab('exams');
            }}
          />
        )}

        {/* Tab 7: Analytics & Subject Mastery */}
        {currentTab === 'analytics' && (
          <AnalyticsView
            planState={planState}
            onNavigateTab={setCurrentTab}
            onLaunchTopicTest={handleLaunchTopicTest}
          />
        )}

        {/* Tab 8: Official Syllabus Coverage Explorer */}
        {currentTab === 'syllabus' && (
          <SyllabusExplorer
            onSelectTopicForVideo={handleSelectTopicForVideo}
            onLaunchTopicTest={handleLaunchTopicTest}
          />
        )}

        {/* Tab 9: KaTeX Formula Vault */}
        {currentTab === 'vault' && (
          <FormulaVault
            customNotes={customFormulas}
            onAddCustomFormula={(f) => {
              setCustomFormulas(prev => [f, ...prev]);
              handleAddXp(20, 'Added Formula to Vault');
            }}
          />
        )}

        {/* Tab 10: Deep Work Focus Hub */}
        {currentTab === 'focus' && (
          <DeepWorkFocusHub
            onAddStudyHours={handleAddStudyHours}
            onAddXp={handleAddXp}
          />
        )}
      </main>

      {/* Configurable Paper Modal */}
      {configModalPreset && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Configure Examination</span>
                <h3 className="text-base font-bold text-white">{configModalPreset.title}</h3>
              </div>
              <button
                onClick={() => setConfigModalPreset(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scope / Part Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Choose Exam Scope:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedSectionPart('all')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    selectedSectionPart === 'all'
                      ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="block text-white">Entire Paper</span>
                  <span className="text-[10px] text-slate-400">All {configModalPreset.questionCount} Questions</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSectionPart('Core Engineering')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    selectedSectionPart === 'Core Engineering'
                      ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="block text-white">Core Engineering Only</span>
                  <span className="text-[10px] text-slate-400">Technical Subject Questions</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSectionPart('General Aptitude')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    selectedSectionPart === 'General Aptitude'
                      ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="block text-white">General Aptitude Only</span>
                  <span className="text-[10px] text-slate-400">Quant, Logic &amp; Verbal</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedSectionPart('rapid_half')}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    selectedSectionPart === 'rapid_half'
                      ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="block text-white">Rapid Half Sprint</span>
                  <span className="text-[10px] text-slate-400">First {Math.ceil(configModalPreset.questionCount / 2)} Questions</span>
                </button>
              </div>
            </div>

            {/* Time Pace Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Time Condition:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { mult: 1.0, label: 'Standard Timed', desc: 'Exact TCS pace' },
                  { mult: 0.75, label: 'Speed Sprint', desc: '-25% time' },
                  { mult: 1.25, label: 'Relaxed Deep', desc: '+25% time' }
                ].map(p => (
                  <button
                    key={p.mult}
                    type="button"
                    onClick={() => setCustomTimeMultiplier(p.mult)}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      customTimeMultiplier === p.mult
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="block font-bold">{p.label}</span>
                    <span className="text-[10px] text-slate-500">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setConfigModalPreset(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleLaunchPreset(configModalPreset, selectedSectionPart, customTimeMultiplier)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2 rounded-lg flex items-center gap-1.5 shadow-lg transition-colors"
              >
                <Play size={13} className="fill-current" /> Enter Exam Hall
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebratory Reward Modal */}
      <RewardModal
        isOpen={rewardModal.isOpen}
        onClose={() => setRewardModal(prev => ({ ...prev, isOpen: false }))}
        title={rewardModal.title}
        message={rewardModal.message}
        xpGained={rewardModal.xpGained}
        streakCount={planState.profile.currentStreak}
      />

      {/* Multi-User Authentication Modal (Google Account, Email/Password & Email OTP) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setMotivationToast(`Welcome, ${user.displayName || user.email || 'Candidate'}! Progress synced with Firestore cloud database.`);
        }}
      />

      {/* Reset & Calibrate Progress Modal (Zero State or Custom Baseline) */}
      <ResetStatsModal
        isOpen={isResetStatsModalOpen}
        onClose={() => setIsResetStatsModalOpen(false)}
        planState={planState}
        onResetComplete={handleResetComplete}
        onCalibrateComplete={handleCalibrateComplete}
      />
    </div>
  );
}
