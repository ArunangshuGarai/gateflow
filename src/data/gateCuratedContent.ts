import { CuratedVideo, GateQuestion, FlashcardItem, DailyTaskItem, SyllabusSubject, MockExamPreset } from '../types';
import { OFFICIAL_GATE_65_QUESTIONS, DIVERSIFIED_EXAM_PRESETS } from './gateExamBank';

export const CURATED_GATE_VIDEOS: CuratedVideo[] = [
  {
    id: 'vid-os-srtf',
    title: 'Preemptive SJF (SRTF) Algorithm & Gantt Chart Analysis',
    channel: 'Gate Smashers',
    duration: '32:18',
    videoNumber: 'Video 04',
    youtubeId: 'bkSWJJZNgf8',
    subject: 'Operating Systems',
    topic: 'CPU Scheduling',
    keyFormulas: [
      '\\text{Turnaround Time (TAT)} = \\text{Completion Time (CT)} - \\text{Arrival Time (AT)}',
      '\\text{Waiting Time (WT)} = \\text{Turnaround Time (TAT)} - \\text{Burst Time (BT)}',
      '\\text{Response Time (RT)} = \\text{First CPU Allocation} - \\text{Arrival Time (AT)}',
      '\\text{Throughput} = \\frac{\\text{Total Completed Processes}}{\\text{Total Schedule Time}}'
    ],
    description: 'Preemptive Shortest-Remaining-Time-First (SRTF) scheduling algorithm step-by-step example with Gantt chart, waiting time calculation, tie-breaker invariants, and past GATE questions.',
    transcript: [
      {
        timeSeconds: 0,
        timestamp: '00:00',
        title: 'CPU Scheduling Criteria & Time Definitions',
        text: 'Introduction to essential CPU scheduling metrics: Arrival Time (AT), Burst Time (BT), Completion Time (CT), Turnaround Time (TAT), Waiting Time (WT), and Response Time (RT).'
      },
      {
        timeSeconds: 255,
        timestamp: '04:15',
        title: 'Non-preemptive vs Preemptive Mechanics',
        text: 'Understanding how preemption interrupts running processes when a new process arrives with strictly smaller remaining CPU burst time. Impact of context switch overhead.'
      },
      {
        timeSeconds: 510,
        timestamp: '08:30',
        title: 'Proof of SJF Optimality for Average Waiting Time',
        text: 'Mathematical reasoning showing why Shortest Job First gives the provably optimal minimum average waiting time among all scheduling algorithms.'
      },
      {
        timeSeconds: 822,
        timestamp: '13:42',
        title: 'Preemptive SJF Example 1: Gantt Chart Construction',
        text: 'Solving the classic GATE example: Process P1 arrives at 0 with burst 7, P2 arrives at 2 with burst 4, P3 arrives at 4 with burst 1, P4 arrives at 5 with burst 4. Gantt chart constructed unit by unit.'
      },
      {
        timeSeconds: 1270,
        timestamp: '21:10',
        title: 'Starvation Problem & Aging Technique',
        text: 'Indefinite blocking of long processes in SJF/SRTF when short processes continuously arrive. Solution via aging (gradual increase of priority over waiting time).'
      },
      {
        timeSeconds: 1665,
        timestamp: '27:45',
        title: 'GATE 2-Mark Question: Equal Remaining Time Tie-Breakers',
        text: 'Handling the standard GATE trap: what happens when two processes have identical remaining burst times? FCFS arrival order serves as the deterministic tie-breaker.'
      },
      {
        timeSeconds: 1860,
        timestamp: '31:00',
        title: 'Summary & Fast Formula Cheat-Sheet',
        text: 'Rapid recap of TAT, WT formulas and common calculation slips in GATE CBT questions.'
      }
    ]
  },
  {
    id: 'vid-algo-recurrence',
    title: 'Recurrence Relations & Master Theorem with GATE PYQs',
    channel: 'Gate Smashers',
    duration: '28:14',
    videoNumber: 'Video 01',
    youtubeId: '9gm8hM84524',
    subject: 'Algorithms',
    topic: 'Recurrence Relations & Asymptotic Analysis',
    keyFormulas: [
      'T(n) = aT(n/b) + \\Theta(n^k \\log^p n)',
      '\\text{Case 1: } \\log_b a > k \\implies T(n) = \\Theta(n^{\\log_b a})',
      '\\text{Case 2: } \\log_b a = k \\implies T(n) = \\Theta(n^k \\log^{p+1} n)',
      '\\text{Case 3: } \\log_b a < k \\implies T(n) = \\Theta(n^k \\log^p n)'
    ],
    description: 'Master the 3 cases of Master theorem, non-polynomial recurrences, substitution methods, and past 15 years tricky questions.',
    transcript: [
      {
        timeSeconds: 0,
        timestamp: '00:00',
        title: 'Divide & Conquer Recurrence Standard Form',
        text: 'Standard form T(n) = aT(n/b) + f(n) where a >= 1 and b > 1. Physical meaning of recursion tree depth and leaf count.'
      },
      {
        timeSeconds: 380,
        timestamp: '06:20',
        title: 'Case 1: Leaf Heavy Recurrences',
        text: 'When work done at the leaves dominates the roots: log_b(a) > k leading to Theta(n^{log_b a}).'
      },
      {
        timeSeconds: 740,
        timestamp: '12:20',
        title: 'Case 2: Balanced Work Across All Levels',
        text: 'When work is evenly distributed across log n levels: log_b(a) = k with log^p(n) factor propagation.'
      },
      {
        timeSeconds: 1120,
        timestamp: '18:40',
        title: 'Case 3: Root Heavy & Regularity Condition',
        text: 'Root dominates: regularity check a*f(n/b) <= c*f(n) for c < 1.'
      },
      {
        timeSeconds: 1450,
        timestamp: '24:10',
        title: 'Tricky GATE Non-Polynomial Recurrences',
        text: 'Substitution method for T(n) = 2T(sqrt(n)) + log n using n = 2^m variable replacement.'
      }
    ]
  },
  {
    id: 'vid-os-sync',
    title: 'Process Synchronization: Classical IPC & Semaphores',
    channel: 'Amit Khurana',
    duration: '42:50',
    videoNumber: 'Video 06',
    youtubeId: 'OrM7402A8wQ',
    subject: 'Operating Systems',
    topic: 'Process Synchronization & Semaphores',
    keyFormulas: [
      '\\text{Wait}(S): S \\leftarrow S - 1; \\quad \\text{if } S < 0 \\implies \\text{block}()',
      '\\text{Signal}(S): S \\leftarrow S + 1; \\quad \\text{if } S \\le 0 \\implies \\text{wakeup}()',
      '\\text{Counting Semaphore Range: } [-K, N]'
    ],
    description: 'Complete breakdown of Producer-Consumer, Reader-Writer, and Dining Philosophers with atomic assembly test-and-set instructions.',
    transcript: [
      {
        timeSeconds: 0,
        timestamp: '00:00',
        title: 'Critical Section Problem Requirements',
        text: 'The 3 mandatory conditions: Mutual Exclusion, Progress, and Bounded Waiting.'
      },
      {
        timeSeconds: 610,
        timestamp: '10:10',
        title: 'Petersons Algorithm 2-Process Invariant',
        text: 'Turn variable and flag array behavior. Why hardware test-and-set or swap is needed on modern multi-core systems.'
      },
      {
        timeSeconds: 1320,
        timestamp: '22:00',
        title: 'Counting & Binary Semaphores',
        text: 'Atomic wait(P) and signal(V) primitives. Negative semaphore value indicates number of blocked processes waiting in queue.'
      },
      {
        timeSeconds: 2100,
        timestamp: '35:00',
        title: 'Producer-Consumer Bounded Buffer Problem',
        text: 'Using mutex, empty, and full semaphores. Order of wait operations to prevent deadlock.'
      }
    ]
  },
  {
    id: 'vid-dbms-serial',
    title: 'Conflict & View Serializability, 2PL & Strict 2PL',
    channel: 'Gate Smashers',
    duration: '35:20',
    videoNumber: 'Video 08',
    youtubeId: 'e_04ZrNroTo',
    subject: 'Databases (DBMS)',
    topic: 'Transactions & Concurrency Control',
    keyFormulas: [
      '\\text{Conflict Equivalent: } \\text{Precedence Graph is Acyclic}',
      '\\text{Rigorous 2PL } \\subset \\text{Strict 2PL } \\subset \\text{Basic 2PL}',
      '\\text{Conflicting Ops: Same data item, different transactions, at least one write}'
    ],
    description: 'Learn precedence graphs, swap rules for non-conflicting operations, cascading abort avoidance, and dirty read anomalies.',
    transcript: [
      {
        timeSeconds: 0,
        timestamp: '00:00',
        title: 'ACID Properties & Transaction Schedules',
        text: 'Serial vs concurrent schedules. Why serializability is the benchmark for consistency.'
      },
      {
        timeSeconds: 520,
        timestamp: '08:40',
        title: 'Conflict Operations & Precedence Graphs',
        text: 'Rules for conflict operations: R-W, W-R, W-W on same item. Topological sort of acyclic precedence graph gives equivalent serial schedule.'
      },
      {
        timeSeconds: 1250,
        timestamp: '20:50',
        title: 'Two-Phase Locking (2PL) Protocol',
        text: 'Growing phase and shrinking phase. Why 2PL guarantees conflict serializability but may suffer from deadlocks.'
      },
      {
        timeSeconds: 1820,
        timestamp: '30:20',
        title: 'Strict 2PL & Cascading Aborts',
        text: 'Holding exclusive locks until commit/abort prevents dirty reads and cascading rollbacks.'
      }
    ]
  },
  {
    id: 'vid-cn-subnet',
    title: 'IPv4 Subnetting, CIDR & Variable Length Subnet Masking',
    channel: 'Knowledge Gate',
    duration: '31:45',
    videoNumber: 'Video 12',
    youtubeId: 's_n_c4t_v1o',
    subject: 'Computer Networks',
    topic: 'Network Layer & Subnetting',
    keyFormulas: [
      '\\text{Usable Hosts} = 2^{32 - \\text{prefix}} - 2',
      '\\text{Subnet Mask: } 255.255.255.255 - (2^{32-\\text{mask}} - 1)',
      '\\text{Directed Broadcast Address} = \\text{Network ID} \\lor (\\sim\\text{Subnet Mask})'
    ],
    description: 'Solve NAT subnetting numericals in under 60 seconds with binary bit tricks without writing whole 32-bit addresses.',
    transcript: [
      {
        timeSeconds: 0,
        timestamp: '00:00',
        title: 'Classful vs CIDR Classless Addressing',
        text: 'Class A, B, C limitations and the introduction of CIDR /prefix notation.'
      },
      {
        timeSeconds: 430,
        timestamp: '07:10',
        title: 'Calculating Number of Subnets & Host Ranges',
        text: 'Bit borrowing method from host portion. Usable host count subtracting network and broadcast addresses.'
      },
      {
        timeSeconds: 980,
        timestamp: '16:20',
        title: 'VLSM (Variable Length Subnet Masking)',
        text: 'Allocating subnets to departments with differing host requirements without wasting address space.'
      },
      {
        timeSeconds: 1540,
        timestamp: '25:40',
        title: 'GATE Numerical: Subnet Mask & Longest Prefix Match',
        text: 'Router forwarding table lookup using longest prefix match rule.'
      }
    ]
  },
  {
    id: 'vid-math-eigen',
    title: 'Eigenvalues, Eigenvectors & Cayley-Hamilton Theorem',
    channel: 'Gajendra Purohit',
    duration: '38:10',
    videoNumber: 'Video 05',
    youtubeId: 'v3g82F0-lfg',
    subject: 'Engineering Mathematics',
    topic: 'Linear Algebra',
    keyFormulas: [
      '\\det(A - \\lambda I) = 0',
      '\\sum \\lambda_i = \\text{Trace}(A), \\quad \\prod \\lambda_i = \\det(A)',
      'A^{-1} = -\\frac{1}{a_0}(A^{n-1} + a_{n-1}A^{n-2} + \\dots + a_1 I)'
    ],
    description: 'Solve GATE linear algebra questions by inspection using trace and determinant properties instead of lengthy characteristic equations.',
    transcript: [
      {
        timeSeconds: 0,
        timestamp: '00:00',
        title: 'Characteristic Equation & Eigenvalues',
        text: 'Definition of Ax = lambda x where x is a non-zero eigenvector.'
      },
      {
        timeSeconds: 590,
        timestamp: '09:50',
        title: 'Trace & Determinant Inspection Shortcut',
        text: 'Sum of eigenvalues equals trace, product equals determinant. Eliminating MCQ options in 15 seconds.'
      },
      {
        timeSeconds: 1280,
        timestamp: '21:20',
        title: 'Cayley-Hamilton Theorem Application',
        text: 'Every square matrix satisfies its own characteristic equation. Computing high matrix powers A^100 and inverses.'
      },
      {
        timeSeconds: 1950,
        timestamp: '32:30',
        title: 'Diagonalization & Similar Matrices',
        text: 'Condition for matrix diagonalization: n linearly independent eigenvectors.'
      }
    ]
  }
];

