/**
 * Adaptive GATE 2027 Roadmap & Study Engine
 * Dynamically binds exam results to study modules and urgent revision queues.
 */

export interface RoadmapNode {
  id: string;
  phaseId: number;
  subject: string;
  topic: string;
  estimatedHours: number;
  status: 'locked' | 'in_progress' | 'completed' | 'needs_revision' | 'urgent_priority';
  masteryPercentage: number;
  suggestedVideos: { title: string; youtubeUrl: string; durationMin: number }[];
  lastTestedDate?: string;
  targetTestScore?: number;
  notesSummary?: string;
}

export interface RoadmapPhase {
  id: number;
  title: string;
  subtitle: string;
  timeframe: string;
  targetObjective: string;
  nodes: RoadmapNode[];
}

export interface UserStudyProfile {
  targetExamYear: number; // 2027
  branch: 'CS' | 'DA' | 'EC' | 'EE' | 'ME' | 'CE';
  gapYears: number; // 2 years
  dailyHours: number; // e.g. 6
  targetRankBand: string; // e.g. "AIR < 100"
  currentStreak: number;
  totalHoursStudied: number;
  xpPoints: number;
  level: string;
}

export interface StudyPlanState {
  profile: UserStudyProfile;
  phases: RoadmapPhase[];
  urgentRevisionQueue: {
    topic: string;
    subject: string;
    identifiedAt: string;
    reason: string;
    recommendedAction: string;
    recommendedVideoUrl?: string;
  }[];
}

/**
 * Creates default curated high-yield syllabus nodes for chosen branch
 */
