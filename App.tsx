
import React, { useState, useEffect, useCallback } from 'react';
import { GamePhase, PlayerData, OnboardingProfile, GameState, Question, DailyContent, LeaderboardEntry } from './types';
import { QUESTIONS_PER_ROUND, APP_LAUNCH_DATE, LEVEL_SCHEDULE, XP_CONFIG, AID_COSTS } from './constants';
import { generateQuestionBatch, generatePostGameContent, generateHint, generateFactCheckInfo } from './services/geminiService';
import { submitScore, fetchDailyLeaderboard } from './services/apiService';
import { useLoader } from './hooks/useLoader';
import { useSounds } from './hooks/useSound';
import { useNotifications } from './hooks/useNotifications';
import { App as CapacitorApp } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';

import UsernamePrompt from './components/UsernamePrompt';
import OnboardingFlow from './components/OnboardingFlow';
import ReadyToStart from './components/ReadyToStart';
import GamePlay from './components/GamePlay';
import LevelComplete from './components/LevelComplete';
import PersistentBackground from './components/PersistentBackground';
import DailyLockedScreen from './components/DailyLockedScreen';
import Leaderboard from './components/Leaderboard';
import PersonalStats from './components/PersonalStats';
import TopBar from './components/TopBar';
import SettingsModal from './components/SettingsModal';
import HowToPlayModal from './components/HowToPlayModal';

const processAndShuffleQuestions = (questions: Question[]): Question[] => {
  return questions.map(q => {
    if (!q.statements || q.correct_answer === undefined) return q;
    const statements = [...q.statements];
    const correctAnswerIndex = q.correct_answer;
    
    const indices = statements.map((_, i) => i);
    const shuffledIndices = indices.sort(() => Math.random() - 0.5);

    const shuffledStatements = shuffledIndices.map(originalIndex => statements[originalIndex]);
    const newCorrectAnswerIndex = shuffledIndices.indexOf(correctAnswerIndex);

    return { ...q, statements: shuffledStatements, correct_answer: newCorrectAnswerIndex };
  });
};

const getTodayString = () => new Date().toISOString().split('T')[0];

const getGlobalTheme = (): { level: number, theme: string } => {
    const startDate = new Date(APP_LAUNCH_DATE);
    const today = new Date();
    const daysSinceLaunch = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const themeIndex = Math.floor(daysSinceLaunch / 14) % LEVEL_SCHEDULE.length;
    return {
        level: LEVEL_SCHEDULE[themeIndex].level,
        theme: LEVEL_SCHEDULE[themeIndex].theme
    };
};