export const MOTIVATIONAL_QUOTES = [
  'A 2-year gap is not a disadvantage — it is your fuel. You know the value of time better than anyone in the exam hall.',
  'You are close, just a bit! Keep pushing through this question.',
  'Every formula memorized and derived today is one more rank jumped towards IISc Bangalore.',
  'AIR 1 does not study 16 hours on one day; they study 6 hours every single day without excuses.',
  'Mistakes in mock tests are blessings: better to lose 0.67 marks now in simulation than on February morning!',
  'When you feel tired, remember why you restarted after 2025. Your IIT M.Tech seat is waiting.',
  'Keep calm and trust the process. Concepts built with derivation never fade under pressure.'
];

export const LEGACY_PRACTICE_SAMPLE_QUESTIONS: GateQuestion[] = [
  // SECTION 1: General Aptitude (Q1 to Q5)
  {
    id: 'ga-1',
    section: 'General Aptitude',
    type: 'MCQ',
    marks: 1,
    subject: 'General Aptitude',
    topic: 'Verbal Aptitude & Grammar',
    questionText: 'Select the word that fits the analogy:\nExonerate : Absolve :: Condemn : _______',
    options: [
      'A) Acquit',
      'B) Denounce',
      'C) Vindicated',
      'D) Relieve'
    ],
    correctAnswer: 'B',
    solution: 'Exonerate and Absolve are synonyms meaning to clear from blame. Similarly, Condemn and Denounce are synonyms meaning to publicly declare wrong or evil.',
    explanation: 'Standard synonym analogy tested in GATE General Aptitude.',
    pyqYear: 2022
  },
  {
    id: 'ga-2',
    section: 'General Aptitude',
    type: 'NAT',
    marks: 1,
    subject: 'General Aptitude',
    topic: 'Quantitative Aptitude',
    questionText: 'A train 150 meters long takes 15 seconds to cross a bridge 300 meters long. The speed of the train in kilometers per hour (km/h) is:',
    options: [],
    correctAnswer: 108,
    tolerance: 0.5,
    solution: 'Total distance = 150 + 300 = 450 m.\nSpeed = Distance / Time = 450 / 15 = 30 m/s.\nConverting to km/h: 30 * (18 / 5) = 108 km/h.',
    explanation: 'Basic speed, distance, and unit conversion calculation.',
    pyqYear: 2023
  },
  {
    id: 'ga-3',
    section: 'General Aptitude',
    type: 'MCQ',
    marks: 2,
    subject: 'General Aptitude',
    topic: 'Analytical & Spatial Reasoning',
    questionText: 'In a group of 120 students, 70 study Mathematics, 60 study Physics, and 20 study neither. How many students study BOTH Mathematics and Physics?',
    options: [
      'A) 20',
      'B) 30',
      'C) 40',
      'D) 50'
    ],
    correctAnswer: 'B',
    solution: 'Total who study at least one subject = 120 - 20 = 100.\nBy inclusion-exclusion: |M ∪ P| = |M| + |P| - |M ∩ P|\n100 = 70 + 60 - |M ∩ P|\n|M ∩ P| = 130 - 100 = 30.',
    explanation: 'Inclusion-exclusion principle applied to set theory.',
    pyqYear: 2021
  },

  // SECTION 2: Core Engineering (Q4 to Q10)
  {
    id: 'core-1',
    section: 'Core Engineering',
    type: 'MCQ',
    marks: 1,
    subject: 'Discrete Mathematics',
    topic: 'Propositional & First-Order Logic',
    questionText: 'Which of the following propositional formulas is a TAUTOLOGY?',
    options: [
      'A) (p → q) → (q → p)',
      'B) (p ∧ (p → q)) → q',
      'C) (p ∨ q) → (p ∧ q)',
      'D) p → (p ∧ q)'
    ],
    correctAnswer: 'B',
    solution: 'Option B represents Modus Ponens: if p is true and p implies q is true, then q must be true. (p ∧ (¬p ∨ q)) → q ≡ (p ∧ q) → q ≡ ¬(p ∧ q) ∨ q ≡ ¬p ∨ ¬q ∨ q ≡ ¬p ∨ True ≡ True. Hence it is always a tautology.',
    explanation: 'Fundamental rule of inference (Modus Ponens) is a classical tautology.',
    pyqYear: 2020
  },
  {
    id: 'core-2',
    section: 'Core Engineering',
    type: 'NAT',
    marks: 2,
    subject: 'Algorithms',
    topic: 'Recurrence Relations & Asymptotic Analysis',
    questionText: 'Consider the following recurrence relation:\n$$T(n) = 3T(n/3) + 4n$$\nwith $T(1) = 1$. The value of $T(27)$ is:',
    options: [],
    correctAnswer: 351,
    tolerance: 0,
    solution: 'T(1) = 1\nT(3) = 3*T(1) + 4*3 = 3*1 + 12 = 15\nT(9) = 3*T(3) + 4*9 = 3*15 + 36 = 45 + 36 = 81\nT(27) = 3*T(9) + 4*27 = 3*81 + 108 = 243 + 108 = 351.',
    explanation: 'Direct recurrence unwinding for power of 3 input.',
    pyqYear: 2024
  },
  {
    id: 'core-3',
    section: 'Core Engineering',
    type: 'MSQ',
    marks: 2,
    subject: 'Operating Systems',
    topic: 'Process Synchronization & Semaphores',
    questionText: 'Which of the following conditions MUST be satisfied by any valid solution to the Critical Section problem?',
    options: [
      'A) Mutual Exclusion',
      'B) Progress',
      'C) Bounded Waiting',
      'D) Architectural Portability'
    ],
    correctAnswer: ['A', 'B', 'C'],
    solution: 'The three mandatory criteria for any correct solution to the critical section problem are: 1. Mutual Exclusion (primary safety property), 2. Progress (no deadlock when CS is empty), and 3. Bounded Waiting (no starvation). Portability is a desirable engineering property but not a theoretical requirement.',
    explanation: 'Multi-Select Question: Select A, B, and C. D is not a fundamental criterion.',
    pyqYear: 2023
  },
  {
    id: 'core-4',
    section: 'Core Engineering',
    type: 'MCQ',
    marks: 2,
    subject: 'Databases (DBMS)',
    topic: 'Transactions & Concurrency Control',
    questionText: 'Consider two transactions:\nT1: R1(X), W1(X), R1(Y), W1(Y)\nT2: R2(Y), W2(Y), R2(X), W2(X)\nWhich of the following statements is TRUE regarding concurrent executions of T1 and T2 under Basic Two-Phase Locking (2PL)?',
    options: [
      'A) The schedule is guaranteed to be conflict serializable and deadlock-free.',
      'B) The schedule is guaranteed to be conflict serializable, but deadlocks may occur.',
      'C) Deadlocks are impossible, but the schedule may not be conflict serializable.',
      'D) Cascading aborts are strictly prevented under Basic 2PL.'
    ],
    correctAnswer: 'B',
    solution: 'Basic 2PL guarantees Conflict Serializability (the precedence graph of any 2PL schedule is acyclic). However, Basic 2PL is NOT deadlock-free; here T1 locks X and waits for Y while T2 locks Y and waits for X, creating a circular wait deadlock. Also, Strict 2PL is required to prevent cascading aborts.',
    explanation: 'Key distinction between 2PL properties vs Deadlock and Cascading Rollbacks.',
    pyqYear: 2022
  },
  {
    id: 'core-5',
    section: 'Core Engineering',
    type: 'NAT',
    marks: 2,
    subject: 'Computer Networks',
    topic: 'Network Layer & Subnetting',
    questionText: 'An organization is granted the IPv4 block 198.51.100.0/24. The administrator wishes to create 4 equal-sized subnets. What is the MAXIMUM number of usable host IP addresses in EACH subnet?',
    options: [],
    correctAnswer: 62,
    tolerance: 0,
    solution: 'To create 4 = 2^2 subnets, borrow 2 bits from host ID. New subnet mask becomes /26 (24 + 2).\nNumber of host bits remaining = 32 - 26 = 6 bits.\nTotal addresses per subnet = 2^6 = 64.\nUsable hosts per subnet = 64 - 2 (network address and broadcast address) = 62.',
    explanation: 'NAT question on CIDR subnetting: 2^h - 2 formula.',
    pyqYear: 2021
  },
  {
    id: 'core-6',
    section: 'Core Engineering',
    type: 'MSQ',
    marks: 2,
    subject: 'Theory of Computation',
    topic: 'Regular Expressions & Decidability',
    questionText: 'Which of the following problems is/are UNDECIDABLE?',
    options: [
      'A) Emptiness problem for Regular Languages',
      'B) Equivalence problem for Context-Free Grammars (CFGs)',
      'C) Membership problem for Context-Free Languages (CFLs)',
      'D) Halting problem for Turing Machines'
    ],
    correctAnswer: ['B', 'D'],
    solution: 'Emptiness for Regular languages is decidable (check reachability of final state in DFA) (A is false). Equivalence of CFGs (L(G1) == L(G2)) is undecidable (B is true). Membership for CFL is decidable via CYK algorithm O(n^3) (C is false). Halting problem for Turing machines is universally undecidable (D is true).',
    explanation: 'Undecidability table for Chomsky hierarchy languages.',
    pyqYear: 2024
  },
  {
    id: 'core-7',
    section: 'Core Engineering',
    type: 'MCQ',
    marks: 1,
    subject: 'Engineering Mathematics',
    topic: 'Linear Algebra',
    questionText: 'Let M be a 3x3 matrix whose eigenvalues are 0, 2, and 3. What is the determinant of matrix (M² + 3M)?',
    options: [
      'A) 0',
      'B) 180',
      'C) 54',
      'D) 72'
    ],
    correctAnswer: 'A',
    solution: 'If λ is an eigenvalue of M, then (λ² + 3λ) is an eigenvalue of (M² + 3M). For λ = 0, 0² + 3(0) = 0. Since one eigenvalue of (M² + 3M) is 0, the determinant (which is the product of all eigenvalues) is strictly 0.',
    explanation: 'Product of eigenvalues equals the determinant. Any zero eigenvalue results in zero determinant.',
    pyqYear: 2023
  },
  {
    id: 'core-8',
    section: 'Core Engineering',
    type: 'NAT',
    marks: 2,
    subject: 'Computer Organization & Architecture',
    topic: 'Pipelining & Hazards',
    questionText: 'A 5-stage pipelined processor has stages IF, ID, EX, MEM, and WB with latencies 1 ns, 1.2 ns, 1.5 ns, 2.0 ns, and 1.1 ns respectively. Pipeline registers introduce an overhead of 0.2 ns. To execute 100 independent instructions without any pipeline stalls, the total execution time in nanoseconds is:',
    options: [],
    correctAnswer: 228.8,
    tolerance: 0.5,
    solution: 'Clock cycle time = max(stage latencies) + register overhead = 2.0 ns + 0.2 ns = 2.2 ns.\nFor k stages and n instructions without stalls, total cycles = k + n - 1 = 5 + 100 - 1 = 104 cycles.\nTotal execution time = 104 * 2.2 ns = 228.8 ns.',
    explanation: 'Classic GATE pipelining clock cycle constraint: cycle time governed by slowest stage + latch overhead.',
    pyqYear: 2024
  },
  {
    id: 'core-9',
    section: 'Core Engineering',
    type: 'MSQ',
    marks: 2,
    subject: 'Algorithms',
    topic: 'Graph Algorithms & Shortest Paths',
    questionText: 'Which of the following statements is/are TRUE for shortest path algorithms on a directed graph G = (V, E)?',
    options: [
      'A) Bellman-Ford algorithm can detect the presence of negative weight cycles reachable from the source.',
      'B) Dijkstra\'s algorithm using a Fibonacci heap runs in O(|E| + |V| log |V|) time.',
      'C) Dijkstra\'s algorithm always produces correct shortest paths even if edges have negative weights, provided there are no negative cycles.',
      'D) Floyd-Warshall algorithm uses dynamic programming and computes all-pairs shortest paths in Θ(|V|³) time.'
    ],
    correctAnswer: ['A', 'B', 'D'],
    solution: 'A is true (Bellman-Ford detects negative cycle if relaxation is still possible after |V|-1 passes). B is true (Fibonacci heap decreases key in amortized O(1)). C is FALSE: Dijkstra greedily marks vertices as finalized and fails with negative edges. D is true (Floyd-Warshall runs in Θ(V^3)).',
    explanation: 'Important GATE trick: Dijkstra does NOT work with negative edges even if no negative cycle exists.',
    pyqYear: 2022
  },
  {
    id: 'core-10',
    section: 'Core Engineering',
    type: 'MCQ',
    marks: 2,
    subject: 'Compiler Design',
    topic: 'Syntax Analysis & LR Parsing',
    questionText: 'Consider the grammar:\nS → Aa | bAc | dc | bda\nA → d\nWhat can be inferred about this grammar?',
    options: [
      'A) It is LL(1) and LR(0)',
      'B) It is LR(1) but not LALR(1)',
      'C) It is LALR(1) but not LR(0)',
      'D) It is not LR(1)'
    ],
    correctAnswer: 'C',
    solution: 'This is the classical Dragon Book example of an LALR(1) grammar that is not LR(0) due to shift-reduce conflicts in state 0 after reading b and d. LALR(1) tables merge states without introducing reduce-reduce conflicts here.',
    explanation: 'Canonical LR(1) vs LALR(1) state merger properties.',
    pyqYear: 2020
  },
  {
    id: 'core-11',
    section: 'Core Engineering',
    type: 'NAT',
    marks: 2,
    subject: 'Data Science & AI',
    topic: 'Probability & Bayes Theorem',
    questionText: 'A spam filter is trained on 1000 emails: 200 are spam and 800 are ham (not spam). The word "Lottery" appears in 70% of spam emails and in only 5% of ham emails. If a new email contains the word "Lottery", the posterior probability P(Spam | "Lottery") expressed as a percentage (rounded to 1 decimal place) is:',
    options: [],
    correctAnswer: 77.8,
    tolerance: 0.5,
    solution: 'P(Spam) = 200/1000 = 0.2, P(Ham) = 800/1000 = 0.8.\nP(Lottery | Spam) = 0.70, P(Lottery | Ham) = 0.05.\nBy Bayes Theorem:\nP(Spam | Lottery) = (0.70 * 0.2) / (0.70 * 0.2 + 0.05 * 0.8) = 0.14 / (0.14 + 0.04) = 0.14 / 0.18 = 7/9 ≈ 77.77% ≈ 77.8%.',
    explanation: 'Fundamental Bayes theorem application in GATE DA (Data Science & AI) and General Aptitude.',
    pyqYear: 2024
  },
  {
    id: 'core-12',
    section: 'Core Engineering',
    type: 'MCQ',
    marks: 1,
    subject: 'Digital Logic',
    topic: 'Combinational Circuits & Multiplexers',
    questionText: 'A 4:1 multiplexer has data inputs I0, I1, I2, I3 and select lines S1, S0 (S1 as MSB). If S1 = A, S0 = B, and inputs are connected as I0 = 0, I1 = C, I2 = C\', I3 = 1, the boolean function implemented by the multiplexer is:',
    options: [
      'A) A ⊕ B ⊕ C',
      'B) (A ⊙ B) + C',
      'C) A\'BC + AB\'C\' + ABC',
      'D) A + B\'C'
    ],
    correctAnswer: 'C',
    solution: 'Output F = S1\'S0\'I0 + S1\'S0I1 + S1S0\'I2 + S1S0I3\nF = A\'B\'(0) + A\'B(C) + AB\'(C\') + AB(1)\nF = A\'BC + AB\'C\' + AB(C + C\') = A\'BC + AB\'C\' + ABC + ABC\' = A\'BC + AB\'C\' + ABC.',
    explanation: 'Standard multiplexer expansion equation.',
    pyqYear: 2021
  }
];

