import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  collection,
  getDocs,
  query,
  limit,
  deleteDoc
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { ErrorLogItem, MockExamPreset } from '../types';
import { StudyPlanState, UserStudyProfile } from '../utils/roadmapEngine';
import { ExamResultSummary } from '../utils/gateScoring';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore targeting the designated custom database
const databaseId = firebaseConfigJson.firestoreDatabaseId || '(default)';
export const db = getFirestore(app, databaseId);

// Test connection probe as recommended in skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network restricted.');
      return false;
    }
    // Permissions error or document missing is normal for connection probe
    return true;
  }
}

// Auth helpers
export async function signInAsGuest(): Promise<User | null> {
  let localUid = localStorage.getItem('gate_guest_uid');
  if (!localUid) {
    localUid = 'guest_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('gate_guest_uid', localUid);
  }
  return {
    uid: localUid,
    isAnonymous: true,
    displayName: 'Guest Aspirant',
    email: null,
    photoURL: null,
    emailVerified: false
  } as unknown as User;
}

export async function signInWithGoogle(): Promise<User | null> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const cred = await signInWithPopup(auth, provider);
    return cred.user;
  } catch (e: any) {
    console.warn('Google popup sign in failed:', e?.message || e);
    throw e;
  }
}

export async function signUpWithEmail(email: string, pass: string, name?: string): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (name && cred.user) {
    try {
      await updateProfile(cred.user, { displayName: name });
    } catch (e) {
      console.warn('Failed to update profile name', e);
    }
  }
  return cred.user;
}

export async function signInWithEmail(email: string, pass: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return cred.user;
}

export async function signOutUser(): Promise<void> {
  await fbSignOut(auth);
}

// Reset Cloud Data for fresh slate
export async function resetUserCloudData(userId?: string): Promise<void> {
  // If user is not authenticated in Firebase Auth (e.g. guest session), Firestore reset is not applicable
  if (!auth.currentUser || !auth.currentUser.uid) {
    return;
  }
  const effectiveUid = auth.currentUser.uid;

  try {
    const userRef = doc(db, 'users', effectiveUid);
    await setDoc(userRef, {
      uid: effectiveUid,
      targetAir: 100,
      dailyTargetHours: 6,
      xp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      totalHoursStudied: 0,
      lastActiveDate: new Date().toISOString(),
      activeSubjectIndex: 0,
      activeModuleIndex: 0,
      completedModules: [],
      updatedAt: new Date().toISOString()
    });

    // Delete error logs
    try {
      const errDocs = await getDocs(collection(db, 'users', effectiveUid, 'errorLogs'));
      for (const d of errDocs.docs) {
        await deleteDoc(d.ref);
      }
    } catch (e) {
      console.warn('Error clearing error logs during reset', e);
    }

    // Delete exam history
    try {
      const exDocs = await getDocs(collection(db, 'users', effectiveUid, 'examHistory'));
      for (const d of exDocs.docs) {
        await deleteDoc(d.ref);
      }
    } catch (e) {
      console.warn('Error clearing exam history during reset', e);
    }

    // Delete saved formulas
    try {
      const formDocs = await getDocs(collection(db, 'users', effectiveUid, 'savedFormulas'));
      for (const d of formDocs.docs) {
        await deleteDoc(d.ref);
      }
    } catch (e) {
      console.warn('Error clearing saved formulas during reset', e);
    }
  } catch (e) {
    console.warn('Notice: Could not reset user cloud data', e);
  }
}

// User Profile & Roadmap Sync
export async function syncUserProfileToCloud(userId: string, planState: StudyPlanState): Promise<void> {
  if (!auth.currentUser) return;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      uid: userId,
      branch: planState.profile.branch,
      gapYears: planState.profile.gapYears,
      dailyHours: planState.profile.dailyHours,
      targetRankBand: planState.profile.targetRankBand,
      currentStreak: planState.profile.currentStreak,
      totalHoursStudied: planState.profile.totalHoursStudied,
      xpPoints: planState.profile.xpPoints,
      level: planState.profile.level,
      phases: planState.phases,
      urgentRevisionQueue: planState.urgentRevisionQueue,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (e) {
    console.error('Failed to sync user profile to cloud', e);
  }
}

