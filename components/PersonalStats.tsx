
import React from 'react';
import { PlayerData } from '../types';
import { QUESTIONS_PER_ROUND } from '../constants';
import { BarChart3, Medal, Flame, BrainCircuit, Gamepad2, Percent, ArrowLeft } from 'lucide-react';
import PerformanceGraph from './PerformanceGraph';

interface PersonalStatsProps {
  playerData: PlayerData;
  onBack: () => void;
}

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number }> = ({ icon, label, value }) => (
    <div className="bg-black/20 p-4 rounded-lg text-center">
        {icon}
        <div className="text-3xl font-bold text-white font-mono mt-2">{value}</div>
        <div className="text-xs text-slate-400 font-mono tracking-widest mt-1 uppercase">{label}</div>
    </div>
);


const PersonalStats: React.FC<PersonalStatsProps> = ({ playerData, onBack }) => {
    const totalQuestionsAnswered = playerData.gamesPlayed * QUESTIONS_PER_ROUND;
    const overallAccuracy = totalQuestionsAnswered > 0 
        ? Math.round((playerData.totalCorrectAnswers / totalQuestionsAnswered) * 100) 
        : 0;
    const averageScore = playerData.gamesPlayed > 0
        ? (playerData.totalCorrectAnswers / playerData.gamesPlayed).toFixed(1)
        : 0;

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 animate-fade-in flex flex-col items-center">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">إحصائياتي الشاملة</h1>
          <p className="text-slate-400 text-lg">رحلتك في كشف الأوهام حتى الآن</p>
        </header>

        <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl p-4 sm:p-6 mb-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <StatCard icon={<Gamepad2 className="mx-auto text-cyan-400" />} label="ألعاب مكتملة" value={playerData.gamesPlayed} />
                <StatCard icon={<BarChart3 className="mx-auto text-cyan-400" />} label="متوسط النتيجة" value={`${averageScore}/${QUESTIONS_PER_ROUND}`} />
                <StatCard icon={<Percent className="mx-auto text-cyan-400" />} label="الدقة الإجمالية" value={`${overallAccuracy}%`} />
                <StatCard icon={<Flame className="mx-auto text-orange-400" />} label="أفضل سلسلة" value={playerData.longestStreak} />
                <StatCard icon={<Medal className="mx-auto text-yellow-400" />} label="المستوى الحالي" value={playerData.level} />
                <StatCard icon={<BrainCircuit className="mx-auto text-purple-400" />} label="إجمالي الخبرة" value={playerData.xp.toLocaleString()} />
            </div>
        </div>
        
        <div className="mb-8">
            <PerformanceGraph data={playerData.gameHistory} />
        </div>

        <div className="text-center">
          <button
            onClick={onBack}
            className="px-8 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-mono flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowLeft size={16} />
            [ العودة ]
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalStats;
