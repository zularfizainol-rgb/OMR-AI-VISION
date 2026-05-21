import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { AnswerKeyPanel } from './components/AnswerKeyPanel';
import { LiveScannerPanel } from './components/LiveScannerPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { Option, AnswerStatus } from './types';
import { useToast } from './hooks/useToast';
import { Info, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function App() {
  const { toasts } = useToast();
  
  const [numQuestions, setNumQuestions] = useState<number>(50);
  const [skema, setSkema] = useState<Option[]>(Array(50).fill('-'));
  
  const [answers, setAnswers] = useState<AnswerStatus[]>([]);

  const handleNumQuestionsChange = (num: number) => {
    setNumQuestions(num);
    setSkema(prev => {
      const newSkema = [...prev];
      if (num > newSkema.length) {
        return newSkema.concat(Array(num - newSkema.length).fill('-'));
      }
      return newSkema.slice(0, num);
    });
    setAnswers([]);
  };

  const handleScanResult = useCallback((newAnswers: AnswerStatus[]) => {
    setAnswers(newAnswers);
  }, []);

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen flex flex-col font-sans">
      <Header />

      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className="bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
            {t.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : 
             t.type === 'warning' ? <AlertTriangle className="w-5 h-5 text-amber-400" /> :
             <Info className="w-5 h-5 text-sky-400" />}
            <span className="text-sm font-medium tracking-wide">{t.message}</span>
          </div>
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 flex-grow w-full grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
        
        {/* Left Column */}
        <section className="lg:col-span-4 space-y-6">
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex gap-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Info className="w-24 h-24" />
            </div>
            <Info className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5 relative z-10" />
            <div className="text-sm text-indigo-900 relative z-10">
              <p className="font-bold text-base mb-2 tracking-tight">Panduan Utama:</p>
              <ul className="pl-4 space-y-2 text-[13px] list-disc marker:text-indigo-400">
                <li>Bina <strong>{numQuestions}</strong> jawapan pada panel Skema di bawah.</li>
                <li>Pilih (-) jika soalan dikosongkan.</li>
                <li>Halakan kamera peranti jelas pada struktur OMR.</li>
                <li>Tekan butang <strong className="text-indigo-700 font-bold bg-indigo-100 px-1 py-0.5 rounded">Snap & Analisa</strong>.</li>
              </ul>
            </div>
          </div>

          <AnswerKeyPanel 
            skema={skema} 
            setSkema={setSkema} 
            numQuestions={numQuestions} 
            setNumQuestions={handleNumQuestionsChange} 
          />
        </section>

        {/* Right Column */}
        <section className="lg:col-span-8 space-y-6">
          <LiveScannerPanel 
            numQuestions={numQuestions}
            onScanResult={handleScanResult}
          />
          
          <ResultsPanel 
            answers={answers} 
            skema={skema} 
          />
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="inline-block bg-gradient-to-r from-indigo-600 to-fuchsia-500 text-transparent bg-clip-text font-black text-xl mb-2 tracking-tighter">
              OMR AI VISION &copy; 2026
            </div>
            <p className="text-slate-500 text-xs font-medium max-w-lg mx-auto">Sistem kecerdasan buatan membaca OMR secara terus. Direka bentuk secara khusus bagi menaikkan taraf efisiensi guru-guru generasi digital.</p>
        </div>
      </footer>
    </div>
  );
}
