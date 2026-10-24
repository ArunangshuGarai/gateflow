import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateAnswer,
  calculateQuestionMarks,
  calculateExamResults,
  QuestionSubmission
} from './gateScoring';
import {
  generateInitialRoadmap,
  injectExamFeedbackIntoRoadmap,
  StudyPlanState
} from './roadmapEngine';

test('GATE answer evaluation: MCQ checks single exact string', () => {
  assert.equal(evaluateAnswer('MCQ', 'B', 'B'), true);
  assert.equal(evaluateAnswer('MCQ', 'b', 'B'), true);
  assert.equal(evaluateAnswer('MCQ', 'C', 'B'), false);
  assert.equal(evaluateAnswer('MCQ', null, 'B'), false);
});

test('GATE answer evaluation: MSQ checks exact multi-select match without order dependency', () => {
  assert.equal(evaluateAnswer('MSQ', ['A', 'C'], ['C', 'A']), true);
  assert.equal(evaluateAnswer('MSQ', ['A'], ['A', 'C']), false);
  assert.equal(evaluateAnswer('MSQ', ['A', 'B', 'C'], ['A', 'C']), false);
});

test('GATE answer evaluation: NAT checks numerical range with tolerance', () => {
  assert.equal(evaluateAnswer('NAT', 4.52, 4.5, 0.05), true);
  assert.equal(evaluateAnswer('NAT', '4.55', 4.5, 0.1), true);
  assert.equal(evaluateAnswer('NAT', '4.8', 4.5, 0.1), false);
});

test('GATE marking scheme: negative marking rules for MCQ vs MSQ vs NAT', () => {
  // 1-mark MCQ wrong: -1/3 penalty
  const mcq1Wrong = calculateQuestionMarks('MCQ', 1, false, true);
  assert.equal(Math.round(mcq1Wrong.deducted * 100) / 100, 0.33);

  // 2-mark MCQ wrong: -2/3 penalty
  const mcq2Wrong = calculateQuestionMarks('MCQ', 2, false, true);
  assert.equal(Math.round(mcq2Wrong.deducted * 100) / 100, 0.67);

  // MSQ wrong: NO negative penalty in GATE
  const msqWrong = calculateQuestionMarks('MSQ', 2, false, true);
  assert.equal(msqWrong.deducted, 0);

  // NAT wrong: NO negative penalty in GATE
  const natWrong = calculateQuestionMarks('NAT', 2, false, true);
  assert.equal(natWrong.deducted, 0);

  // Unattempted: 0 penalty
  const unattempted = calculateQuestionMarks('MCQ', 2, false, false);
  assert.equal(unattempted.deducted, 0);
  assert.equal(unattempted.gained, 0);
});

test('Exam result calculation accurately computes total score and flags weak topics', () => {
  const submissions: QuestionSubmission[] = [
    {
      questionId: 'q1',
      type: 'MCQ',
      marks: 1,
      userAnswer: 'A',
      correctAnswer: 'A',
      subject: 'Algorithms',
      topic: 'Recurrence Relations'
    },
    {
      questionId: 'q2',
      type: 'MCQ',
      marks: 2,
      userAnswer: 'B',
      correctAnswer: 'C', // wrong: -0.67
      subject: 'Algorithms',
      topic: 'Recurrence Relations'
    },
    {
      questionId: 'q3',
      type: 'NAT',
      marks: 2,
      userAnswer: '10',
      correctAnswer: '10', // correct: +2
      tolerance: 0,
      subject: 'Operating Systems',
      topic: 'Process Synchronization'
    }
  ];

  const results = calculateExamResults(submissions);
  assert.equal(results.totalQuestions, 3);
  assert.equal(results.attempted, 3);
  assert.equal(results.correct, 2);
  assert.equal(results.incorrect, 1);
  // Marks: 1 + 2 - 0.6667 = 2.33
  assert.equal(results.marksObtained, 2.33);
  // Algorithms had 1 correct out of 2 (50% accuracy) -> flagged as weak topic
  assert.ok(results.weakTopics.includes('Recurrence Relations'));
});

test('Adaptive roadmap connects exam feedback and promotes weak topics to urgent queue', () => {
  const initialPhases = generateInitialRoadmap('CS');
  const planState: StudyPlanState = {
    profile: {
      targetExamYear: 2027,
      branch: 'CS',
      gapYears: 2,
      dailyHours: 6,
      targetRankBand: 'AIR < 100',
      currentStreak: 5,
      totalHoursStudied: 40,
      xpPoints: 450,
      level: 'Consistent Warrior'
    },
    phases: initialPhases,
    urgentRevisionQueue: []
  };

  const topicBreakdown = {
    'Process Synchronization, Semaphores & Deadlocks': {
      total: 3,
      correct: 0,
      incorrect: 3,
      accuracy: 0,
      subject: 'Operating Systems'
    }
  };

  const updatedPlan = injectExamFeedbackIntoRoadmap(
    planState,
    ['Process Synchronization, Semaphores & Deadlocks'],
    topicBreakdown
  );

  // Must have injected urgent revision item
  assert.equal(updatedPlan.urgentRevisionQueue.length, 1);
  assert.equal(updatedPlan.urgentRevisionQueue[0].topic, 'Process Synchronization, Semaphores & Deadlocks');

  // Node status should be updated to urgent_priority
  const osNode = updatedPlan.phases[1].nodes.find(n => n.id === 'cs-os-1');
  assert.equal(osNode?.status, 'urgent_priority');
});
