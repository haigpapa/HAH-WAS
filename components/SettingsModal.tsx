
import React from 'react';
import { X, Volume2, VolumeX, AlertTriangle, Trash2 } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetProgress: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, soundEnabled, onToggleSound, onResetProgress }) => {
    
    const handleResetClick = () => {
        if (window.confirm("تحذير! هل أنت متأكد من رغبتك في إعادة تعيين كل تقدمك؟ هذا الإجراء لا يمكن التراجع عنه.")) {
            if(window.confirm("التأكيد الأخير. كل مستواك ونقاطك وسلسلتك ستُمحى نهائياً. متابعة؟")) {
                onResetProgress();
            }
        }
    };

    return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-slate-900/80 border border-white/20 rounded-2xl shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center text-white mb-8">الإعدادات</h2>
          <div className="space-y-6">

            <div className="flex items-center justify-between bg-black/40 p-4 rounded-lg">
                <label htmlFor="sound-toggle" className="text-lg text-white">المؤثرات الصوتية</label>
                <button 
                    id="sound-toggle"
                    onClick={onToggleSound} 
                    className={`relative inline-flex items-center h-8 rounded-full w-16 transition-colors ${soundEnabled ? 'bg-cyan-500' : 'bg-slate-700'}`}
                >
                    <span className={`inline-block w-6 h-6 transform bg-white rounded-full transition-transform ${soundEnabled ? 'translate-x-9' : 'translate-x-1'}`} />
                    <span className="absolute left-2.5 text-cyan-800">
                        {soundEnabled && <Volume2 size={16}/>}
                    </span>
                    <span className="absolute right-2.5 text-slate-400">
                        {!soundEnabled && <VolumeX size={16}/>}
                    </span>
                </button>
            </div>
            
            <div className="border-t border-white/10 pt-6">
                 <h3 className="text-lg text-red-400 mb-2 flex items-center gap-2">
                    <AlertTriangle size={20} />
                    <span>منطقة الخطر</span>
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                    إعادة تعيين تقدمك سيمحو كل بياناتك، بما في ذلك مستواك، نقاط الخبرة، وسلسلة انتصاراتك.
                </p>
                <button
                    onClick={handleResetClick}
                    className="w-full flex items-center justify-center gap-2 bg-red-600/20 text-red-300 border border-red-500/50 rounded-lg py-3 hover:bg-red-600/40 hover:text-white transition-colors"
                >
                    <Trash2 size={16} />
                    <span>إعادة تعيين التقدم</span>
                </button>
            </div>

          </div>
        </div>
      </div>
    </div>
    );
};

export default SettingsModal;