// Comprehensive 65-Question Bank for GATE 2027
export const INITIAL_GATE_EXAM_QUESTIONS = OFFICIAL_GATE_65_QUESTIONS;

// Complete Diversified Mock Exam Presets (180m, 90m, 30m, 15m)
export const MOCK_EXAM_PRESETS: MockExamPreset[] = DIVERSIFIED_EXAM_PRESETS;

export const INITIAL_FORMULAS = [
  {
    category: 'Algorithms & Data Structures',
    title: 'Master Theorem for Divide & Conquer',
    latex: 'T(n) = aT(n/b) + \\Theta(n^k \\log^p n)',
    notes: 'If log_b(a) > k => O(n^{log_b a}). If log_b(a) = k and p > -1 => O(n^k log^{p+1} n).'
  },
  {
    category: 'Algorithms & Data Structures',
    title: 'Heap Sort Complexity & Array Invariants',
    latex: '\\text{Left}(i) = 2i + 1, \\quad \\text{Right}(i) = 2i + 2, \\quad \\text{Build-Heap} = O(n)',
    notes: 'Max-Heapify takes O(log n), but Build-Heap is strictly O(n) because sum of i/2^i converges.'
  },
  {
    category: 'Operating Systems',
    title: 'Effective Memory Access Time (TLB + Paging)',
    latex: '\\text{EMAT} = h \\cdot (t_{\\text{tlb}} + t_{\\text{mem}}) + (1-h) \\cdot (t_{\\text{tlb}} + (k+1)t_{\\text{mem}})',
    notes: 'Where h is TLB hit ratio, k is number of page table levels.'
  },
  {
    category: 'Computer Networks',
    title: 'Sliding Window Protocol Efficiency',
    latex: '\\eta = \\frac{W}{1 + 2a}, \\quad \\text{where } a = \\frac{T_{\\text{prop}}}{T_{\\text{trans}}} = \\frac{d / v}{L / B}',
    notes: 'For Stop-and-Wait, W = 1. For Go-Back-N, sender window W <= 2^k - 1.'
  },
  {
    category: 'Engineering Mathematics',
    title: 'Bayes Theorem for Posterior Probability',
    latex: 'P(A_i \\mid B) = \\frac{P(B \\mid A_i) P(A_i)}{\\sum_{j=1}^n P(B \\mid A_j) P(A_j)}',
    notes: 'Crucial for General Aptitude and Data Science & AI questions.'
  },
  {
    category: 'Databases (DBMS)',
    title: 'Conflict Serializability (Precedence Graph)',
    latex: 'T_i \\xrightarrow{} T_j \\iff \\exists \\text{ conflicting op } O_i \\text{ before } O_j',
    notes: 'Operations conflict if from different transactions, accessing same item, and at least one is Write.'
  }
];

