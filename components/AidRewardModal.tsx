
import React from 'react';

interface AidRewardModalProps {
  onSelectAid: (type: 'reveal' | 'narrow') => void;
}

const AidRewardModal: React.FC<AidRewardModalProps> = ({ onSelectAid }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-black/70 backdrop-blur-2xl border border-cyan-400/50 rounded-2xl shadow-2xl p-8 text-center animate-glow-accent">
        <h2 className="text-2xl font-bold text-white mb-2">مكافأة سلسلة!</h2>
        <p className="text-slate-300 mb-8 leading-relaxed">
          لقد أجبت على 5 أسئلة متتالية بشكل صحيح. اختر مساعدة واحدة كمكافأة.
        </p>
        <div className="flex flex-col gap-4 font-mono">
          <button
            onClick={() => onSelectAid('reveal')}
            className="w-full bg-white/10 text-white py-4 rounded-lg transition-all hover:bg-white/20 shadow-lg font-semibold"
          >
            [ +1 كَشْفُ جُزْء ]
          </button>
          <button
            onClick={() => onSelectAid('narrow')}
            className="w-full bg-white/10 text-white py-4 rounded-lg transition-all hover:bg-white/20"
          >
            [ +1 تَقْلِيصُ المَجَال ]
          </button>
        </div>
      </div>
    </div>
  );
};

export default AidRewardModal;
