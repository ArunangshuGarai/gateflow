import React, { useState } from 'react';
import { X, RotateCcw, Delete } from 'lucide-react';

interface GateVirtualCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GateVirtualCalculator: React.FC<GateVirtualCalculatorProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [formula, setFormula] = useState('');
  const [isRad, setIsRad] = useState(true);
  const [memory, setMemory] = useState<number>(0);
  const [isNewNumber, setIsNewNumber] = useState(true);

  if (!isOpen) return null;

  const handleNum = (num: string) => {
    if (isNewNumber || display === '0') {
      setDisplay(num);
      setIsNewNumber(false);
    } else {
      setDisplay(display + num);
    }
  };

  const handleDecimal = () => {
    if (isNewNumber) {
      setDisplay('0.');
      setIsNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setFormula('');
    setIsNewNumber(true);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
      setIsNewNumber(true);
    }
  };

  const handleOp = (op: string) => {
    setFormula(prev => `${prev} ${display} ${op}`);
    setIsNewNumber(true);
  };

  const handleEquals = () => {
    try {
      const fullExpr = `${formula} ${display}`
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**');

      // Safe arithmetic evaluator
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${fullExpr})`)();
      if (!isFinite(result) || isNaN(result)) {
        setDisplay('Error');
      } else {
        setDisplay(String(Math.round(result * 100000000) / 100000000));
      }
      setFormula('');
      setIsNewNumber(true);
    } catch {
      setDisplay('Error');
      setFormula('');
      setIsNewNumber(true);
    }
  };

  const handleUnary = (func: string) => {
    const val = parseFloat(display);
    if (isNaN(val)) return;

    let res = 0;
    const angle = isRad ? val : (val * Math.PI) / 180;

    switch (func) {
      case 'sin':
        res = Math.sin(angle);
        break;
      case 'cos':
        res = Math.cos(angle);
        break;
      case 'tan':
        res = Math.tan(angle);
        break;
      case 'asin':
        res = isRad ? Math.asin(val) : (Math.asin(val) * 180) / Math.PI;
        break;
      case 'acos':
        res = isRad ? Math.acos(val) : (Math.acos(val) * 180) / Math.PI;
        break;
      case 'atan':
        res = isRad ? Math.atan(val) : (Math.atan(val) * 180) / Math.PI;
        break;
      case 'log':
        res = Math.log10(val);
        break;
      case 'ln':
        res = Math.log(val);
        break;
      case 'sqrt':
        res = Math.sqrt(val);
        break;
      case 'cbrt':
        res = Math.cbrt(val);
        break;
      case 'sqr':
        res = val * val;
        break;
      case 'cube':
        res = val * val * val;
        break;
      case '1/x':
        res = 1 / val;
        break;
      case 'fact':
        res = factorial(Math.floor(val));
        break;
      case 'exp':
        res = Math.exp(val);
        break;
      case '+/-':
        res = -val;
        break;
      default:
        res = val;
    }

    if (isNaN(res) || !isFinite(res)) {
      setDisplay('Error');
    } else {
      setDisplay(String(Math.round(res * 100000000) / 100000000));
    }
    setIsNewNumber(true);
  };

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let r = 1;
    for (let i = 2; i <= n && i <= 100; i++) r *= i;
    return r;
  };

  const handleMem = (action: string) => {
    const val = parseFloat(display) || 0;
    switch (action) {
      case 'MC':
        setMemory(0);
        break;
      case 'MR':
        setDisplay(String(memory));
        setIsNewNumber(true);
        break;
      case 'MS':
        setMemory(val);
        setIsNewNumber(true);
        break;
      case 'M+':
        setMemory(prev => prev + val);
        setIsNewNumber(true);
        break;
      case 'M-':
        setMemory(prev => prev - val);
        setIsNewNumber(true);
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden text-slate-100 font-sans">
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-slate-700 bg-slate-800 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              GATE Official Scientific Virtual Calculator (TCS iON Standard)
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close calculator"
            className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Display screen */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 text-right">
          <div className="h-5 text-xs text-slate-400 font-mono tracking-wide truncate">
            {formula || '\u00A0'}
          </div>
          <div className="text-2xl font-bold font-mono tracking-wider text-emerald-400 overflow-x-auto whitespace-nowrap">
            {display}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-400">{isRad ? 'RAD' : 'DEG'}</span>
              {memory !== 0 && <span className="bg-emerald-950 text-emerald-400 px-1 rounded text-[10px]">M: {memory}</span>}
            </div>
            <span>GATE CBT Exam Simulator</span>
          </div>
        </div>

        {/* Controls Layout */}
        <div className="p-3 bg-slate-900 grid grid-cols-6 gap-1.5 text-xs">
          {/* Mode toggle and Memory buttons */}
          <button
            type="button"
            onClick={() => setIsRad(!isRad)}
            className="bg-amber-600/30 text-amber-300 border border-amber-600/40 rounded py-2 font-semibold hover:bg-amber-600/40"
          >
            {isRad ? 'Deg' : 'Rad'}
          </button>
          <button type="button" onClick={() => handleMem('MC')} className="bg-slate-800 text-slate-300 rounded py-2 hover:bg-slate-700">MC</button>
          <button type="button" onClick={() => handleMem('MR')} className="bg-slate-800 text-slate-300 rounded py-2 hover:bg-slate-700">MR</button>
          <button type="button" onClick={() => handleMem('MS')} className="bg-slate-800 text-slate-300 rounded py-2 hover:bg-slate-700">MS</button>
          <button type="button" onClick={() => handleMem('M+')} className="bg-slate-800 text-slate-300 rounded py-2 hover:bg-slate-700">M+</button>
          <button type="button" onClick={() => handleMem('M-')} className="bg-slate-800 text-slate-300 rounded py-2 hover:bg-slate-700">M-</button>

          {/* Row 2: Trig & Log */}
          <button type="button" onClick={() => handleUnary('sin')} className="bg-slate-800 text-indigo-300 rounded py-2 hover:bg-slate-700 font-mono">sin</button>
          <button type="button" onClick={() => handleUnary('cos')} className="bg-slate-800 text-indigo-300 rounded py-2 hover:bg-slate-700 font-mono">cos</button>
          <button type="button" onClick={() => handleUnary('tan')} className="bg-slate-800 text-indigo-300 rounded py-2 hover:bg-slate-700 font-mono">tan</button>
          <button type="button" onClick={() => handleUnary('ln')} className="bg-slate-800 text-indigo-300 rounded py-2 hover:bg-slate-700 font-mono">ln</button>
          <button type="button" onClick={() => handleUnary('log')} className="bg-slate-800 text-indigo-300 rounded py-2 hover:bg-slate-700 font-mono">log<sub>10</sub></button>
          <button type="button" onClick={handleClear} className="bg-rose-900/40 text-rose-300 border border-rose-800/50 rounded py-2 font-bold hover:bg-rose-900/60 flex items-center justify-center gap-1">
            <RotateCcw size={13} /> C
          </button>

          {/* Row 3: Inverse trig & powers */}
          <button type="button" onClick={() => handleUnary('asin')} className="bg-slate-800 text-indigo-300 rounded py-2 hover:bg-slate-700 font-mono">sin<sup>-1</sup></button>
          <button type="button" onClick={() => handleUnary('acos')} className="bg-slate-800 text-indigo-300 rounded py-2 hover:bg-slate-700 font-mono">cos<sup>-1</sup></button>
          <button type="button" onClick={() => handleUnary('atan')} className="bg-slate-800 text-indigo-300 rounded py-2 hover:bg-slate-700 font-mono">tan<sup>-1</sup></button>
          <button type="button" onClick={() => handleUnary('exp')} className="bg-slate-800 text-indigo-300 rounded py-2 hover:bg-slate-700 font-mono">e<sup>x</sup></button>
          <button type="button" onClick={() => handleOp('^')} className="bg-slate-800 text-indigo-300 rounded py-2 hover:bg-slate-700 font-mono">x<sup>y</sup></button>
          <button type="button" onClick={handleBackspace} aria-label="Backspace" className="bg-slate-800 text-amber-300 rounded py-2 hover:bg-slate-700 flex items-center justify-center">
            <Delete size={14} />
          </button>

          {/* Row 4: Sqrt, Fact, 7 8 9, / */}
          <button type="button" onClick={() => handleUnary('sqrt')} className="bg-slate-800 text-indigo-300 rounded py-2 hover:bg-slate-700 font-mono">&radic;x</button>
          <button type="button" onClick={() => handleUnary('sqr')} className="bg-slate-800 text-indigo-300 rounded py-2 hover:bg-slate-700 font-mono">x<sup>2</sup></button>
          <button type="button" onClick={() => handleNum('7')} className="bg-slate-700/80 hover:bg-slate-600 text-white font-bold rounded py-2 text-sm">7</button>
          <button type="button" onClick={() => handleNum('8')} className="bg-slate-700/80 hover:bg-slate-600 text-white font-bold rounded py-2 text-sm">8</button>
          <button type="button" onClick={() => handleNum('9')} className="bg-slate-700/80 hover:bg-slate-600 text-white font-bold rounded py-2 text-sm">9</button>
          <button type="button" onClick={() => handleOp('÷')} className="bg-cyan-900/40 text-cyan-300 border border-cyan-800/40 rounded py-2 font-bold hover:bg-cyan-900/60 text-sm">÷</button>

          {/* Row 5: 1/x, fact, 4 5 6, * */}
          <button type="button" onClick={() => handleUnary('1/x')} className="bg-slate-800 text-indigo-300 rounded py-2 hover:bg-slate-700 font-mono">1/x</button>
          <button type="button" onClick={() => handleUnary('fact')} className="bg-slate-800 text-indigo-300 rounded py-2 hover:bg-slate-700 font-mono">n!</button>
          <button type="button" onClick={() => handleNum('4')} className="bg-slate-700/80 hover:bg-slate-600 text-white font-bold rounded py-2 text-sm">4</button>
          <button type="button" onClick={() => handleNum('5')} className="bg-slate-700/80 hover:bg-slate-600 text-white font-bold rounded py-2 text-sm">5</button>
          <button type="button" onClick={() => handleNum('6')} className="bg-slate-700/80 hover:bg-slate-600 text-white font-bold rounded py-2 text-sm">6</button>
          <button type="button" onClick={() => handleOp('×')} className="bg-cyan-900/40 text-cyan-300 border border-cyan-800/40 rounded py-2 font-bold hover:bg-cyan-900/60 text-sm">×</button>

          {/* Row 6: pi, mod, 1 2 3, - */}
          <button type="button" onClick={() => { setDisplay(String(Math.PI)); setIsNewNumber(true); }} className="bg-slate-800 text-indigo-300 rounded py-2 hover:bg-slate-700 font-mono">π</button>
          <button type="button" onClick={() => handleOp('%')} className="bg-slate-800 text-indigo-300 rounded py-2 hover:bg-slate-700 font-mono">mod</button>
          <button type="button" onClick={() => handleNum('1')} className="bg-slate-700/80 hover:bg-slate-600 text-white font-bold rounded py-2 text-sm">1</button>
          <button type="button" onClick={() => handleNum('2')} className="bg-slate-700/80 hover:bg-slate-600 text-white font-bold rounded py-2 text-sm">2</button>
          <button type="button" onClick={() => handleNum('3')} className="bg-slate-700/80 hover:bg-slate-600 text-white font-bold rounded py-2 text-sm">3</button>
          <button type="button" onClick={() => handleOp('-')} className="bg-cyan-900/40 text-cyan-300 border border-cyan-800/40 rounded py-2 font-bold hover:bg-cyan-900/60 text-sm">−</button>

          {/* Row 7: +/-, brackets, 0, ., +, = */}
          <button type="button" onClick={() => handleUnary('+/-')} className="bg-slate-800 text-indigo-300 rounded py-2 hover:bg-slate-700 font-mono">±</button>
          <button type="button" onClick={() => handleNum('0')} className="bg-slate-700/80 hover:bg-slate-600 text-white font-bold rounded py-2 text-sm">0</button>
          <button type="button" onClick={handleDecimal} className="bg-slate-700/80 hover:bg-slate-600 text-white font-bold rounded py-2 text-sm">.</button>
          <button type="button" onClick={() => handleOp('+')} className="bg-cyan-900/40 text-cyan-300 border border-cyan-800/40 rounded py-2 font-bold hover:bg-cyan-900/60 text-sm">+</button>
          <button
            type="button"
            onClick={handleEquals}
            className="col-span-2 bg-emerald-600 text-white font-bold rounded py-2 text-base hover:bg-emerald-500 shadow-md"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};
