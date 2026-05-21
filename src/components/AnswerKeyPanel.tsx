import React from 'react';
import { KeyRound, RotateCcw } from 'lucide-react';
import { Option } from '../types';

interface AnswerKeyPanelProps {
  skema: Option[];
  setSkema: React.Dispatch<React.SetStateAction<Option[]>>;
  numQuestions: number;
  setNumQuestions: (num: number) => void;
}

export function AnswerKeyPanel({ skema, setSkema, numQuestions, setNumQuestions }: AnswerKeyPanelProps) {
  const handleChange = (index: number, val: Option) => {
    const newSkema = [...skema];
    newSkema[index] = val;
    setSkema(newSkema);
  };

  const handleReset = () => {
    if (window.confirm('Adakah anda pasti mahu menetapkan semula (reset) semua skema jawapan?')) {
      setSkema(Array(numQuestions).fill('-'));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
      <div className="bg-indigo-50/50 px-5 py-4 border-b border-indigo-100 flex justify-between items-center flex-wrap gap-2">
        <h3 className="font-bold text-indigo-900 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-indigo-500" /> Skema Jawapan
        </h3>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Soalan:</label>
          <select 
            className="text-xs bg-white border border-indigo-200 rounded-lg px-3 py-1.5 outline-none focus:border-fuchsia-500 font-bold text-indigo-700 shadow-sm"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
          >
            <option value={10}>10 Soalan</option>
            <option value={20}>20 Soalan</option>
            <option value={30}>30 Soalan</option>
            <option value={40}>40 Soalan</option>
            <option value={50}>50 Soalan</option>
          </select>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex justify-end">
          <button 
            onClick={handleReset} 
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold py-1.5 px-3 rounded-lg transition flex items-center shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Skema
          </button>
        </div>

        <div className="h-[280px] overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50 space-y-2">
          <div className="grid grid-cols-1 gap-1.5">
            {skema.map((ans, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white px-2 py-1 rounded border border-slate-200 shadow-sm text-sm">
                <span className="font-bold text-slate-500 w-6 text-right">{idx + 1}.</span>
                <select 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-semibold"
                  value={ans}
                  onChange={(e) => handleChange(idx, e.target.value as Option)}
                >
                  <option value="-">-</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
