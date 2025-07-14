
export type GamePhase = 'username-prompt' | 'onboarding' | 'ready-to-start' | 'loading' | 'playing' | 'level-complete' | 'daily-locked' | 'leaderboard' | 'personal-stats';

export type OnboardingProfile = {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  interests: 'science' | 'culture' | 'arts' | 'mixed';
  learningGoals: 'education' | 'entertainment' | 'mixed';
  culturalDepth: 'minimal' | 'moderate' | 'rich';
  personalizedNote: string;
};

export type PlayerData = {
  username: string;
  level: number;
  xp: number;
  lastPlayedDate: string | null;
  streak: number;
  profile: OnboardingProfile | null;
  gamesPlayed: number;
  totalCorrectAnswers: number;
  longestStreak: number;
  soundEnabled: boolean;
  gameHistory: { score: number, date: string }[];
};

export type DailyContent = {
  topic: string;
  keyTakeaway: string;
  deeperDiveParagraph: string;
  keywords: string[];
};

export type LeaderboardEntry = {
  rank: number;
  username:string;
  score: number;
  isCurrentUser: boolean;
};

export type Topic = {
  title: string;
  description: string;
};

export type Question = {
  statements: string[];
  correct_answer: number;
  explanation: string;
};

export type GameState = {
  score: number;
  streak: number;
  accuracy: number;
  totalPlayed: number;
  currentQuestion: Question | null;
  selectedAnswer: number | null;
  aids: {
    reveal: number;
    narrow: number;
  };
  answerHistory: ('correct' | 'incorrect')[];
  answerTimes: number[];
  currentFactCheck: { url: string; title: string; } | 'loading' | null;
};

export type OnboardingQuestion = {
  question: string;
  options: string[];
};