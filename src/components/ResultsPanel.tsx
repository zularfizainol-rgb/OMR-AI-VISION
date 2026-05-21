import React, { useMemo } from 'react';
import { BarChart, Save, CheckCircle2, XCircle, Ban, AlertTriangle } from 'lucide-react';
import { AnswerStatus, Option } from '../types';

interface ResultsPanelProps {
  answers: AnswerStatus[];
  skema: Option[];
}

export function ResultsPanel({ answers, skema }: ResultsPanelProps) {
  
  const stats = useMemo(() => {
    let correct = 0;
    let wrong = 0;
    let blank = 0;
    let multiple = 0;

    answers.forEach((ans, i) => {
      if (ans === 'BLANK') blank++;
      else if (ans === 'ERROR') multiple++;
      else if (ans === skema[i]) correct++;
      else wrong++;
    });

    const total = answers.length;
    const percentage = total > 0 ? ((correct / total) * 100).toFixed(1) : '0.0';
    
    let gred = '-';
    const pc = parseFloat(percentage);
    if (total > 0) {
      if (pc >= 90) gred = 'A+';
      else if (pc >= 80) gred = 'A';
      else if (pc >= 70) gred = 'A-';
      else if (pc >= 65) gred = 'B+';
      else if (pc >= 60) gred = 'B';
      else if (pc >= 50) gred = 'C';
      else if (pc >= 40) gred = 'D';
      else gred = 'E';
    }

    return { correct, wrong, blank, multiple, percentage, gred, total };
  }, [answers, skema]);

  if (answers.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden">
      <div className="bg-indigo-50/50 px-5 py-4 border-b border-indigo-100 flex flex-col sm:flex-row justify-between items-center gap-3">
          <h3 className="font-bold text-indigo-900 flex items-center gap-2">
              <BarChart className="w-5 h-5 text-indigo-500" /> Analisis Markah
          </h3>
      </div>
      
      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 relative">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <BarChart className="w-32 h-32" />
          </div>
          <div className="md:col-span-5 bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg text-white">
              <span className="text-xs font-bold text-white/80 tracking-widest mb-2">MARKAH KESELURUHAN</span>
              <div className="flex items-baseline font-black tracking-tighter">
                  <span className="text-7xl drop-shadow-sm">{stats.correct}</span>
                  <span className="text-2xl text-white/60 font-semibold ml-1">/{stats.total}</span>
              </div>
              <div className="text-xl font-bold mt-2 bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/30 shadow-sm">
                {stats.percentage}%
              </div>
              <div className="mt-4 px-6 py-2 bg-white text-indigo-900 rounded-xl text-lg font-black shadow-md border border-white/50">GRED {stats.gred}</div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-indigo-100 p-5 rounded-2xl flex flex-col justify-center shadow-sm relative overflow-hidden group">
                  <div className="absolute top-2 right-2 opacity-10 group-hover:scale-150 transition-transform"><CheckCircle2 className="w-12 h-12" /></div>
                  <span className="text-xs text-slate-400 font-bold mb-2 flex items-center gap-1.5 uppercase tracking-wider"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Betul</span>
                  <span className="text-3xl font-black text-slate-800">{stats.correct}</span>
              </div>
              <div className="bg-white border border-indigo-100 p-5 rounded-2xl flex flex-col justify-center shadow-sm relative overflow-hidden group">
                  <div className="absolute top-2 right-2 opacity-10 group-hover:scale-150 transition-transform"><XCircle className="w-12 h-12" /></div>
                  <span className="text-xs text-slate-400 font-bold mb-2 flex items-center gap-1.5 uppercase tracking-wider"><XCircle className="w-4 h-4 text-rose-500" /> Salah</span>
                  <span className="text-3xl font-black text-slate-800">{stats.wrong}</span>
              </div>
              <div className="bg-white border border-indigo-100 p-5 rounded-2xl flex flex-col justify-center shadow-sm relative overflow-hidden group">
                  <div className="absolute top-2 right-2 opacity-10 group-hover:scale-150 transition-transform"><Ban className="w-12 h-12" /></div>
                  <span className="text-xs text-slate-400 font-bold mb-2 flex items-center gap-1.5 uppercase tracking-wider text-[10px]"><Ban className="w-4 h-4 text-amber-500" /> Kosong</span>
                  <span className="text-3xl font-black text-slate-800">{stats.blank}</span>
              </div>
              <div className="bg-white border border-indigo-100 p-5 rounded-2xl flex flex-col justify-center shadow-sm relative overflow-hidden group">
                  <div className="absolute top-2 right-2 opacity-10 group-hover:scale-150 transition-transform"><AlertTriangle className="w-12 h-12" /></div>
                  <span className="text-xs text-slate-400 font-bold mb-2 flex items-center gap-1.5 uppercase tracking-wider text-[10px]"><AlertTriangle className="w-4 h-4 text-fuchsia-500" /> Lebih</span>
                  <span className="text-3xl font-black text-slate-800">{stats.multiple}</span>
              </div>
          </div>
      </div>

      <div className="px-6 pb-6">
          <h4 className="text-[10px] font-bold text-indigo-400 tracking-widest uppercase mb-3 px-2">Kunci Analisis</h4>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-10 gap-2 h-[150px] overflow-y-auto border border-indigo-50 rounded-xl p-3 bg-indigo-50/30">
              {answers.map((ans, idx) => {
                const correct = ans === skema[idx];
                const error = ans === 'ERROR' || ans === 'BLANK';
                return (
                  <div key={idx} className={`flex items-center justify-center py-2 px-1 rounded-lg font-bold text-sm shadow-sm border ${
                    correct ? 'bg-emerald-500 text-white border-emerald-600' : 
                    error ? 'bg-amber-100 text-amber-700 border-amber-200' : 
                    'bg-rose-500 text-white border-rose-600'
                  }`}>
                    {idx + 1}. <span className="ml-1 px-1.5 py-0.5 rounded bg-black/10">{ans === 'BLANK' ? '-' : ans === 'ERROR' ? 'X' : ans}</span>
                  </div>
                );
              })}
          </div>
      </div>
    </div>
  );
}
