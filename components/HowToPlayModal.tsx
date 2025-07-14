
import React from 'react';
import { X, Target, CalendarDays, TrendingUp, Sparkles } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

const InfoCard: React.FC<{ icon: React.ReactNode, title: string, children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-black/40 p-4 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
            {icon}
            <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{children}</p>
    </div>
);

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900/80 border border-white/20 rounded-2xl shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-white mb-6">كيفية اللعب</h2>
          <div className="space-y-4">
              <InfoCard icon={<Target size={20} className="text-cyan-400" />} title="الهدف">
                  في كل جولة، ستُعرض عليك 4 عبارات. ثلاث منها حقائق، وواحدة "وهم" (معلومة خاطئة مولّدة بالذكاء الاصطناعي). مهمتك هي كشف الوهم.
              </InfoCard>
              <InfoCard icon={<CalendarDays size={20} className="text-cyan-400" />} title="القواعد اليومية">
                  تحصل على تحدي واحد جديد كل يوم يتكون من 8 أسئلة. العب بتركيز لبناء سلسلة انتصاراتك اليومية!
              </InfoCard>
              <InfoCard icon={<TrendingUp size={20} className="text-cyan-400" />} title="التقدم والخبرة">
                  كل إجابة صحيحة تمنحك نقاط خبرة (XP) تساهم في رفع مستواك. الحفاظ على سلسلة انتصارات يومية متتالية يمنحك مكافآت.
              </InfoCard>
               <InfoCard icon={<Sparkles size={20} className="text-cyan-400" />} title="طلب المساعدة">
                  هل تحتاج إلى مساعدة؟ يمكنك استخدام نقاط الخبرة للحصول على تلميحات ("كَشْف") أو لتقليص الخيارات ("تَقْلِيص"). لكل مساعدة تكلفتها الخاصة.
              </InfoCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;