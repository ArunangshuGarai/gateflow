import React, { useState } from 'react';
import { BookOpen, Copy, Check, Download, Plus, Search, Sparkles } from 'lucide-react';
import { INITIAL_FORMULAS } from '../data/gateCuratedContent';
import { FormattedMathText } from './MathView';

interface FormulaVaultProps {
  customNotes: { title: string; category: string; latex: string; notes: string }[];
  onAddCustomFormula: (formula: { category: string; title: string; latex: string; notes: string }) => void;
}

export const FormulaVault: React.FC<FormulaVaultProps> = ({ customNotes, onAddCustomFormula }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New formula form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Algorithms & Data Structures');
  const [newLatex, setNewLatex] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const allFormulas = [
    ...INITIAL_FORMULAS,
    ...customNotes.map(n => ({
      category: n.category,
      title: n.title,
      latex: n.latex,
      notes: n.notes
    }))
  ];

  const categories = ['All', ...Array.from(new Set(allFormulas.map(f => f.category)))];

  const filtered = allFormulas.filter(f => {
    const matchesCategory = activeCategory === 'All' || f.category === activeCategory;
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = (latex: string, idx: number) => {
    navigator.clipboard.writeText(latex);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLatex.trim()) return;
    onAddCustomFormula({
      category: newCategory,
      title: newTitle,
      latex: newLatex,
      notes: newNotes
    });
    setNewTitle('');
    setNewLatex('');
    setNewNotes('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
            <BookOpen size={14} />
            GATE 2027 KaTeX Formula &amp; Theorem Vault
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">High-Yield Formula Compendium</h2>
          <p className="text-xs text-slate-400">
            Formatted with LaTeX. Review daily to ensure zero formula confusion in 2-mark NAT numericals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} /> Add Formula
          </button>
          <button
            onClick={() => window.print()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download size={14} /> Export / Print PDF
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 text-xs">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search formulas or keywords..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((formula, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded">
                {formula.category}
              </span>
              <button
                onClick={() => handleCopy(formula.latex, idx)}
                className="text-slate-400 hover:text-white text-xs flex items-center gap-1 p-1 rounded hover:bg-slate-800"
                title="Copy LaTeX formula"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400 text-[10px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span className="text-[10px]">LaTeX</span>
                  </>
                )}
              </button>
            </div>

            <h4 className="font-bold text-white text-sm">{formula.title}</h4>

            {/* LaTeX Display */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 overflow-x-auto text-center py-4">
              <FormattedMathText text={`$$${formula.latex}$$`} />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed italic">
              <strong>Key Context:</strong> {formula.notes}
            </p>
          </div>
        ))}
      </div>

      {/* Add Formula Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl p-5 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus size={16} className="text-indigo-400" /> Add Custom Formula to Vault
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Formula Title:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Nyquist Bit Rate Formula"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Subject Category:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Algorithms & Data Structures">Algorithms &amp; Data Structures</option>
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Databases (DBMS)">Databases (DBMS)</option>
                  <option value="Computer Networks">Computer Networks</option>
                  <option value="Engineering Mathematics">Engineering Mathematics</option>
                  <option value="General Aptitude">General Aptitude</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">LaTeX Code (math only):</label>
                <input
                  type="text"
                  value={newLatex}
                  onChange={(e) => setNewLatex(e.target.value)}
                  placeholder="e.g. C = 2B \log_2(M)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 font-mono text-emerald-400"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Usage Notes &amp; Gotchas:</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Where B is bandwidth in Hz, M is discrete signaling levels..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white h-20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-slate-800 text-slate-300 text-xs px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2 rounded-lg shadow-md"
                >
                  Save Formula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
