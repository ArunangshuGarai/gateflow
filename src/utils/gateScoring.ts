/**
 * GATE Examination Scoring & Projection Logic
 * Pure functions decoupled for fast unit testing.
 */

export interface QuestionSubmission {
  questionId: string;
  type: 'MCQ' | 'MSQ' | 'NAT';
  marks: 1 | 2;
  userAnswer: string | string[] | number | null;
  correctAnswer: string | string[] | number;
  tolerance?: number; // For NAT questions (e.g., +/- 0.1)
  subject: string;
  topic: string;
}

export interface ExamResultSummary {
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  marksObtained: number;
  negativeMarks: number;
  totalMarks: number;
  accuracyPercentage: number;
  predictedGateScore: number; // 100 to 1000 scale
  estimatedAirBand: string;
  topicBreakdown: Record<string, { total: number; correct: number; incorrect: number; accuracy: number; subject: string }>;
  weakTopics: string[];
}

/**
 * Checks if a user's answer is correct based on question type
 */
export function evaluateAnswer(
  type: 'MCQ' | 'MSQ' | 'NAT',
  userAnswer: string | string[] | number | null,
  correctAnswer: string | string[] | number,
  tolerance: number = 0
): boolean {
  if (userAnswer === null || userAnswer === undefined || userAnswer === '') {
    return false;
  }

  if (type === 'MCQ') {
    return String(userAnswer).trim().toUpperCase() === String(correctAnswer).trim().toUpperCase();
  }

  if (type === 'MSQ') {
    if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) {
      return false;
    }
    const userSorted = [...userAnswer].map(s => String(s).trim().toUpperCase()).sort();
    const correctSorted = [...correctAnswer].map(s => String(s).trim().toUpperCase()).sort();
    if (userSorted.length !== correctSorted.length) return false;
    return userSorted.every((val, idx) => val === correctSorted[idx]);
  }

  if (type === 'NAT') {
    const userNum = typeof userAnswer === 'number' ? userAnswer : parseFloat(String(userAnswer));
    const correctNum = typeof correctAnswer === 'number' ? correctAnswer : parseFloat(String(correctAnswer));
    if (isNaN(userNum) || isNaN(correctNum)) return false;
    return Math.abs(userNum - correctNum) <= tolerance;
  }

  return false;
}

/**
 * Calculates score for a single question following strict GATE marking scheme:
 * - 1-mark MCQ: +1 for correct, -1/3 for wrong
 * - 2-mark MCQ: +2 for correct, -2/3 for wrong
 * - MSQ: +1 or +2 for correct, 0 for wrong (NO negative marking, NO partial marking)
 * - NAT: +1 or +2 for correct, 0 for wrong (NO negative marking)
 */
export function calculateQuestionMarks(
  type: 'MCQ' | 'MSQ' | 'NAT',
  marks: 1 | 2,
  isCorrect: boolean,
  isAttempted: boolean
): { gained: number; deducted: number } {
  if (!isAttempted) {
    return { gained: 0, deducted: 0 };
  }

  if (isCorrect) {
    return { gained: marks, deducted: 0 };
  }

  // Incorrect answer penalty
  if (type === 'MCQ') {
    const deduction = marks === 1 ? 1 / 3 : 2 / 3;
    return { gained: 0, deducted: deduction };
  }

  // MSQ and NAT have zero negative penalty
  return { gained: 0, deducted: 0 };
}

/**
 * Evaluates an entire submission and generates GATE performance metrics
 */
