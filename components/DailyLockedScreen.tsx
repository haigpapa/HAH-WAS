
import React, { useState, useEffect } from 'react';
import { PlayerData, DailyContent } from '../types';
import XPProgressBar from './XPProgressBar';
import { LEVEL_SCHEDULE } from '../constants';
import { Flame, Clock } from 'lucide-react';

interface DailyLockedScreenProps {
  playerData: PlayerData;
  dailyContent: DailyContent | null;
  onViewLeaderboard: () => void;
  onViewStats: () => void;
}

const DailyLockedScreen: React.FC<DailyLockedScreenProps> = ({ playerData, dailyContent, onViewLeaderboard, onViewStats }) => {
  const [timeUntilNext, setTimeUntilNext] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUntilNext(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    calculateTimeLeft();
    const intervalId = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const currentLevelInfo = LEVEL_SCHEDULE.find(l => l.level === playerData.level);
  const nextLevelInfo = LEVEL_SCHEDULE.find(l => l.level === playerData.level + 1);
  
  const xpForCurrentLevel = currentLevelInfo?.xpRequired ?? 0;
  const xpForNextLevel = nextLevelInfo?.xpRequired ?? playerData.xp;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="relative z-10 text-center max-w-lg mx-auto p-4 w-full animate-fade-in">
        <h1 className="text-4xl font-bold text-white mb-4">لقد أكملت تحدي اليوم</h1>
        <p className="text-slate-300 text-lg mb-8">
          أحسنت! نراك غدًا لكشف المزيد من الأوهام.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-black/20 p-4 rounded-lg text-center flex flex-col justify-center">
                <Flame className="mx-auto text-orange-400" size={28}/>
                <div className="text-3xl font-bold text-white font-mono mt-2 animate-pulse-glow">{playerData.streak}</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Daily Streak</div>
            </div>
            <div className="bg-black/20 p-4 rounded-lg text-center flex flex-col justify-center">
                <Clock className="mx-auto text-cyan-400" size={28}/>
                <div className="text-3xl font-bold text-white font-mono mt-2">{timeUntilNext}</div>
                <div className="text-xs text-slate-400 uppercase tracking-widest mt-1">Next Challenge</div>
            </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl p-6 mb-6">
            <XPProgressBar 
                currentLevel={playerData.level}
                startXp={playerData.xp} // No animation needed here, just show current state
                endXp={playerData.xp}
                levelStartXp={xpForCurrentLevel}
                levelEndXp={xpForNextLevel}
            />
        </div>
        
        {dailyContent && (
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 text-right animate-fade-in mb-6">
              <h3 className="text-sm text-slate-400 font-mono tracking-widest mb-3">[ نظرة أعمق: {dailyContent.topic} ]</h3>
              <p className="text-white text-md leading-relaxed mb-4">{dailyContent.deeperDiveParagraph}</p>
              <div className="flex flex-wrap gap-2 justify-end">
                  {dailyContent.keywords.map(keyword => (
                      <a 
                        key={keyword}
                        href={`https://www.google.com/search?q=${encodeURIComponent(keyword)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-cyan-900/60 text-cyan-300 text-sm px-4 py-1.5 rounded-lg border border-cyan-400/20 hover:bg-cyan-800 hover:border-cyan-400/60 transition-all transform hover:scale-105"
                      >
                          {keyword}
                      </a>
                  ))}
              </div>
            </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onViewLeaderboard}
            className="flex-1 bg-white text-black px-8 py-4 rounded-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-3 text-lg font-semibold font-mono shadow-lg"
          >
            [ لوحة الصدارة ]
          </button>
           <button
            onClick={onViewStats}
            className="flex-1 bg-white/10 text-white px-8 py-4 rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-3 text-lg font-semibold font-mono"
          >
            [ إحصائياتي ]
          </button>
        </div>

      </div>
    </div>
  );
};

export default DailyLockedScreen;