export const DEFAULT_FLASHCARDS: FlashcardItem[] = [
  {
    id: 'fc-1',
    subject: 'Algorithms',
    topic: 'Asymptotic Notation',
    front: 'What is the condition for Master Theorem Case 1, and what is its Big-Theta complexity?',
    backLatex: 'f(n) = O(n^{\\log_b a - \\epsilon}) \\implies T(n) = \\Theta(n^{\\log_b a})',
    explanation: 'When the recursive subproblems dominate the non-recursive work f(n), the complexity is Theta of n^(log_b a).',
    box: 2,
    nextReviewDate: 'Today',
    lastReviewed: 'Yesterday'
  },
  {
    id: 'fc-2',
    subject: 'Operating Systems',
    topic: 'Process Synchronization',
    front: 'What are the three criteria for Critical Section, and which one prevents starvation?',
    backLatex: '\\text{1. Mutual Exclusion, 2. Progress, 3. Bounded Waiting}',
    explanation: 'Bounded Waiting ensures that a process requesting entry is granted access before an arbitrary unbounded number of other processes enter, preventing starvation.',
    box: 1,
    nextReviewDate: 'Today',
    lastReviewed: '2 days ago'
  },
  {
    id: 'fc-3',
    subject: 'Computer Networks',
    topic: 'Subnetting',
    front: 'Formula for usable host addresses in IPv4 with prefix length /p:',
    backLatex: '\\text{Usable Hosts} = 2^{32 - p} - 2',
    explanation: 'Subtract 2 for the network address (all host bits 0) and the directed broadcast address (all host bits 1).',
    box: 3,
    nextReviewDate: 'In 3 days',
    lastReviewed: 'Yesterday'
  },
  {
    id: 'fc-4',
    subject: 'Engineering Mathematics',
    topic: 'Linear Algebra',
    front: 'Relationship between eigenvalues of matrix A and its Trace and Determinant:',
    backLatex: '\\sum_{i=1}^n \\lambda_i = \\text{Trace}(A), \\quad \\prod_{i=1}^n \\lambda_i = \\det(A)',
    explanation: 'Trace is the sum of main diagonal elements. Determinant is 0 if and only if at least one eigenvalue is 0.',
    box: 2,
    nextReviewDate: 'Today',
    lastReviewed: '3 days ago'
  },
  {
    id: 'fc-5',
    subject: 'Databases (DBMS)',
    topic: 'Transactions',
    front: 'What type of schedule avoids Cascading Aborts (ACA)?',
    backLatex: '\\forall T_j \\text{ reading } X \\text{ written by } T_i, \\quad T_i \\text{ must commit before } T_j \\text{ reads } X',
    explanation: 'Cascaled-free schedules ensure no uncommitted data is read by other transactions.',
    box: 1,
    nextReviewDate: 'Today'
  }
];