const App: React.FC = () => {
  const { showLoader, hideLoader } = useLoader();
  const { requestPermissions, scheduleDailyReminder } = useNotifications();
  
  const [gamePhase, setGamePhase] = useState<GamePhase>('loading');
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [onboardingUsername, setOnboardingUsername] = useState<string>('');
  
  const { initAudio, playSelect, playCorrect, playIncorrect, playLevelUp, playXpSpend } = useSounds(playerData?.soundEnabled ?? true);

  const [globalTheme, setGlobalTheme] = useState<{ level: number, theme: string } | null>(null);
  const [dailyContent, setDailyContent] = useState<DailyContent | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[] | null>(null);
  const [lastGameResult, setLastGameResult] = useState<{xpEarned: number, didLevelUp: boolean, streakBonusXp: number} | null>(null);
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState(false);
  const [isPreparingChallenge, setIsPreparingChallenge] = useState(false);

  const initialGameState: GameState = {
    score: 0, streak: 0, accuracy: 0, totalPlayed: 0,
    currentQuestion: null, selectedAnswer: null,
    aids: { reveal: 1, narrow: 1 }, answerHistory: [], answerTimes: [],
    currentFactCheck: null,
  };
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  
  const [currentQuestionNum, setCurrentQuestionNum] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [currentTopic, setCurrentTopic] = useState('');
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showAidRewardModal, setShowAidRewardModal] = useState(false);
  
  const [startTime, setStartTime] = useState<number>(0);
  
  const [disabledAnswers, setDisabledAnswers] = useState<number[]>([]);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const savePlayerData = useCallback((data: PlayerData) => {
    localStorage.setItem('HAWAS_PLAYER_DATA', JSON.stringify(data));
    setPlayerData(data);
  }, []);
  
  useEffect(() => {
    const initializeApp = async () => {
      showLoader({ withIntro: true });
      const minLoadingPromise = new Promise(resolve => setTimeout(resolve, 3000));

      const today = getTodayString();
      const currentGlobalTheme = getGlobalTheme();
      setGlobalTheme(currentGlobalTheme);

      const storedDataJSON = localStorage.getItem('HAWAS_PLAYER_DATA');
      let data: PlayerData | null = storedDataJSON ? JSON.parse(storedDataJSON) : null;

      if (!data) {
        setGamePhase('username-prompt');
      } else {
        if (data.gamesPlayed === undefined) data.gamesPlayed = 0;
        if (data.totalCorrectAnswers === undefined) data.totalCorrectAnswers = 0;
        if (data.longestStreak === undefined) data.longestStreak = data.streak || 0;
        if (data.soundEnabled === undefined) data.soundEnabled = true;
        if (data.gameHistory === undefined) data.gameHistory = [];

        setPlayerData(data);
        
        if (data.lastPlayedDate === today) {
            const storedContent = localStorage.getItem(`HAWAS_DAILY_CONTENT_${today}`);
            if (storedContent) setDailyContent(JSON.parse(storedContent));
            setGamePhase('daily-locked');
        } else {
            if (data.profile) {
              setIsPreparingChallenge(true);
              try {
                const allQuestions = await generateQuestionBatch(currentGlobalTheme.theme, data.profile, data.level, 0, data.streak, currentGlobalTheme.theme, QUESTIONS_PER_ROUND);
                const processed = processAndShuffleQuestions(allQuestions);
                setQuestions(processed);
              } finally {
                setIsPreparingChallenge(false);
              }
            }
            setGamePhase('ready-to-start');
        }
      }

      await minLoadingPromise;
      hideLoader();
      SplashScreen.hide();
    };
    
    initializeApp();

    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        CapacitorApp.exitApp();
      } else {
        setGamePhase(prev => {
            if (prev === 'leaderboard' || prev === 'personal-stats') return 'daily-locked';
            if (prev === 'daily-locked' || prev === 'level-complete') return 'daily-locked';
            // In other states, we might prevent back navigation or let it exit.
            // For now, returning to 'daily-locked' is a safe default.
            return prev;
        });
      }
    });

  }, []);

  const handleUsernameSubmit = async (username: string) => {
    playSelect();
    setOnboardingUsername(username);
    setGamePhase('onboarding');
  };
  
  const handleOnboardingComplete = async (profile: OnboardingProfile) => {
    const newPlayer: PlayerData = {
        username: onboardingUsername,
        level: 1,
        xp: 0,
        lastPlayedDate: null,
        streak: 0,
        profile: profile,
        gamesPlayed: 0,
        totalCorrectAnswers: 0,
        longestStreak: 0,
        soundEnabled: true,
        gameHistory: []
    };
    savePlayerData(newPlayer);
    
    setIsPreparingChallenge(true);
    setGamePhase('ready-to-start');

    const currentGlobalTheme = getGlobalTheme();
    try {
      const allQuestions = await generateQuestionBatch(currentGlobalTheme.theme, newPlayer.profile!, newPlayer.level, 0, newPlayer.streak, currentGlobalTheme.theme, QUESTIONS_PER_ROUND);
      const processed = processAndShuffleQuestions(allQuestions);
      setQuestions(processed);
    } catch (error) {
      console.error("Failed to prepare challenge for new user:", error);
    } finally {
      setIsPreparingChallenge(false);
    }
  }

  const handleToggleSound = () => {
    if (!playerData) return;
    const updated = { ...playerData, soundEnabled: !playerData.soundEnabled };
    savePlayerData(updated);
  };
  
  const handleResetProgress = () => {
      localStorage.removeItem('HAWAS_PLAYER_DATA');
      localStorage.removeItem('HAWAS_DAILY_CONTENT');
      setPlayerData(null);
      setOnboardingUsername('');
      setGamePhase('username-prompt');
      setShowSettingsModal(false);
  };

  const resetForNewQuestion = () => {
    setCurrentHint(null);
    setDisabledAnswers([]);
    setStartTime(Date.now());
  }

  const loadNextQuestion = useCallback(() => {
    resetForNewQuestion();
    if (currentQuestionNum <= questions.length) {
      setGameState(prev => ({ ...prev, currentQuestion: questions[currentQuestionNum-1], selectedAnswer: null, currentFactCheck: null }));
    }
  }, [currentQuestionNum, questions]);

  const startDailyChallenge = useCallback(() => {
    if (!playerData || !globalTheme || questions.length === 0) {
      alert("الأسئلة ليست جاهزة بعد. الرجاء الانتظار قليلاً أو إعادة تحميل الصفحة.");
      return;
    }
    initAudio();
    
    const topic = globalTheme.theme;
    setCurrentTopic(topic);
    setCurrentQuestionNum(1);
    setGameState({ ...initialGameState, currentQuestion: questions[0] });
    
    setGamePhase('playing');
    resetForNewQuestion();
  }, [playerData, globalTheme, questions, initialGameState, initAudio]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (gameState.selectedAnswer !== null) return;
    playSelect();
    const answerTime = (Date.now() - startTime) / 1000;
    setGameState(prev => ({ ...prev, selectedAnswer: answerIndex, answerTimes: [...prev.answerTimes, answerTime] }));

    setTimeout(() => {
      const isCorrect = answerIndex === gameState.currentQuestion?.correct_answer;
      isCorrect ? playCorrect() : playIncorrect();
      
      const newStreak = isCorrect ? gameState.streak + 1 : 0;
      const newTotalPlayed = gameState.totalPlayed + 1;
      const newScore = isCorrect ? gameState.score + 1 : gameState.score;
      const newAccuracy = Math.round((newScore / newTotalPlayed) * 100);

      if (isCorrect && (newStreak > 0 && newStreak % 5 === 0)) {
        setShowAidRewardModal(true);
      }

      setGameState(prev => ({ 
        ...prev, 
        score: newScore, 
        streak: newStreak, 
        accuracy: newAccuracy, 
        totalPlayed: newTotalPlayed, 
        answerHistory: [...prev.answerHistory, isCorrect ? 'correct' : 'incorrect'],
        currentFactCheck: 'loading',
      }));
      setShowResultsModal(true);
      
      if (gameState.currentQuestion) {
        const correctChoiceIndex = gameState.currentQuestion.correct_answer;
        const hallucinationStatement = gameState.currentQuestion.statements[correctChoiceIndex];
        generateFactCheckInfo(hallucinationStatement, currentTopic)
          .then(factCheckData => {
              setGameState(prev => ({...prev, currentFactCheck: factCheckData }));
          });
      }
    }, 500);
  };

  const getRank = (accuracy: number): string => {
    if (accuracy >= 95) return "كَاشِفُ الأَسْرَار";
    if (accuracy >= 80) return "صَائِدُ الأَوْهَام";
    if (accuracy >= 60) return "مُحَقِّقٌ نَابِه";
    if (accuracy >= 40) return "طَالِبُ حَقِيقَة";
    return "مُتَدَرِّب";
  };

  const handleLevelCompletion = useCallback(async () => {
    if (!playerData || !playerData.profile || !globalTheme) return;
    
    showLoader({ wisdom: "تحليل الأداء..." });
    
    const today = getTodayString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    const newStreak = playerData.lastPlayedDate === yesterdayString ? playerData.streak + 1 : 1;
    
    let streakBonusXp = 0;
    if (newStreak > 0 && newStreak % 7 === 0) {
        streakBonusXp = 150; // Bigger bonus for 7-day streak
    } else if (newStreak > 0 && newStreak % 3 === 0) {
        streakBonusXp = 50; // Bonus for 3-day streak
    }

    const xpEarned = XP_CONFIG.perGame + (gameState.score * XP_CONFIG.perCorrect);
    const totalXpEarned = xpEarned + streakBonusXp;
    const newXp = playerData.xp + totalXpEarned;

    let newLevel = playerData.level;
    const nextLevelData = LEVEL_SCHEDULE.find(l => l.level === newLevel + 1);
    let didLevelUp = false;
    if (nextLevelData && newXp >= nextLevelData.xpRequired) {
        newLevel++;
        didLevelUp = true;
        playLevelUp();
    }

    const newHistory = [...(playerData.gameHistory || []), { score: gameState.score, date: today }].slice(-10); // Keep last 10

    const updatedPlayerData: PlayerData = {
        ...playerData,
        lastPlayedDate: today,
        streak: newStreak,
        xp: newXp,
        level: newLevel,
        gamesPlayed: playerData.gamesPlayed + 1,
        totalCorrectAnswers: playerData.totalCorrectAnswers + gameState.score,
        longestStreak: Math.max(playerData.longestStreak, newStreak, gameState.streak),
        soundEnabled: playerData.soundEnabled,
        gameHistory: newHistory,
    };
    savePlayerData(updatedPlayerData);
    setLastGameResult({ xpEarned: totalXpEarned, didLevelUp, streakBonusXp });
    
    // Notification logic
    if (updatedPlayerData.gamesPlayed === 1) {
      await requestPermissions(); // Request on first game completion
    }
    await scheduleDailyReminder(updatedPlayerData.streak);

    const totalTime = gameState.answerTimes.reduce((acc, time) => acc + time, 0);
    
    try {
        const postGameContent = await generatePostGameContent(currentTopic, playerData.profile, globalTheme.theme);
        if (postGameContent) {
            setDailyContent(postGameContent);
            localStorage.setItem(`HAWAS_DAILY_CONTENT_${today}`, JSON.stringify(postGameContent));
        }
        await submitScore(playerData.username, gameState.score, totalTime);
    } catch (error) {
        console.error("Failed to get post-game content or submit score", error);
    } finally {
        setTimeout(() => {
            hideLoader();
            setGamePhase('level-complete');
        }, 2000);
    }
  }, [playerData, globalTheme, currentTopic, gameState, savePlayerData, playLevelUp, showLoader, hideLoader, requestPermissions, scheduleDailyReminder]);

  const continueGame = (returnHome: boolean) => {
    setShowResultsModal(false);
    if (returnHome || currentQuestionNum >= QUESTIONS_PER_ROUND) {
      handleLevelCompletion();
      return;
    }

    if (showAidRewardModal) {
      return;
    }

    setCurrentQuestionNum(prev => prev + 1);
    loadNextQuestion();
  };
  
  const handleFinishSession = () => {
    setGamePhase('daily-locked');
  };
  
  const handleViewLeaderboard = async () => {
    showLoader();
    const data = await fetchDailyLeaderboard();
    setLeaderboardData(data);
    hideLoader();
    setGamePhase('leaderboard');
  };

  const handleViewStats = () => {
    setGamePhase('personal-stats');
  };

  const handleShareResults = async () => {
    if (!playerData || isSharing) return;

    setIsSharing(true);
    const rank = getRank(gameState.accuracy);
    const emojiResults = gameState.answerHistory.map(r => r === 'correct' ? '🟩' : '🟥').join('');
    const shareText = `حققت رتبة "${rank}" في تحدي هَوَسْ اليومي!\n\nنتيجتي: ${gameState.score}/${QUESTIONS_PER_ROUND}\nسلسلتي اليومية: ${playerData.streak} 🔥\n\n${emojiResults}\n\n#لعبة_هوس`;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'نتيجتي في لعبة هَوَسْ', text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert('تم نسخ النتيجة إلى الحافظة!');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('User cancelled the share dialog.');
      } else {
        console.error('Sharing failed, falling back to clipboard', error);
        try {
          await navigator.clipboard.writeText(shareText);
          alert('فشلت المشاركة. تم نسخ النتيجة إلى الحافظة.');
        } catch (copyError) {
          console.error('Fallback to clipboard also failed', copyError);
          alert('فشلت المشاركة والنسخ.');
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleUseAid = async (type: 'reveal' | 'narrow') => {
    if (!gameState.currentQuestion || !playerData) return;
    
    const cost = AID_COSTS[type];
    if (playerData.xp < cost) {
      alert('ليس لديك نقاط خبرة كافية!');
      return;
    }
    
    playXpSpend();
    const updatedPlayerData = { ...playerData, xp: playerData.xp - cost };
    savePlayerData(updatedPlayerData);

    if (type === 'reveal' && gameState.aids.reveal > 0) {
        setGameState(prev => ({...prev, aids: {...prev.aids, reveal: prev.aids.reveal - 1}}));
        const hint = await generateHint(gameState.currentQuestion.statements.join('\n'), currentTopic);
        setCurrentHint(hint);
    }

    if (type === 'narrow' && gameState.aids.narrow > 0) {
        setGameState(prev => ({...prev, aids: {...prev.aids, narrow: prev.aids.narrow - 1}}));
        const { statements, correct_answer } = gameState.currentQuestion;
        const incorrectIndices = statements.map((_, i) => i).filter(i => i !== correct_answer);
        const shuffled = incorrectIndices.sort(() => Math.random() - 0.5);
        setDisabledAnswers(shuffled.slice(0, 2));
    }
  }

  const handleClaimAid = (type: 'reveal' | 'narrow') => {
      setGameState(prev => ({...prev, aids: {...prev.aids, [type]: prev.aids[type] + 1}}));
      setShowAidRewardModal(false);
      setCurrentQuestionNum(prev => prev + 1);
      loadNextQuestion();
  }
  
  const renderContent = () => {
    if (!playerData && !['username-prompt', 'onboarding', 'loading'].includes(gamePhase)) {
        return null;
    }
      
    switch(gamePhase) {
        case 'username-prompt':
            return <UsernamePrompt onSubmit={handleUsernameSubmit} />;
        case 'onboarding':
            return <OnboardingFlow username={onboardingUsername} onOnboardingComplete={handleOnboardingComplete} />;
        case 'ready-to-start':
            return <ReadyToStart playerData={playerData} onStart={startDailyChallenge} isLoading={isPreparingChallenge} />;
        case 'playing':
            return <GamePlay 
                gameState={gameState} 
                playerData={playerData!}
                currentLevel={playerData!.level}
                currentQuestionNum={currentQuestionNum} 
                currentTopic={currentTopic} 
                showResultsModal={showResultsModal} 
                showAidRewardModal={showAidRewardModal}
                onAnswerSelect={handleAnswerSelect} 
                onContinue={continueGame}
                onUseAid={handleUseAid}
                onClaimAid={handleClaimAid}
                disabledAnswers={disabledAnswers}
                currentHint={currentHint}
                questionsPerRound={QUESTIONS_PER_ROUND}
            />;
        case 'level-complete':
            return <LevelComplete 
                gameState={gameState} 
                playerData={playerData!}
                onFinishSession={handleFinishSession}
                onShareResults={handleShareResults}
                isSharing={isSharing}
                rank={getRank(gameState.accuracy)}
                keyTakeaway={dailyContent?.keyTakeaway || null}
                xpEarned={lastGameResult?.xpEarned ?? 0}
                didLevelUp={lastGameResult?.didLevelUp ?? false}
                streakBonusXp={lastGameResult?.streakBonusXp ?? 0}
            />;
        case 'daily-locked':
            return <DailyLockedScreen 
                playerData={playerData!}
                dailyContent={dailyContent}
                onViewLeaderboard={handleViewLeaderboard} 
                onViewStats={handleViewStats}
            />;
        case 'leaderboard':
            return <Leaderboard 
                data={leaderboardData} 
                onBack={() => setGamePhase('daily-locked')}
                currentUser={playerData?.username}
            />;
        case 'personal-stats':
            return <PersonalStats
                playerData={playerData!}
                onBack={() => setGamePhase('daily-locked')}
            />;
        case 'loading':
        default:
            return null;
    }
  }

  const showTopBar = playerData && gamePhase !== 'username-prompt' && gamePhase !== 'loading' && gamePhase !== 'playing' && gamePhase !== 'onboarding';

  return (
    <>
      <PersistentBackground />
      {showTopBar && (
        <TopBar
            playerData={playerData}
            onShowHowToPlay={() => setShowHowToPlayModal(true)}
            onShowSettings={() => setShowSettingsModal(true)}
        />
      )}
      <div className={showTopBar ? 'pt-20' : ''}>
        {renderContent()}
      </div>
      {showHowToPlayModal && <HowToPlayModal onClose={() => setShowHowToPlayModal(false)} />}
      {showSettingsModal && playerData && (
          <SettingsModal 
              onClose={() => setShowSettingsModal(false)}
              soundEnabled={playerData.soundEnabled}
              onToggleSound={handleToggleSound}
              onResetProgress={handleResetProgress}
          />
      )}
    </>
  );
};

export default App;
