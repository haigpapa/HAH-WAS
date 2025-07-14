
import React from 'react';
import { QUESTIONS_PER_ROUND } from '../constants';
import { BarChart3 } from 'lucide-react';

interface PerformanceGraphProps {
    data: { score: number, date: string }[];
}

const PerformanceGraph: React.FC<PerformanceGraphProps> = ({ data }) => {
    const last7Games = data.slice(-7);
    const chartHeight = 150;
    const barWidth = 30;
    const barMargin = 15;
    const chartWidth = last7Games.length * (barWidth + barMargin);

    if (data.length === 0) {
        return (
            <div className="bg-black/20 p-6 rounded-lg text-center flex flex-col items-center justify-center h-48">
                <BarChart3 className="text-slate-500 mb-2" size={32}/>
                <p className="text-slate-400 font-mono text-sm">أكمل أول لعبة لك لترى أدائك</p>
            </div>
        )
    }

    return (
        <div className="bg-black/20 p-4 rounded-lg">
            <h3 className="font-bold text-white mb-4 text-center">أداء آخر 7 ألعاب</h3>
            <div className="flex justify-center overflow-x-auto">
                <svg width={chartWidth} height={chartHeight} aria-label="Performance Graph">
                    <g>
                        {last7Games.map((game, index) => {
                            const barHeight = (game.score / QUESTIONS_PER_ROUND) * (chartHeight - 20);
                            const x = index * (barWidth + barMargin);
                            const y = chartHeight - barHeight - 20;

                            return (
                                <g key={index}>
                                    <rect
                                        x={x}
                                        y={y}
                                        width={barWidth}
                                        height={barHeight}
                                        fill="url(#barGradient)"
                                        rx="4"
                                        className="transition-all duration-500"
                                    />
                                    <text
                                        x={x + barWidth / 2}
                                        y={y - 5}
                                        fill="white"
                                        textAnchor="middle"
                                        fontSize="12"
                                        fontFamily="monospace"
                                    >
                                        {game.score}
                                    </text>
                                    <text
                                        x={x + barWidth / 2}
                                        y={chartHeight-5}
                                        fill="#94a3b8" // slate-400
                                        textAnchor="middle"
                                        fontSize="10"
                                    >
                                       {new Date(game.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short'})}
                                    </text>
                                </g>
                            );
                        })}
                    </g>
                    <defs>
                        <linearGradient id="barGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#22d3ee" />
                            <stop offset="100%" stopColor="#0891b2" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        </div>
    );
};

export default PerformanceGraph;