export const DEFAULT_DAILY_TASKS: DailyTaskItem[] = [
  {
    id: 'task-1',
    title: 'Watch & Annotate: Recurrence Relations & Master Theorem',
    category: 'watch',
    durationMinutes: 28,
    completed: true,
    actionRoute: 'learn',
    xpReward: 60,
    targetTopic: 'Recurrence Relations & Asymptotic Analysis',
    targetSubject: 'Algorithms'
  },
  {
    id: 'task-2',
    title: 'Solve 5 Practice NAT Numericals: Subnetting & CIDR',
    category: 'practice',
    durationMinutes: 15,
    completed: false,
    actionRoute: 'practice',
    xpReward: 80,
    targetTopic: 'Network Layer & Subnetting',
    targetSubject: 'Computer Networks'
  },
  {
    id: 'task-3',
    title: 'Active Spaced Recall: 5 Due Flashcards & OS Semaphores',
    category: 'revise',
    durationMinutes: 12,
    completed: false,
    actionRoute: 'revision',
    xpReward: 50,
    targetTopic: 'Process Synchronization & Semaphores',
    targetSubject: 'Operating Systems'
  },
  {
    id: 'task-4',
    title: 'Audit & Re-solve: 2 Logged Mistakes in Mistake Notebook',
    category: 'reflect',
    durationMinutes: 10,
    completed: false,
    actionRoute: 'revision',
    xpReward: 70,
    targetTopic: 'Process Synchronization & Subnetting',
    targetSubject: 'Core Systems'
  }
];

