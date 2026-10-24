import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Flame, Zap, Shield, Sparkles } from 'lucide-react';

interface DeepWorkFocusHubProps {
  onAddStudyHours: (hours: number) => void;
  onAddXp: (amount: number, reason: string) => void;
}

export const DeepWorkFocusHub: React.FC<DeepWorkFocusHubProps> = ({ onAddStudyHours, onAddXp }) => {
  const [timerMode, setTimerMode] = useState<'pomodoro' | 'shortBreak' | 'deepSprint'>('pomodoro');
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundMode, setSoundMode] = useState<'off' | 'brown' | 'binaural' | 'tick'>('off');
  const [cyclesCompleted, setCyclesCompleted] = useState<number>(0);

  // Web Audio Context for synthesizer
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundNodesRef = useRef<{ oscillator?: OscillatorNode; gainNode?: GainNode; noiseNode?: AudioBufferSourceNode } | null>(null);

  // Set initial time when mode changes
  const switchMode = (mode: 'pomodoro' | 'shortBreak' | 'deepSprint') => {
    setTimerMode(mode);
    setIsRunning(false);
    if (mode === 'pomodoro') setSecondsLeft(25 * 60);
    else if (mode === 'shortBreak') setSecondsLeft(5 * 60);
    else if (mode === 'deepSprint') setSecondsLeft(50 * 60);
  };

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            handleCycleFinish();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timerMode]);

  const handleCycleFinish = () => {
    setCyclesCompleted(prev => prev + 1);
    if (timerMode === 'pomodoro') {
      onAddStudyHours(0.42);
      onAddXp(60, 'Completed 25-Minute High-Intensity Focus Drill');
      switchMode('shortBreak');
    } else if (timerMode === 'deepSprint') {
      onAddStudyHours(0.85);
      onAddXp(120, 'Completed 50-Minute Deep Sprint');
      switchMode('shortBreak');
    } else {
      switchMode('pomodoro');
    }
  };

  // Web Audio ambient sound synthesizer
  useEffect(() => {
    // Stop any existing sound
    if (soundNodesRef.current) {
      try {
        soundNodesRef.current.oscillator?.stop();
        soundNodesRef.current.noiseNode?.stop();
      } catch (e) {}
      soundNodesRef.current = null;
    }

    if (soundMode === 'off') return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
      masterGain.connect(ctx.destination);

      if (soundMode === 'binaural') {
        // Binaural 40Hz Gamma wave for sharp focus
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.frequency.setValueAtTime(200, ctx.currentTime);
        osc2.frequency.setValueAtTime(240, ctx.currentTime); // 40Hz beat
        osc1.connect(masterGain);
        osc2.connect(masterGain);
        osc1.start();
        osc2.start();
        soundNodesRef.current = { oscillator: osc1, gainNode: masterGain };
      } else if (soundMode === 'brown') {
        // Synthesize smooth brown noise
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;
        whiteNoise.connect(masterGain);
        whiteNoise.start();
        soundNodesRef.current = { noiseNode: whiteNoise, gainNode: masterGain };
      }
    } catch (e) {
      console.warn('Audio synthesis warning:', e);
    }

    return () => {
      try {
        soundNodesRef.current?.oscillator?.stop();
        soundNodesRef.current?.noiseNode?.stop();
      } catch (e) {}
    };
  }, [soundMode]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent =
    timerMode === 'pomodoro'
      ? ((25 * 60 - secondsLeft) / (25 * 60)) * 100
      : timerMode === 'deepSprint'
      ? ((50 * 60 - secondsLeft) / (50 * 60)) * 100
      : ((5 * 60 - secondsLeft) / (5 * 60)) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl text-center space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Flame size={14} /> High-Intensity Deep Work Cockpit
          </div>
          <h2 className="text-2xl font-black text-white">GATE 2027 Unbroken Focus Zone</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            Zero tab switching. Zero social media. Pure concept absorption and problem cracking.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
          <button
            onClick={() => switchMode('pomodoro')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timerMode === 'pomodoro' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            25m Sprint
          </button>
          <button
            onClick={() => switchMode('deepSprint')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timerMode === 'deepSprint' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            50m Deep Block
          </button>
          <button
            onClick={() => switchMode('shortBreak')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timerMode === 'shortBreak' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            5m Recovery
          </button>
        </div>

        {/* Big Circular / Radial Timer */}
        <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="110"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-800 fill-none"
            />
            <circle
              cx="128"
              cy="128"
              r="110"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={2 * Math.PI * 110}
              strokeDashoffset={2 * Math.PI * 110 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              className={`fill-none transition-all duration-1000 ${
                timerMode === 'shortBreak' ? 'text-emerald-500' : 'text-indigo-500'
              }`}
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-black font-mono tracking-wider text-white">
              {formatTime(secondsLeft)}
            </span>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-mono mt-1">
              {isRunning ? 'Session Active' : 'Paused'}
            </span>
            <span className="text-[11px] text-indigo-400 font-bold mt-1">
              {cyclesCompleted} Completed Today
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-3 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2 transition-transform active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause size={18} /> Pause Focus
              </>
            ) : (
              <>
                <Play size={18} /> Ignite Focus
              </>
            )}
          </button>

          <button
            onClick={() => switchMode(timerMode)}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        {/* Ambient Synthesizer Sound Selector */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-left">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span className="flex items-center gap-1.5">
              <Volume2 size={15} className="text-indigo-400" /> Focus Soundscape (Synthesized Offline)
            </span>
            <span className="text-[10px] text-slate-500 uppercase font-mono">No Distraction Audio</span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => setSoundMode('off')}
              className={`py-2 rounded-lg border text-xs font-semibold ${
                soundMode === 'off'
                  ? 'bg-slate-800 border-slate-600 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Silence
            </button>
            <button
              onClick={() => setSoundMode('brown')}
              className={`py-2 rounded-lg border text-xs font-semibold ${
                soundMode === 'brown'
                  ? 'bg-amber-950 border-amber-600 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Brown Noise
            </button>
            <button
              onClick={() => setSoundMode('binaural')}
              className={`py-2 rounded-lg border text-xs font-semibold ${
                soundMode === 'binaural'
                  ? 'bg-indigo-950 border-indigo-600 text-indigo-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              40Hz Binaural
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
