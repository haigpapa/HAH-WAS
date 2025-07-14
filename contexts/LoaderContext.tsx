import React, { createContext, useState, useCallback, useMemo } from 'react';
import TorusLoader from '../components/TorusLoader';

interface LoaderContextType {
  showLoader: (options?: { withIntro?: boolean; wisdom?: string }) => void;
  hideLoader: () => void;
}

const LOADING_TEXTS = [
  "جاري الاتصال بالمصدر...",
  "تجميع المعارف القديمة...",
  "صياغة التحدي...",
  "شحذ الأوهام...",
  "اللحظات الأخيرة قبل الكشف...",
];

export const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaderVisible, setIsLoaderVisible] = useState(false);
  const [showIntroText, setShowIntroText] = useState(false);
  const [displayText, setDisplayText] = useState<string>(LOADING_TEXTS[0]);
  const [isWisdom, setIsWisdom] = useState(false);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  const clearTimers = useCallback(() => {
    if (intervalId) clearInterval(intervalId);
    setIntervalId(null);
  }, [intervalId]);

  const startLoadingCycle = useCallback(() => {
    setDisplayText(LOADING_TEXTS[0]);
    const id = setInterval(() => {
      setDisplayText(prev => {
        const currentIndex = LOADING_TEXTS.indexOf(prev);
        return LOADING_TEXTS[(currentIndex + 1) % LOADING_TEXTS.length];
      });
    }, 2000);
    setIntervalId(id as unknown as number);
  }, []);

  const showLoader = useCallback((options?: { withIntro?: boolean; wisdom?: string }) => {
    clearTimers();
    setIsLoaderVisible(true);
    setShowIntroText(false);
    setIsWisdom(false);

    if (options?.withIntro) {
      setShowIntroText(true);
      // No fallback text logic for the intro screen to keep animation centered.
    } else if (options?.wisdom) {
      setDisplayText(options.wisdom);
      setIsWisdom(true);
    } else {
      startLoadingCycle();
    }
  }, [clearTimers, startLoadingCycle]);

  const hideLoader = useCallback(() => {
    clearTimers();
    setIsLoaderVisible(false);
  }, [clearTimers]);

  const value = useMemo(() => ({ showLoader, hideLoader }), [showLoader, hideLoader]);

  const shouldShowText = !showIntroText;

  return (
    <LoaderContext.Provider value={value}>
      {children}
      {isLoaderVisible && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center animate-fade-in gap-8 p-4">
          <TorusLoader showIntroText={showIntroText} />
          {shouldShowText && (
            <p className={`text-lg text-center text-slate-400 font-mono tracking-widest animate-pulse-fast transition-opacity duration-500`}>
              {isWisdom ? `"${displayText}"` : `[ ${displayText} ]`}
            </p>
          )}
        </div>
      )}
    </LoaderContext.Provider>
  );
};