export const OFFICIAL_GATE_SYLLABUS: SyllabusSubject[] = [
  {
    id: 'subj-math',
    name: 'Engineering Mathematics & Discrete Math',
    weightageMarks: 13,
    category: 'Engineering Mathematics',
    topics: [
      { id: 'math-1', name: 'Propositional & First-Order Logic', weightagePercentage: 25, status: 'mastered', pyqCount: 22 },
      { id: 'math-2', name: 'Combinatorics & Recurrence Relations', weightagePercentage: 25, status: 'in_progress', pyqCount: 19 },
      { id: 'math-3', name: 'Linear Algebra (Matrices, Eigenvalues)', weightagePercentage: 25, status: 'mastered', pyqCount: 28 },
      { id: 'math-4', name: 'Probability & Distributions (Bayes)', weightagePercentage: 25, status: 'in_progress', pyqCount: 24 }
    ]
  },
  {
    id: 'subj-os',
    name: 'Operating Systems',
    weightageMarks: 10,
    category: 'Core CS/IT',
    topics: [
      { id: 'os-1', name: 'Process Synchronization & Semaphores', weightagePercentage: 35, status: 'in_progress', pyqCount: 34, recommendedLectureId: 'vid-2' },
      { id: 'os-2', name: 'CPU Scheduling & Deadlocks', weightagePercentage: 25, status: 'mastered', pyqCount: 26 },
      { id: 'os-3', name: 'Virtual Memory, Paging & TLB', weightagePercentage: 25, status: 'in_progress', pyqCount: 31 },
      { id: 'os-4', name: 'File Systems & Disk Scheduling', weightagePercentage: 15, status: 'unvisited', pyqCount: 18 }
    ]
  },
  {
    id: 'subj-algo',
    name: 'Algorithms & Data Structures',
    weightageMarks: 12,
    category: 'Core CS/IT',
    topics: [
      { id: 'algo-1', name: 'Asymptotic Analysis & Master Theorem', weightagePercentage: 25, status: 'mastered', pyqCount: 36, recommendedLectureId: 'vid-1' },
      { id: 'algo-2', name: 'Divide & Conquer, Greedy & Dynamic Programming', weightagePercentage: 35, status: 'in_progress', pyqCount: 42 },
      { id: 'algo-3', name: 'Graph Algorithms (Dijkstra, MST, Bellman-Ford)', weightagePercentage: 25, status: 'in_progress', pyqCount: 38 },
      { id: 'algo-4', name: 'Trees, Heaps & Hashing', weightagePercentage: 15, status: 'mastered', pyqCount: 29 }
    ]
  },
  {
    id: 'subj-cn',
    name: 'Computer Networks',
    weightageMarks: 9,
    category: 'Core CS/IT',
    topics: [
      { id: 'cn-1', name: 'IPv4/IPv6, CIDR Subnetting & Routing', weightagePercentage: 40, status: 'in_progress', pyqCount: 32, recommendedLectureId: 'vid-4' },
      { id: 'cn-2', name: 'Flow Control & Error Control (TCP, Sliding Window)', weightagePercentage: 30, status: 'mastered', pyqCount: 28 },
      { id: 'cn-3', name: 'Application Layer Protocols (DNS, HTTP, SMTP)', weightagePercentage: 15, status: 'unvisited', pyqCount: 16 },
      { id: 'cn-4', name: 'Network Security & Cryptography', weightagePercentage: 15, status: 'unvisited', pyqCount: 14 }
    ]
  },
  {
    id: 'subj-dbms',
    name: 'Databases (DBMS)',
    weightageMarks: 8,
    category: 'Core CS/IT',
    topics: [
      { id: 'db-1', name: 'Transactions & Concurrency Control (2PL, Serializability)', weightagePercentage: 40, status: 'in_progress', pyqCount: 30, recommendedLectureId: 'vid-3' },
      { id: 'db-2', name: 'Relational Algebra & SQL', weightagePercentage: 30, status: 'mastered', pyqCount: 25 },
      { id: 'db-3', name: 'Normalization & Functional Dependencies', weightagePercentage: 20, status: 'in_progress', pyqCount: 27 },
      { id: 'db-4', name: 'Indexing & B/B+ Trees', weightagePercentage: 10, status: 'unvisited', pyqCount: 18 }
    ]
  },
  {
    id: 'subj-toc',
    name: 'Theory of Computation & Compiler Design',
    weightageMarks: 11,
    category: 'Core CS/IT',
    topics: [
      { id: 'toc-1', name: 'Regular Expressions & Finite Automata (DFA/NFA)', weightagePercentage: 30, status: 'mastered', pyqCount: 31 },
      { id: 'toc-2', name: 'Context-Free Grammars & Pushdown Automata', weightagePercentage: 25, status: 'in_progress', pyqCount: 24 },
      { id: 'toc-3', name: 'Turing Machines & Decidability (Halting Problem)', weightagePercentage: 25, status: 'in_progress', pyqCount: 29 },
      { id: 'toc-4', name: 'Lexical Analysis, LR Parsing & Syntax-Directed Translation', weightagePercentage: 20, status: 'unvisited', pyqCount: 22 }
    ]
  },
  {
    id: 'subj-coa',
    name: 'Computer Organization & Architecture',
    weightageMarks: 9,
    category: 'Core CS/IT',
    topics: [
      { id: 'coa-1', name: 'Instruction Pipelining & Hazards', weightagePercentage: 40, status: 'in_progress', pyqCount: 30 },
      { id: 'coa-2', name: 'Cache Memory Mapping & Miss Latencies', weightagePercentage: 35, status: 'mastered', pyqCount: 33 },
      { id: 'coa-3', name: 'Machine Instructions & Addressing Modes', weightagePercentage: 25, status: 'unvisited', pyqCount: 20 }
    ]
  },
  {
    id: 'subj-ga',
    name: 'General Aptitude (Mandatory Section)',
    weightageMarks: 15,
    category: 'General Aptitude',
    topics: [
      { id: 'ga-1', name: 'Quantitative Aptitude (Speed, Work, Geometry)', weightagePercentage: 40, status: 'mastered', pyqCount: 45 },
      { id: 'ga-2', name: 'Analytical & Spatial Reasoning (Sets, Syllogisms)', weightagePercentage: 35, status: 'mastered', pyqCount: 40 },
      { id: 'ga-3', name: 'Verbal Aptitude (Grammar, Vocabulary, Analogies)', weightagePercentage: 25, status: 'mastered', pyqCount: 35 }
    ]
  }
];