export function generateInitialRoadmap(branch: 'CS' | 'DA' | 'EC' | 'EE' | 'ME' | 'CE'): RoadmapPhase[] {
  if (branch === 'CS') {
    return [
      {
        id: 1,
        title: 'Phase 1: High-Yield Foundation & Comeback Recovery',
        subtitle: 'Re-ignite core foundations after 2 years gap with high ROI subjects',
        timeframe: 'Month 1 - Month 3',
        targetObjective: 'Score 30+ marks guaranteed in General Aptitude & Discrete Math & C/DS',
        nodes: [
          {
            id: 'cs-ga-1',
            phaseId: 1,
            subject: 'General Aptitude',
            topic: 'Quantitative & Analytical Aptitude',
            estimatedHours: 25,
            status: 'completed',
            masteryPercentage: 85,
            suggestedVideos: [
              { title: 'GATE General Aptitude Masterclass', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', durationMin: 45 }
            ]
          },
          {
            id: 'cs-dm-1',
            phaseId: 1,
            subject: 'Discrete Mathematics',
            topic: 'Propositional & First-Order Logic',
            estimatedHours: 20,
            status: 'in_progress',
            masteryPercentage: 65,
            suggestedVideos: [
              { title: 'Propositional Logic Rules & Truth Tables for GATE', youtubeUrl: 'https://www.youtube.com/watch?v=e_04ZrNroTo', durationMin: 50 }
            ]
          },
          {
            id: 'cs-ds-1',
            phaseId: 1,
            subject: 'Data Structures',
            topic: 'Arrays, Stacks, Queues, Binary Trees & Heaps',
            estimatedHours: 35,
            status: 'in_progress',
            masteryPercentage: 70,
            suggestedVideos: [
              { title: 'Binary Trees & Traversals Complete GATE Theory', youtubeUrl: 'https://www.youtube.com/watch?v=9gm8hM84524', durationMin: 60 }
            ]
          },
          {
            id: 'cs-algo-1',
            phaseId: 1,
            subject: 'Algorithms',
            topic: 'Asymptotic Analysis & Recurrences (Master Theorem)',
            estimatedHours: 25,
            status: 'in_progress',
            masteryPercentage: 55,
            suggestedVideos: [
              { title: 'Master Theorem & Recurrence Relations with PYQs', youtubeUrl: 'https://www.youtube.com/watch?v=e_04ZrNroTo', durationMin: 40 }
            ]
          }
        ]
      },
      {
        id: 2,
        title: 'Phase 2: Core Engineering Systems Mastery',
        subtitle: 'Heavy weightage subjects: OS, DBMS, TOC, Computer Networks',
        timeframe: 'Month 4 - Month 7',
        targetObjective: 'Master deep conceptual problems in Process Sync, SQL/Transactions, RegEx & Subnetting',
        nodes: [
          {
            id: 'cs-os-1',
            phaseId: 2,
            subject: 'Operating Systems',
            topic: 'Process Synchronization, Semaphores & Deadlocks',
            estimatedHours: 30,
            status: 'in_progress',
            masteryPercentage: 45,
            suggestedVideos: [
              { title: 'Producer-Consumer, Dining Philosophers & Semaphores', youtubeUrl: 'https://www.youtube.com/watch?v=9gm8hM84524', durationMin: 55 }
            ]
          },
          {
            id: 'cs-dbms-1',
            phaseId: 2,
            subject: 'Databases (DBMS)',
            topic: 'Transactions, Concurrency Control & Serializability',
            estimatedHours: 28,
            status: 'locked',
            masteryPercentage: 30,
            suggestedVideos: [
              { title: 'Conflict & View Serializability GATE In-Depth', youtubeUrl: 'https://www.youtube.com/watch?v=e_04ZrNroTo', durationMin: 45 }
            ]
          },
          {
            id: 'cs-toc-1',
            phaseId: 2,
            subject: 'Theory of Computation',
            topic: 'Regular Expressions, DFA Minimization & Decidability',
            estimatedHours: 32,
            status: 'locked',
            masteryPercentage: 20,
            suggestedVideos: [
              { title: 'Decidability & Halting Problem Masterclass', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', durationMin: 50 }
            ]
          },
          {
            id: 'cs-cn-1',
            phaseId: 2,
            subject: 'Computer Networks',
            topic: 'IPv4 Subnetting, TCP Sliding Window & Flow Control',
            estimatedHours: 30,
            status: 'locked',
            masteryPercentage: 15,
            suggestedVideos: [
              { title: 'TCP Flow & Congestion Control Numerical Practice', youtubeUrl: 'https://www.youtube.com/watch?v=9gm8hM84524', durationMin: 65 }
            ]
          }
        ]
      },
      {
        id: 3,
        title: 'Phase 3: 35-Year PYQs & Multi-Subject Synthesis',
        subtitle: 'Solve tricky MSQ questions, edge-case NATs, and combined subject papers',
        timeframe: 'Month 8 - Month 10',
        targetObjective: 'Elevate problem solving speed to 2.5 min/question with 85%+ accuracy',
        nodes: [
          {
            id: 'cs-pyq-1',
            phaseId: 3,
            subject: 'PYQ Marathon',
            topic: 'GATE 2015-2025 Past Year Question Deep Dives',
            estimatedHours: 60,
            status: 'locked',
            masteryPercentage: 0,
            suggestedVideos: []
          },
          {
            id: 'cs-msq-1',
            phaseId: 3,
            subject: 'MSQ Drill',
            topic: 'High Probability Multi-Select Question Tactics',
            estimatedHours: 40,
            status: 'locked',
            masteryPercentage: 0,
            suggestedVideos: []
          }
        ]
      },
      {
        id: 4,
        title: 'Phase 4: Full CBT Mocks & Rank Booster AIR < 100',
        subtitle: 'Timed virtual exam simulation, error log auditing, peak performance conditioning',
        timeframe: 'Month 11 - Feb 2027',
        targetObjective: 'Consistently score 75+ in Full Length Mocks with 0 silly negative marks',
        nodes: [
          {
            id: 'cs-mock-1',
            phaseId: 4,
            subject: 'Full Mock Series',
            topic: '65-Question 3-Hour Simulation Drills',
            estimatedHours: 80,
            status: 'locked',
            masteryPercentage: 0,
            suggestedVideos: []
          }
        ]
      }
    ];
  }

  // Fallback generic engineering template for DA / ECE / EE / ME / CE
  return [
    {
      id: 1,
      title: 'Phase 1: Engineering Mathematics & Foundational Principles',
      subtitle: 'Build unstoppable math & analytical foundations',
      timeframe: 'Month 1 - Month 3',
      targetObjective: 'Master Linear Algebra, Calculus, and Probability Distributions',
      nodes: [
        {
          id: 'gen-math-1',
          phaseId: 1,
          subject: 'Engineering Mathematics',
          topic: 'Linear Algebra & Eigenvalues',
          estimatedHours: 30,
          status: 'in_progress',
          masteryPercentage: 70,
          suggestedVideos: [
            { title: 'Eigenvalues & Diagonalization GATE', youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', durationMin: 50 }
          ]
        },
        {
          id: 'gen-ga-1',
          phaseId: 1,
          subject: 'General Aptitude',
          topic: 'Verbal, Quantitative & Spatial Reasoning',
          estimatedHours: 25,
          status: 'in_progress',
          masteryPercentage: 80,
          suggestedVideos: []
        }
      ]
    },
    {
      id: 2,
      title: 'Phase 2: Core Engineering Subject Immersion',
      subtitle: 'Deep conceptual rigor on branch-specific modules',
      timeframe: 'Month 4 - Month 7',
      targetObjective: 'Cover 80% syllabus with topic-wise test verification',
      nodes: [
        {
          id: 'gen-core-1',
          phaseId: 2,
          subject: `${branch} Core Systems`,
          topic: 'Fundamental Laws & Dynamic Analysis',
          estimatedHours: 60,
          status: 'locked',
          masteryPercentage: 20,
          suggestedVideos: []
        }
      ]
    },
    {
      id: 3,
      title: 'Phase 3: PYQ Exhaustion & Test Practice',
      subtitle: 'Solve 25+ years past exam questions',
      timeframe: 'Month 8 - Month 10',
      targetObjective: 'Accuracy above 85% in sectional papers',
      nodes: [
        {
          id: 'gen-pyq-1',
          phaseId: 3,
          subject: 'PYQ Drills',
          topic: 'Past 10 Years Comprehensive Solving',
          estimatedHours: 50,
          status: 'locked',
          masteryPercentage: 0,
          suggestedVideos: []
        }
      ]
    },
    {
      id: 4,
      title: 'Phase 4: Full Length CBT & Speed Booster',
      subtitle: 'Virtual test environment conditioning',
      timeframe: 'Month 11 - Feb 2027',
      targetObjective: 'Score 70+ in full-length test series',
      nodes: [
        {
          id: 'gen-mock-1',
          phaseId: 4,
          subject: 'Full Mocks',
          topic: 'Exam Centre Simulation',
          estimatedHours: 80,
          status: 'locked',
          masteryPercentage: 0,
          suggestedVideos: []
        }
      ]
    }
  ];
}

/**
 * CONNECTED FEEDBACK LOOP:
 * Modifies study plan based on exam results!
 * If user struggled on specific topics in a test:
 * 1. Tags or demotes roadmap nodes to 'urgent_priority' or 'needs_revision'
 * 2. Adds topic to urgentRevisionQueue with reason and tailored action
 * 3. Adjusts mastery percentage
 */
export function injectExamFeedbackIntoRoadmap(
  currentPlan: StudyPlanState,
  weakTopics: string[],
  topicBreakdown: Record<string, { total: number; correct: number; incorrect: number; accuracy: number; subject: string }>
): StudyPlanState {
  const updatedPhases = currentPlan.phases.map(phase => {
    const updatedNodes = phase.nodes.map(node => {
      // Check if this node matches any tested topic
      const testedTopicKey = Object.keys(topicBreakdown).find(
        k => k.toLowerCase().includes(node.topic.toLowerCase()) || node.topic.toLowerCase().includes(k.toLowerCase())
      );

      if (testedTopicKey) {
        const stats = topicBreakdown[testedTopicKey];
        const newMastery = Math.round((node.masteryPercentage + stats.accuracy) / 2);
        let newStatus: RoadmapNode['status'] = node.status;

        if (stats.accuracy < 50 || weakTopics.includes(testedTopicKey)) {
          newStatus = 'urgent_priority';
        } else if (stats.accuracy < 75) {
          newStatus = 'needs_revision';
        } else if (stats.accuracy >= 85) {
          newStatus = 'completed';
        }

        return {
          ...node,
          masteryPercentage: newMastery,
          status: newStatus,
          lastTestedDate: new Date().toISOString()
        };
      }
      return node;
    });

    return { ...phase, nodes: updatedNodes };
  });

  // Construct urgent revision items
  const newQueue = [...currentPlan.urgentRevisionQueue];
  const todayStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  for (const weak of weakTopics) {
    const stats = topicBreakdown[weak];
    const exists = newQueue.some(item => item.topic.toLowerCase() === weak.toLowerCase());
    if (!exists) {
      newQueue.unshift({
        topic: weak,
        subject: stats ? stats.subject : 'Core Engineering',
        identifiedAt: todayStr,
        reason: stats
          ? `Score ${stats.correct}/${stats.total} (${stats.accuracy}% accuracy) with ${stats.incorrect} negative hits.`
          : 'Failed key conceptual verification in recent test.',
        recommendedAction: `Review concept video in YouTube Cockpit & complete a targeted 5-question diagnostic drill immediately.`
      });
    }
  }

  // Award XP for taking a test!
  const xpReward = 150 + (Object.keys(topicBreakdown).length * 20);
  const updatedProfile: UserStudyProfile = {
    ...currentPlan.profile,
    xpPoints: currentPlan.profile.xpPoints + xpReward,
    totalHoursStudied: currentPlan.profile.totalHoursStudied + 1.5,
    level: calculateLevel(currentPlan.profile.xpPoints + xpReward)
  };

  return {
    ...currentPlan,
    phases: updatedPhases,
    urgentRevisionQueue: newQueue,
    profile: updatedProfile
  };
}

export function calculateLevel(xp: number): string {
  if (xp > 3000) return 'AIR 1 Contender (IISc Tier)';
  if (xp > 2000) return 'Top 50 Ranker (IIT Bombay Bound)';
  if (xp > 1200) return 'Speed Master (75+ Marks Pace)';
  if (xp > 600) return 'Consistent Warrior (Syllabus Crusher)';
  if (xp > 200) return 'Foundations Solidifier';
  return 'GATE 2027 Aspirant';
}
