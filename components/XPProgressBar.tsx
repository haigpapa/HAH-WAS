import React, { useState, useEffect } from 'react';

interface XPProgressBarProps {
  currentLevel: number;
  startXp: number; // XP at the start of the round
  endXp: number;   // XP at the end of the round
  levelStartXp: number; // XP required for the current level
  levelEndXp: number;   // XP required for the next level
}

const XPProgressBar: React.FC<XPProgressBarProps> = ({ currentLevel, startXp, endXp, levelStartXp, levelEndXp }) => {
  const [animatedXp, setAnimatedXp] = useState(startXp);

  useEffect(() => {
    // Animate the XP value from start to end over 1.5 seconds
    const timeoutId = setTimeout(() => {
        setAnimatedXp(endXp);
    }, 100); // Small delay to ensure transition is visible
    return () => clearTimeout(timeoutId);
  }, [endXp]);

  const totalLevelXp = levelEndXp - levelStartXp;
  const currentXpInLevel = animatedXp - levelStartXp;
  const startXpInLevel = startXp - levelStartXp;

  const currentProgressPercentage = totalLevelXp > 0 ? (currentXpInLevel / totalLevelXp) * 100 : (animatedXp >= levelEndXp ? 100 : 0);
  const startProgressPercentage = totalLevelXp > 0 ? (startXpInLevel / totalLevelXp) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2 font-mono">
        <span className="text-2xl text-white font-bold">LVL {currentLevel}</span>
        <span className="text-sm text-slate-400">{endXp.toLocaleString()} / {levelEndXp.toLocaleString()} XP</span>
      </div>
      <div className="w-full bg-black/30 rounded-full h-3 border border-white/10 p-0.5 relative overflow-hidden">
        {/* Bar for progress before this round's earnings */}
        <div
          className="bg-cyan-400/30 h-full rounded-full absolute top-0.5 left-0.5"
          style={{ width: `calc(${Math.min(startProgressPercentage, 100)}% - 2px)` }}
        />
        {/* Bar that animates to show total progress */}
        <div
          className="bg-cyan-400 h-full rounded-full transition-all duration-1500 ease-out"
          style={{ width: `calc(${Math.min(currentProgressPercentage, 100)}% - 2px)` }}
        />
      </div>
    </div>
  );
};

export default XPProgressBar;