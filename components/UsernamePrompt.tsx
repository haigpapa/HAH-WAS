
import React, { useState } from 'react';

interface UsernamePromptProps {
  onSubmit: (username: string) => void;
}

const UsernamePrompt: React.FC<UsernamePromptProps> = ({ onSubmit }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 3) {
      setError('الرجاء إدخال اسم مستخدم لا يقل عن 3 أحرف.');
      return;
    }
    if (username.trim().length > 15) {
      setError('الرجاء إدخال اسم مستخدم لا يزيد عن 15 حرفًا.');
      return;
    }
    setError('');
    onSubmit(username.trim());
  };

  return (
    <div className="min-h-screen bg-black relative flex items-center justify-center p-4">
      <div className="relative z-10 flex items-center justify-center min-h-screen w-full">
        <div className="max-w-md w-full">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-white mb-4 animate-fade-in">هَوَسْ</h1>
            <p className="text-slate-300 text-lg leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
              مرحباً بك في رحلة كشف أوهام الذكاء الاصطناعي
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 shadow-2xl mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <label htmlFor="username" className="block text-xl font-semibold text-white mb-4 text-center">
              اختر اسم المستخدم الخاص بك
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-center text-lg font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="[ اكتب اسمك هنا ]"
              maxLength={15}
              autoFocus
            />
            {error && <p className="text-red-400 text-sm mt-3 text-center">{error}</p>}
             <button
                type="submit"
                disabled={!username.trim()}
                className="w-full mt-6 bg-white text-black px-8 py-4 rounded-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>[ تأكيد ]</span>
              </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UsernamePrompt;
