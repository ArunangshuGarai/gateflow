/**
 * Adaptive GATE 2027 Roadmap & Study Engine
 * Dynamically binds exam results to study modules and urgent revision queues.
 */

export interface RoadmapNode {
  id: string;
  phaseId: number;
  subject: string;
  topic: string;
  subtopics: string[];
  manualCheckouts?: { [subtopic: string]: boolean };
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
            subtopics: [
              'Number Systems, Modular Arithmetic & Divisibility',
              'Percentages, Profit & Loss, Ratio & Proportions',
              'Time, Speed, Distance & Work Equations',
              'Permutations, Combinations & Probability Distributions',
              'Syllogisms, Critical Reasoning & Data Interpretation'
            ],
            manualCheckouts: { 'Number Systems, Modular Arithmetic & Divisibility': true, 'Percentages, Profit & Loss, Ratio & Proportions': true },
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
            subtopics: [
              'Propositional Logic, Connectives & Truth Tables',
              'Tautologies, Contradictions & Logical Equivalences',
              'First-Order Predicate Logic & Nested Quantifiers',
              'Rules of Inference (Modus Ponens, Resolution Principle)',
              'Equivalence Relations, Partial Orders & Lattices',
              'Graph Theory: Connectivity, Planarity & Vertex Coloring'
            ],
            manualCheckouts: { 'Propositional Logic, Connectives & Truth Tables': true },
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
            subtopics: [
              'Array Memory Addressing (Row & Column Major Mapping)',
              'Stacks: Postfix Evaluation & Parenthesis Invariants',
              'Circular Queues, Deques & Priority Queues',
              'Binary Search Trees (BST): Insertion, Deletion & Traversals',
              'AVL Trees: Height Balancing & Rotation Invariants',
              'Binary Heaps, Heapify Analysis & Priority Queue Bounds'
            ],
            manualCheckouts: { 'Array Memory Addressing (Row & Column Major Mapping)': true, 'Stacks: Postfix Evaluation & Parenthesis Invariants': true },
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
            subtopics: [
              'Big-O, Omega, Theta Asymptotic Notations & Invariants',
              'Divide & Conquer Recurrences (Master Theorem Cases 1-3)',
              'Greedy Paradigm: Huffman Coding & Fractional Knapsack',
              'Dynamic Programming: Matrix Chain, LCS, 0/1 Knapsack',
              'Graph Algorithms: BFS, DFS & Topological Ordering',
              'Shortest Paths: Dijkstra & Bellman-Ford Negative Cycles',
              'NP-Completeness: P, NP, NP-Hard & Polynomial Reductions'
            ],
            manualCheckouts: { 'Big-O, Omega, Theta Asymptotic Notations & Invariants': true },
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
            subtopics: [
              'Process States, PCB & Context Switching Overheads',
              'CPU Scheduling: FCFS, SJF, SRTF, Round Robin & Gantt Charts',
              'Critical Section Problem, Mutual Exclusion & Bounded Waiting',
              'Peterson\'s Algorithm & Hardware Atomic TestAndSet',
              'Counting & Binary Semaphores (Classical IPC Problems)',
              'Deadlock Conditions, Banker\'s Algorithm & Resource Allocation Graphs',
              'Memory Management: Paging, TLB Hit Rates & Multilevel Tables',
              'Virtual Memory: Page Faults, FIFO, LRU & Optimal Replacement'
            ],
            manualCheckouts: {},
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
            subtopics: [
              'Relational Model, ER Diagrams & Relational Algebra Equivalences',
              'SQL: Complex Joins, Nested Subqueries & Aggregate Filtering',
              'Functional Dependencies, Attribute Closure & Canonical Cover',
              'Normal Forms: 1NF, 2NF, 3NF & BCNF Decomposition Proofs',
              'ACID Properties & Transaction State Machine',
              'Conflict & View Serializability (Precedence Graph Cycles)',
              'Two-Phase Locking (2PL), Strict 2PL & Deadlock Prevention',
              'B-Tree & B+ Tree Indexing Node Bounds & Search Latency'
            ],
            manualCheckouts: {},
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
            subtopics: [
              'Deterministic & Non-Deterministic Finite Automata (DFA/NFA)',
              'DFA Minimization via Table Filling & Myhill-Nerode Equivalence',
              'Regular Expressions, Closure Properties & Pumping Lemma',
              'Context-Free Grammars (CFG), Derivation Trees & Ambiguity',
              'Pushdown Automata (PDA) & Deterministic CFLs',
              'Turing Machines (TM) & Universal Turing Machine (UTM)',
              'Decidability, Halting Problem & Undecidability (Rice\'s Theorem)'
            ],
            manualCheckouts: {},
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
            subtopics: [
              'OSI & TCP/IP Layer Protocol Functions',
              'Data Link Layer: Framing, CRC Error Polynomials & CSMA/CD',
              'Sliding Window Protocols: Stop-and-Wait, Go-Back-N, Selective Repeat',
              'IPv4 Addressing, CIDR Blocks & VLSM Subnet Calculations',
              'Routing: Distance Vector (Count-to-Infinity) & Link State (Dijkstra)',
              'TCP 3-Way Handshake, Header Format & Sliding Window Flow Control',
              'TCP Congestion Control: AIMD, Slow Start, Fast Retransmit',
              'Application Layer: DNS Resolution, HTTP & SMTP Protocols'
            ],
            manualCheckouts: {},
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
            subtopics: [
              'GATE 2024 & 2025 Shift 1 & 2 PYQs Analysis',
              'GATE 2021-2023 IIT Bombay / IIT Kanpur Question Traps',
              'GATE 2015-2020 Multi-Concept Systems Questions',
              'Top 50 Most Repeated NAT Calculation Problems',
              'PYQ Error Auditing & Speed Optimization'
            ],
            manualCheckouts: {},
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
            subtopics: [
              'Theory of Computation Closure & Decidability MSQs',
              'Graph Theory & Minimum Spanning Tree MSQ Proofs',
              'Database Normalization & Precedence Graph Cycles',
              'Compiler Syntax Trees & LR Parser Conflict MSQs',
              'OS Synchronization & Page Replacement Edge Cases'
            ],
            manualCheckouts: {},
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
            subtopics: [
              'Official TCS iON 3-Hour Mock Paper 01 (Grand Assessment)',
              'Official TCS iON 3-Hour Mock Paper 02 (Strict Hall Protocol)',
              'Sectional GA + Math 45-Minute Sprints',
              'Negative Marking Post-Mortem in Error Notebook',
              'Final 7-Day Formula & Shortcut Sheet Consolidation'
            ],
            manualCheckouts: {},
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
          subtopics: [
            'Matrix Operations, Rank of a Matrix & Determinants',
            'Systems of Linear Equations (Gaussian Elimination)',
            'Eigenvalues, Eigenvectors & Cayley-Hamilton Theorem',
            'Vector Spaces, Linear Independence & Basis Dimensions'
          ],
          manualCheckouts: {},
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
          subtopics: [
            'Vocabulary & Grammar in Context',
            'Data Interpretation & Analytical Reasoning',
            'Spatial Aptitude: Mirror Images & Paper Folding',
            'Quantitative Problem Solving'
          ],
          manualCheckouts: {},
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
          subtopics: [
            'Core Governing Principles & Governing Equations',
            'Steady-State & Transient Response Formulations',
            'Numerical Modeling & Standard Testing Protocols'
          ],
          manualCheckouts: {},
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
          subtopics: [
            'Past 10 Years Question Traps & Solution Verification',
            'High-Yield Numerical Calculation Problems'
          ],
          manualCheckouts: {},
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
          subtopics: [
            'Full Length Mock Test 1',
            'Full Length Mock Test 2',
            'Mistake Analysis & Formula Revision'
          ],
          manualCheckouts: {},
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
