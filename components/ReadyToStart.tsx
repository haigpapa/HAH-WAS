
import React from 'react';
import { PlayerData } from '../types';

interface ReadyToStartProps {
  playerData: PlayerData | null;
  onStart: () => void;
  isLoading: boolean;
}

const ReadyToStart: React.FC<ReadyToStartProps> = ({ playerData, onStart, isLoading }) => {

  return (
    <div 
      className="flex flex-col items-center justify-center p-4"
      style={{ height: 'calc(100vh - 5rem)' }}
    >
      <div className="relative z-10 text-center max-w-md mx-auto p-6 w-full">
        <div className="mb-6 animate-fade-in text-center">
          <h1 className="text-5xl font-bold text-white">هَوَسْ</h1>
        </div>
        
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl p-8 mb-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <h2 className="text-2xl font-bold text-white mb-4">أهلاً بعودتك، {playerData?.username}</h2>
          <p className="text-slate-300 leading-relaxed mb-6">{playerData?.profile?.personalizedNote || "استعد لتحدي اليوم."}</p>
          <div className="font-mono text-sm text-slate-400 tracking-widest">GLOBAL LEVEL: {playerData?.level}</div>
        </div>
        
        <div className="animate-fade-in" style={{animationDelay: '0.4s'}}>
          <button
            onClick={onStart}
            disabled={isLoading}
            className="w-full bg-white text-black px-8 py-5 rounded-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-3 text-xl font-semibold shadow-lg animate-pulse-fast disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
                <span className="font-mono">[ ...جاري التحضير ]</span>
            ) : (
                <span className="font-mono">[ ابدأ تحدي اليوم ]</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadyToStart;