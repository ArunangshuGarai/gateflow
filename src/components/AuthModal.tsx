import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

type AuthMode = 'signin' | 'signup' | 'otp';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // OTP state
  const [otpStep, setOtpStep] = useState<'input_email' | 'enter_code'>('input_email');
  const [otpCode, setOtpCode] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Google Auth (Chrome accounts)
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const user = await signInWithGoogle();
      if (user) {
        onSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign in failed. Please check browser popups or try guest sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Email & Password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'signup') {
        if (!email || !password) throw new Error('Email and password are required');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');
        const user = await signUpWithEmail(email, password, displayName || 'GATE Candidate');
        onSuccess(user);
        onClose();
      } else if (mode === 'signin') {
        if (!email || !password) throw new Error('Email and password are required');
        const user = await signInWithEmail(email, password);
        onSuccess(user);
        onClose();
      }
    } catch (err: any) {
      let msg = err.message || 'Authentication failed';
      if (msg.includes('user-not-found')) msg = 'No account found with this email. Please sign up first.';
      if (msg.includes('wrong-password') || msg.includes('invalid-credential')) msg = 'Invalid email or password.';
      if (msg.includes('email-already-in-use')) msg = 'An account already exists with this email. Please sign in instead.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Dispatch OTP
  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address to receive your OTP code.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setOtpStep('enter_code');
        setOtpSuccessMsg(`6-digit verification code sent to ${email}`);
        if (data.devOtp) setDevOtpHint(data.devOtp);
      } else {
        throw new Error(data.message || 'Failed to send OTP code');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to generate OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP & Sign In
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 6) {
      setErrorMsg('Please enter the complete 6-digit OTP code.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      });
      const data = await res.json();
      if (data.success && data.verified) {
        // Sign in anonymously and set user profile identifier to this verified email
        const user = await signInAsGuest();
        if (user) {
          onSuccess(user);
          onClose();
        }
      } else {
        throw new Error(data.message || 'Invalid or expired OTP code.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-[#111318] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5 text-slate-100 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#A3E635]" />
              <span>Candidate Portal Access</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sync your study roadmap, mock exams &amp; mistake binder across devices
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Google One-Click CTA */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-[#1b2029] hover:bg-[#222731] border border-slate-700/80 hover:border-indigo-500 text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-md group active:scale-98 disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google Account</span>
          </button>

          <div className="flex items-center gap-2 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
            <div className="grow h-px bg-slate-800" />
            <span>or with email</span>
            <div className="grow h-px bg-slate-800" />
          </div>
        </div>

        {/* Navigation Tabs (Sign In / Sign Up / Email OTP) */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`py-1.5 rounded-lg transition-colors ${
              mode === 'signin' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`py-1.5 rounded-lg transition-colors ${
              mode === 'signup' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('otp');
              setErrorMsg(null);
              setOtpStep('input_email');
            }}
            className={`py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${
              mode === 'otp' ? 'bg-[#A3E635] text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound size={12} /> Email OTP
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-200 text-xs p-3 rounded-xl flex items-start gap-2">
            <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mode 1 & 2: Email & Password Form */}
        {(mode === 'signin' || mode === 'signup') && (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Candidate Name</label>
                <div className="relative">
                  <UserIcon size={14} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Arunangshu Garai"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@gate2027.edu"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs text-white focus:outline-hidden focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg transition-transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : mode === 'signup' ? (
                <>
                  <span>Create GATE 2027 Account</span> <ArrowRight size={14} />
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span> <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Mode 3: OTP Verification Form */}
        {mode === 'otp' && (
          <div className="space-y-3.5">
            {otpStep === 'input_email' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Email Address for OTP</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#A3E635]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="w-full bg-[#A3E635] hover:bg-[#8fd028] text-slate-950 font-extrabold text-xs py-2.5 rounded-xl shadow-lg transition-transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isLoading ? <span>Generating Code...</span> : <span>Send 6-Digit OTP Code</span>}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {otpSuccessMsg && (
                  <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs p-2.5 rounded-xl flex items-center gap-2">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                    <span>{otpSuccessMsg}</span>
                  </div>
                )}

                {devOtpHint && (
                  <div className="bg-indigo-950/40 border border-indigo-800/80 p-2.5 rounded-xl text-xs flex items-center justify-between text-indigo-300">
                    <span>Dev Verification Code:</span>
                    <strong className="font-mono text-sm tracking-widest text-[#A3E635] bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      {devOtpHint}
                    </strong>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Enter 6-Digit Code</label>
                  <div className="relative">
                    <KeyRound size={14} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-center font-mono text-base tracking-widest font-bold text-white focus:outline-hidden focus:border-[#A3E635]"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpStep('input_email');
                      setOtpCode('');
                    }}
                    className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2.5 rounded-xl transition-colors font-medium"
                  >
                    Change Email
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={isLoading || otpCode.length < 6}
                    className="w-2/3 bg-[#A3E635] hover:bg-[#8fd028] text-slate-950 font-extrabold text-xs py-2.5 rounded-xl shadow-lg transition-transform active:scale-98 disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Verify & Log In'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-[11px] text-slate-500 text-center pt-1 border-t border-slate-800/80">
          Your credentials and preparation data are protected under Firebase zero-trust Firestore rules.
        </div>
      </div>
    </div>
  );
};
