
import React, { useState, useEffect } from 'react';
import { GameState, PlayerData } from '../types';
import XPProgressBar from './XPProgressBar';
import { QUESTIONS_PER_ROUND, LEVEL_SCHEDULE } from '../constants';
import { Star, Target, Flame, TrendingUp, Share2, Check } from 'lucide-react';

interface LevelCompleteProps {
  gameState: GameState;
  playerData: PlayerData;
  onFinishSession: () => void;
  onShareResults: () => void;
  isSharing: boolean;
  rank: string;
  keyTakeaway: string | null;
  xpEarned: number;
  didLevelUp: boolean;
  streakBonusXp: number;
}

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: React.ReactNode, className?: string }> = ({ icon, label, value, className = '' }) => (
    <div className={`bg-black/20 p-4 rounded-lg flex flex-col items-center justify-center ${className}`}>
        {icon}
        <div className="text-4xl font-bold text-white font-mono mt-2">{value}</div>
        <div className="text-xs text-slate-400 font-mono tracking-widest mt-1 uppercase">{label}</div>
    </div>
);

const LevelComplete: React.FC<LevelCompleteProps> = ({ gameState, playerData, onFinishSession, onShareResults, isSharing, rank, keyTakeaway, xpEarned, didLevelUp, streakBonusXp }) => {
  const [displayScore, setDisplayScore] = useState(0);
  const [displayAccuracy, setDisplayAccuracy] = useState(0);

  useEffect(() => {
    const scoreTimeout = setTimeout(() => {
        const scoreInterval = setInterval(() => {
            setDisplayScore(prev => {
                if (prev < gameState.score) return prev + 1;
                clearInterval(scoreInterval);
                return prev;
            });
        }, 120);
        return () => clearInterval(scoreInterval);
    }, 500);

    const accuracyTimeout = setTimeout(() => {
        const accuracyInterval = setInterval(() => {
            setDisplayAccuracy(prev => {
                if (prev < gameState.accuracy) return prev + 1;
                clearInterval(accuracyInterval);
                return prev;
            });
        }, 30);
        return () => clearInterval(accuracyInterval);
    }, 500);

    return () => {
        clearTimeout(scoreTimeout);
        clearTimeout(accuracyTimeout);
    };
  }, [gameState.score, gameState.accuracy]);

  const currentLevelInfo = LEVEL_SCHEDULE.find(l => l.level === playerData.level);
  const nextLevelInfo = LEVEL_SCHEDULE.find(l => l.level === playerData.level + 1);
  
  const xpForCurrentLevel = currentLevelInfo?.xpRequired ?? 0;
  const xpForNextLevel = nextLevelInfo?.xpRequired ?? playerData.xp;

  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative z-10 animate-fade-in">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className={`text-3xl font-bold text-white mb-2 font-mono tracking-widest ${didLevelUp ? 'animate-glow-level-up' : ''}`}>[ {rank} ]</h1>
          {didLevelUp && <p className="text-lg text-sky-300 animate-fade-in" style={{animationDelay: '0.2s'}}>تهانينا! لقد بلغت مستوى جديداً!</p>}
        </div>

        {streakBonusXp > 0 && (
            <div className="bg-orange-900/50 border border-orange-400/50 rounded-xl p-4 text-center mb-6 animate-pulse-glow">
                <div className="flex items-center justify-center gap-2">
                    <Flame className="text-orange-300" size={20}/>
                    <h3 className="text-xl font-bold text-white">مكافأة سلسلة!</h3>
                </div>
                <p className="text-orange-300 mt-2">
                    +{streakBonusXp} XP للحفاظ على سلسلة انتصارات لـ<span className="font-mono font-bold mx-1">{playerData.streak}</span> أيام!
                </p>
            </div>
        )}
        
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-2xl p-6 mb-6 space-y-6">
           <XPProgressBar
            key={playerData.level} // Re-mount component on level up to reset animation
            currentLevel={playerData.level}
            startXp={playerData.xp - xpEarned}
            endXp={playerData.xp}
            levelStartXp={xpForCurrentLevel}
            levelEndXp={xpForNextLevel}
          />
          <div className="grid grid-cols-2 gap-4 text-center">
            <StatCard 
              icon={<Star className="text-cyan-400" size={24} />} 
              label="النتيجة" 
              value={<><span className="text-white">{displayScore}</span><span className="text-xl text-slate-400">/{QUESTIONS_PER_ROUND}</span></>} 
            />
            <StatCard 
              icon={<Target className="text-cyan-400" size={24} />} 
              label="الدقة" 
              value={<><span className="text-white">{displayAccuracy}</span><span className="text-2xl text-slate-400">%</span></>} 
            />
             <StatCard 
              icon={<Flame className="text-orange-400" size={24} />} 
              label="سلسلة الجولة" 
              value={<span className="text-white">{gameState.streak}</span>} 
            />
             <StatCard 
              icon={<TrendingUp className="text-green-400" size={24} />} 
              label="أفضل سلسلة يومية" 
              value={<span className="text-white">{playerData.longestStreak}</span>} 
            />
          </div>
        </div>
        
        {keyTakeaway && (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-6 text-center mb-6">
              <h3 className="text-sm text-slate-400 font-mono tracking-widest mb-3">[ خُلاصةُ الحِكْمَة ]</h3>
              <p className="text-white text-lg leading-relaxed">"{keyTakeaway}"</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
            <button
              onClick={onShareResults}
              disabled={isSharing}
              className="w-full bg-cyan-500 text-white px-8 py-5 rounded-lg hover:bg-cyan-600 transition-all flex items-center justify-center gap-3 text-lg font-semibold font-mono shadow-lg animate-glow-accent disabled:opacity-50 disabled:cursor-wait"
            >
              {isSharing ? (
                <span className="font-mono animate-pulse-fast">[ ... ]</span>
              ) : (
                <>
                  <Share2 size={20}/>
                  <span>[ شارك النتيجة ]</span>
                </>
              )}
            </button>
            <button
              onClick={onFinishSession}
              className="w-full bg-white/10 text-white px-8 py-4 rounded-lg hover:bg-white/20 transition-all flex items-center justify-center gap-3 text-lg font-mono"
            >
              <Check size={20}/>
              [ تم لهذا اليوم ]
            </button>
        </div>
      </div>
    </div>
  );
};

export default LevelComplete;
