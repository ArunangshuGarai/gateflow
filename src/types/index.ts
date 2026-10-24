export type QuestionType = 'MCQ' | 'MSQ' | 'NAT';

export interface GateQuestion {
  id: string;
  section: 'General Aptitude' | 'Core Engineering';
  type: QuestionType;
  marks: 1 | 2;
  subject: string;
  topic: string;
  questionText: string;
  options?: string[]; // For MCQ & MSQ
  correctAnswer: string | string[] | number;
  tolerance?: number; // For NAT
  solution: string;
  explanation: string;
  pyqYear?: number;
}

export type QuestionStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked_for_review' | 'answered_marked';

export interface UserAnswerRecord {
  questionId: string;
  answer: string | string[] | number | null;
  status: QuestionStatus;
  timeSpentSeconds: number;
}

export interface TranscriptItem {
  timeSeconds: number;
  timestamp: string;
  title: string;
  text: string;
}

export interface CuratedVideo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  videoNumber?: string;
  youtubeId: string;
  subject: string;
  topic: string;
  keyFormulas: string[];
  description: string;
  transcript?: TranscriptItem[];
}

export interface VideoNote {
  id: string;
  videoId: string;
  videoTitle: string;
  timestamp: string;
  noteText: string;
  formulaLatex?: string;
  createdAt: string;
}

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  type: 'urgent' | 'motivational' | 'revision' | 'milestone';
  read: boolean;
  actionRoute?: string;
}

export type ErrorCategory = 'conceptual_gap' | 'formula_lapse' | 'calculation_calc_error' | 'silly_reading_trap';

export interface ErrorLogItem {
  id: string;
  question: GateQuestion;
  userAnswer: string | string[] | number | null;
  timestamp: string;
  category: ErrorCategory;
  userNotes?: string;
  resolved: boolean;
}

export interface MockExamPreset {
  id: string;
  title: string;
  category: 'Full Mock' | 'Subject Test' | 'PYQ Year Paper' | 'Speed Drill';
  questionCount: number;
  durationMinutes: number;
  totalMarks: number;
  description: string;
  questions: GateQuestion[];
}

export interface FlashcardItem {
  id: string;
  subject: string;
  topic: string;
  front: string;
  backLatex: string;
  explanation: string;
  box: 1 | 2 | 3 | 4; // Leitner box interval
  nextReviewDate: string;
  lastReviewed?: string;
}

export interface DailyTaskItem {
  id: string;
  title: string;
  category: 'watch' | 'practice' | 'revise' | 'reflect';
  durationMinutes: number;
  completed: boolean;
  actionRoute: string;
  xpReward: number;
  targetTopic: string;
  targetSubject: string;
}

export interface SyllabusTopic {
  id: string;
  name: string;
  weightagePercentage: number;
  status: 'mastered' | 'in_progress' | 'unvisited';
  pyqCount: number;
  recommendedLectureId?: string;
}

export interface SyllabusSubject {
  id: string;
  name: string;
  weightageMarks: number;
  category: 'General Aptitude' | 'Engineering Mathematics' | 'Core CS/IT';
  topics: SyllabusTopic[];
}