export function calculateExamResults(submissions: QuestionSubmission[]): ExamResultSummary {
  let marksObtained = 0;
  let negativeMarks = 0;
  let correct = 0;
  let incorrect = 0;
  let attempted = 0;
  let totalMarks = 0;

  const topicBreakdown: Record<string, { total: number; correct: number; incorrect: number; accuracy: number; subject: string }> = {};

  for (const sub of submissions) {
    totalMarks += sub.marks;
    const isAttempted = sub.userAnswer !== null && sub.userAnswer !== undefined && sub.userAnswer !== '' &&
      !(Array.isArray(sub.userAnswer) && sub.userAnswer.length === 0);

    if (isAttempted) {
      attempted++;
    }

    const isCorrect = evaluateAnswer(sub.type, sub.userAnswer, sub.correctAnswer, sub.tolerance || 0);
    const { gained, deducted } = calculateQuestionMarks(sub.type, sub.marks, isCorrect, isAttempted);

    if (isAttempted) {
      if (isCorrect) {
        correct++;
        marksObtained += gained;
      } else {
        incorrect++;
        negativeMarks += deducted;
        marksObtained -= deducted;
      }
    }

    if (!topicBreakdown[sub.topic]) {
      topicBreakdown[sub.topic] = { total: 0, correct: 0, incorrect: 0, accuracy: 0, subject: sub.subject };
    }
    topicBreakdown[sub.topic].total += 1;
    if (isAttempted) {
      if (isCorrect) topicBreakdown[sub.topic].correct += 1;
      else topicBreakdown[sub.topic].incorrect += 1;
    }
  }

  // Final round to 2 decimals
  marksObtained = Math.max(0, Math.round(marksObtained * 100) / 100);
  negativeMarks = Math.round(negativeMarks * 100) / 100;
  const unattempted = submissions.length - attempted;
  const accuracyPercentage = attempted > 0 ? Math.round((correct / attempted) * 1000) / 10 : 0;

  // Calculate topic accuracy and weak topics (accuracy < 60% or unattempted high)
  const weakTopics: string[] = [];
  for (const [topic, stats] of Object.entries(topicBreakdown)) {
    stats.accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    if (stats.accuracy < 60 || stats.incorrect >= 2) {
      weakTopics.push(topic);
    }
  }

  // GATE Score formula approximation:
  // Qualifying mark ~ 28-32, Top marks ~ 90-95
  // Score ranges roughly 350 (qualifying) to 1000 (AIR 1)
  let predictedGateScore = 150;
  let estimatedAirBand = 'Needs Fundamental Brushup';

  if (totalMarks > 0) {
    const normalizedMarks = (marksObtained / totalMarks) * 100;
    if (normalizedMarks >= 80) {
      predictedGateScore = Math.min(1000, Math.round(850 + (normalizedMarks - 80) * 7.5));
      estimatedAirBand = 'AIR 1 - 50 (Dream IISc / IIT Bombay)';
    } else if (normalizedMarks >= 65) {
      predictedGateScore = Math.round(720 + (normalizedMarks - 65) * 8.6);
      estimatedAirBand = 'AIR 50 - 250 (Top IITs & PSUs)';
    } else if (normalizedMarks >= 50) {
      predictedGateScore = Math.round(580 + (normalizedMarks - 50) * 9.3);
      estimatedAirBand = 'AIR 250 - 800 (New IITs & NITs)';
    } else if (normalizedMarks >= 35) {
      predictedGateScore = Math.round(420 + (normalizedMarks - 35) * 10.6);
      estimatedAirBand = 'AIR 800 - 2500 (Qualified)';
    } else if (normalizedMarks >= 25) {
      predictedGateScore = Math.round(300 + (normalizedMarks - 25) * 12);
      estimatedAirBand = 'Near Qualifying Cutoff';
    } else {
      predictedGateScore = Math.round(150 + normalizedMarks * 6);
      estimatedAirBand = 'Foundational Phase (Focus on High-Yield)';
    }
  }

  return {
    totalQuestions: submissions.length,
    attempted,
    correct,
    incorrect,
    unattempted,
    marksObtained,
    negativeMarks,
    totalMarks,
    accuracyPercentage,
    predictedGateScore,
    estimatedAirBand,
    topicBreakdown,
    weakTopics
  };
}
