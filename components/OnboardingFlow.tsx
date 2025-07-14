
import React, { useState, useMemo } from 'react';
import { OnboardingProfile } from '../types';
import { generatePersonalizedNote } from '../services/geminiService';
import { useLoader } from '../hooks/useLoader';

interface OnboardingFlowProps {
  username: string;
  onOnboardingComplete: (profile: OnboardingProfile) => void;
}

type Question = {
    key: keyof Omit<OnboardingProfile, 'personalizedNote' | 'interests'>;
    question: string;
    options: {
        text: string;
        value: any;
    }[];
} | {
    key: 'interests';
    question: string;
    options: {
        text: string;
        value: 'science' | 'culture' | 'arts' | 'mixed';
    }[];
};

const ONBOARDING_QUESTIONS: Question[] = [
    {
        key: 'experienceLevel',
        question: "ما هو مستوى معرفتك بالمواضيع العامة والتاريخية؟",
        options: [
            { text: "مبتدئ، أتعلم الأساسيات", value: 'beginner' },
            { text: "متوسط، لدي معرفة جيدة", value: 'intermediate' },
            { text: "متقدم، أحب التفاصيل الدقيقة", value: 'advanced' },
        ],
    },
    {
        key: 'interests',
        question: "أي من هذه المجالات يثير اهتمامك أكثر؟",
        options: [
            { text: "العلوم والاكتشافات", value: 'science' },
            { text: "الفنون والثقافة", value: 'arts' },
            { text: "مزيج من كل شيء", value: 'mixed' },
        ],
    },
    {
        key: 'learningGoals',
        question: "ما هو هدفك الأساسي من لعب هَوَسْ؟",
        options: [
            { text: "التعلم وتوسيع معرفتي", value: 'education' },
            { text: "التسلية وتمضية الوقت", value: 'entertainment' },
            { text: "مزيج من الاثنين", value: 'mixed' },
        ],
    },
    {
        key: 'culturalDepth',
        question: "إلى أي مدى تفضل التعمق في التفاصيل الثقافية؟",
        options: [
            { text: "بشكل بسيط ومباشر", value: 'minimal' },
            { text: "بشكل معتدل مع بعض التفاصيل", value: 'moderate' },
            { text: "بشكل غني ومليء بالمعلومات", value: 'rich' },
        ],
    },
];


const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ username, onOnboardingComplete }) => {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Partial<Omit<OnboardingProfile, 'personalizedNote'>>>({});
    const { showLoader, hideLoader } = useLoader();

    const handleAnswerSelect = (key: string, value: any) => {
        const newAnswers = { ...answers, [key]: value };
        setAnswers(newAnswers);

        if (step < ONBOARDING_QUESTIONS.length - 1) {
            setStep(step + 1);
        } else {
            finishOnboarding(newAnswers as Omit<OnboardingProfile, 'personalizedNote'>);
        }
    };

    const finishOnboarding = async (finalAnswers: Omit<OnboardingProfile, 'personalizedNote'>) => {
        showLoader({ wisdom: 'تخصيص تجربتك...' });
        try {
            const personalizedNote = await generatePersonalizedNote(finalAnswers);
            const completeProfile: OnboardingProfile = {
                ...finalAnswers,
                personalizedNote
            };
            onOnboardingComplete(completeProfile);
        } catch (error) {
            console.error("Failed to finish onboarding:", error);
            // Fallback if note generation fails
            const fallbackProfile: OnboardingProfile = {
                ...finalAnswers,
                personalizedNote: "تم إعداد تجربتك لكشف أوهام الذكاء الاصطناعي. استعد."
            };
            onOnboardingComplete(fallbackProfile);
        } finally {
             // hideLoader() will be called by the parent component after loading questions
        }
    };
    
    const currentQuestion = ONBOARDING_QUESTIONS[step];
    const progressPercentage = ((step + 1) / ONBOARDING_QUESTIONS.length) * 100;

    return (
        <div className="min-h-screen bg-black relative flex items-center justify-center p-4 animate-fade-in">
            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">مرحباً بك، {username}!</h1>
                    <p className="text-slate-400">لنبني لك تجربة فريدة. ({step + 1}/{ONBOARDING_QUESTIONS.length})</p>
                </div>

                <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 shadow-2xl">
                    <div className="mb-8">
                      <div className="w-full bg-black/30 rounded-full h-2 border border-white/10">
                         <div
                            className="bg-cyan-400 h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progressPercentage}%` }}
                         />
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-semibold text-white mb-6 text-center leading-relaxed">
                        {currentQuestion.question}
                    </h2>

                    <div className="space-y-3">
                        {currentQuestion.options.map(option => (
                             <button 
                                key={option.value}
                                onClick={() => handleAnswerSelect(currentQuestion.key, option.value)}
                                className="w-full p-4 text-right border border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 text-slate-200 rounded-lg transition-all duration-300"
                            >
                                <span className="text-lg">{option.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingFlow;