export async function loadUserProfileFromCloud(userId: string): Promise<Partial<StudyPlanState> | null> {
  if (!auth.currentUser) return null;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      profile: {
        targetExamYear: 2027,
        branch: data.branch || 'CS',
        gapYears: data.gapYears ?? 2,
        dailyHours: data.dailyHours ?? 6,
        targetRankBand: data.targetRankBand || 'AIR < 100',
        currentStreak: data.currentStreak ?? 0,
        totalHoursStudied: data.totalHoursStudied ?? 0,
        xpPoints: data.xpPoints ?? 0,
        level: data.level || 'Rookie Aspirant'
      },
      phases: data.phases,
      urgentRevisionQueue: data.urgentRevisionQueue
    };
  } catch (e) {
    console.error('Failed to load user profile from cloud', e);
    return null;
  }
}

// Mistake Notebook Sync
export async function syncErrorLogToCloud(userId: string, item: ErrorLogItem): Promise<void> {
  if (!auth.currentUser) return;
  try {
    const safeId = item.id.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const errRef = doc(db, 'users', userId, 'errorLogs', safeId);
    await setDoc(errRef, {
      id: safeId,
      userId,
      questionId: item.question.id,
      subject: item.question.subject,
      topic: item.question.topic,
      userAnswer: typeof item.userAnswer === 'string' ? item.userAnswer : JSON.stringify(item.userAnswer ?? ''),
      category: item.category,
      userNotes: item.userNotes || '',
      resolved: Boolean(item.resolved),
      timestamp: item.timestamp || new Date().toISOString()
    });
  } catch (e) {
    console.error('Failed to sync error log to cloud', e);
  }
}

export async function loadErrorLogsFromCloud(userId: string): Promise<ErrorLogItem[] | null> {
  if (!auth.currentUser) return null;
  try {
    const colRef = collection(db, 'users', userId, 'errorLogs');
    const snap = await getDocs(colRef);
    if (snap.empty) return null;
    const items: ErrorLogItem[] = [];
    snap.forEach(d => {
      const data = d.data();
      items.push({
        id: data.id,
        question: {
          id: data.questionId,
          type: 'MCQ',
          subject: data.subject,
          topic: data.topic,
          marks: 1,
          questionText: `[Mistake Item ${data.questionId}]: Review ${data.topic}`,
          correctAnswer: 'A',
          solution: 'Review syllabus principles and error notes.',
          explanation: 'Diagnosed from diagnostic exam evaluation.',
          section: 'Core Engineering'
        },
        userAnswer: data.userAnswer,
        timestamp: data.timestamp,
        category: data.category,
        userNotes: data.userNotes,
        resolved: data.resolved
      });
    });
    return items;
  } catch (e) {
    console.error('Failed to load error logs from cloud', e);
    return null;
  }
}

// Exam Result Sync
export async function syncExamResultToCloud(
  userId: string,
  examTitle: string,
  results: ExamResultSummary
): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.uid) return;
  const effectiveUid = auth.currentUser.uid;
  try {
    const examId = `exam_${Date.now()}`;
    const examRef = doc(db, 'users', effectiveUid, 'examHistory', examId);
    await setDoc(examRef, {
      id: examId,
      userId: effectiveUid,
      examTitle,
      marksObtained: results.marksObtained,
      totalMarks: results.totalMarks,
      accuracyPercentage: results.accuracyPercentage,
      predictedGateScore: results.predictedGateScore,
      estimatedAirBand: results.estimatedAirBand,
      weakTopics: results.weakTopics,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Notice: Could not sync exam result to cloud', e);
  }
}

// Custom Formulas Sync
export async function syncCustomFormulaToCloud(
  userId: string,
  formula: { title: string; category: string; latex: string; notes: string }
): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.uid) return;
  const effectiveUid = auth.currentUser.uid;
  try {
    const formulaId = `form_${Date.now()}`;
    const formRef = doc(db, 'users', effectiveUid, 'savedFormulas', formulaId);
    await setDoc(formRef, {
      id: formulaId,
      userId: effectiveUid,
      title: formula.title,
      category: formula.category,
      latex: formula.latex,
      notes: formula.notes,
      createdAt: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Notice: Could not sync custom formula to cloud', e);
  }
}

export async function loadCustomFormulasFromCloud(
  userId: string
): Promise<{ title: string; category: string; latex: string; notes: string }[] | null> {
  if (!auth.currentUser || !auth.currentUser.uid) return null;
  const effectiveUid = auth.currentUser.uid;
  try {
    const colRef = collection(db, 'users', effectiveUid, 'savedFormulas');
    const snap = await getDocs(colRef);
    if (snap.empty) return null;
    const items: { title: string; category: string; latex: string; notes: string }[] = [];
    snap.forEach(d => {
      const data = d.data();
      items.push({
        title: data.title,
        category: data.category,
        latex: data.latex,
        notes: data.notes
      });
    });
    return items;
  } catch (e) {
    console.warn('Notice: Could not load custom formulas from cloud', e);
    return null;
  }
}
