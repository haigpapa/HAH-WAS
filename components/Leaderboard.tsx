
import React from 'react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  data: LeaderboardEntry[] | null;
  onBack: () => void;
  currentUser: string | undefined;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ data, onBack, currentUser }) => {
  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 animate-fade-in flex flex-col items-center">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">لوحة الصدارة اليومية</h1>
          <p className="text-slate-400 font-mono tracking-widest">{new Date().toLocaleDateString('ar-EG')}</p>
        </header>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl p-2 sm:p-4">
          <div role="table" aria-label="لوحة الصدارة اليومية" className="space-y-2">
             <div role="row" className="flex items-center p-3 rounded-lg text-slate-400 font-mono text-sm uppercase tracking-widest">
                <div role="columnheader" className="w-12 text-center">الترتيب</div>
                <div role="columnheader" className="flex-1 text-right">المستخدم</div>
                <div role="columnheader" className="w-24 text-center">النتيجة</div>
            </div>
            {!data ? (
              <div className="text-center p-8 text-slate-400 font-mono animate-pulse-fast">
                [ ... تحميل ... ]
              </div>
            ) : (
              data.map((entry) => (
                <div
                  role="row"
                  key={entry.rank}
                  className={`flex items-center p-3 rounded-lg transition-all ${
                    entry.username === currentUser
                      ? 'bg-cyan-500/20 border-cyan-400 border'
                      : 'bg-black/20'
                  }`}
                >
                  <div role="cell" className="w-12 text-center text-xl font-mono text-slate-400">{entry.rank}</div>
                  <div role="cell" className="flex-1 text-right text-lg font-semibold text-white">{entry.username}</div>
                  <div role="cell" className="w-24 text-center text-xl font-mono text-cyan-300">{entry.score}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className="px-8 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-mono"
          >
            [ العودة ]
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
