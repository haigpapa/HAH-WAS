
import React from 'react';
import { PlayerData } from '../types';
import { HelpCircle, Settings } from 'lucide-react';

interface TopBarProps {
  playerData: PlayerData;
  onShowHowToPlay: () => void;
  onShowSettings: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ playerData, onShowHowToPlay, onShowSettings }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-black/30 backdrop-blur-lg border-b border-white/10 z-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">هَوَسْ</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-semibold text-white">{playerData.username}</div>
              <div className="text-xs font-mono text-slate-400">LVL {playerData.level}</div>
            </div>
            <button 
              onClick={onShowHowToPlay} 
              className="text-slate-300 hover:text-white transition-colors"
              aria-label="عرض شاشة كيفية اللعب"
            >
              <HelpCircle size={24} />
            </button>
            <button 
              onClick={onShowSettings} 
              className="text-slate-300 hover:text-white transition-colors"
              aria-label="فتح الإعدادات"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
