import React, { useState } from 'react';
import { analyzeUrl } from './services/geminiService';
import type { AnalysisResult } from './types';
import AnalysisResultDisplay from './components/AnalysisResult';
import { LinkIcon } from './components/icons';

const LoadingIndicator: React.FC = () => (
    <div className="mt-12 flex flex-col items-center justify-center space-y-4 animate-fade-in">
        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
        </div>
        <p className="text-lg text-gray-400">در حال تجزیه و تحلیل... این فرآیند ممکن است کمی طول بکشد.</p>
    </div>
);

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('لطفاً یک لینک معتبر وارد کنید.');
      return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        setError('لینک باید با http:// یا https:// شروع شود.');
        return;
    }

    setIsLoading(true);
    setAnalysisResult(null);
    setError(null);

    try {
      const result = await analyzeUrl(url);
      setAnalysisResult(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('یک خطای ناشناخته رخ داد.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 text-gray-100 overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-96 h-96 bg-blue-900/50 rounded-full filter blur-3xl opacity-60 -z-10 animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-96 h-96 bg-teal-900/50 rounded-full filter blur-3xl opacity-60 -z-10 animate-pulse [animation-delay:2s]"></div>

      <main className="w-full max-w-2xl flex flex-col items-center text-center z-10">
        
        <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 shadow-lg">
           <svg className="w-12 h-12 text-teal-300" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
           </svg>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300 mb-2">
          تحلیلگر لینک هوشمند
        </h1>
        <p className="text-lg text-gray-400 mb-10">
          با خیال راحت در وب گشت و گذار کنید. لینک‌ها را قبل از کلیک بررسی کنید.
        </p>

        <form onSubmit={handleSubmit} className="w-full mb-4">
          <div className="relative group">
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <LinkIcon className="w-5 h-5 text-gray-400 group-focus-within:text-teal-300 transition-colors" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full p-4 pr-12 text-lg text-gray-200 bg-gray-900/50 backdrop-blur-sm border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400 transition-all duration-300 shadow-md placeholder:text-gray-500"
              disabled={isLoading}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-5 flex items-center justify-center p-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl hover:from-blue-700 hover:to-teal-600 disabled:from-blue-800/50 disabled:to-teal-700/50 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:ring-4 focus:ring-teal-500/50 shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30"
          >
            {isLoading ? (
                <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="mr-3 rtl:mr-0 rtl:ml-3">در حال بررسی...</span>
                </>
            ) : 'بررسی لینک'}
          </button>
        </form>
        
        {error && (
            <div className="w-full mt-4 p-4 text-red-300 bg-red-900/30 border border-red-500/50 rounded-xl backdrop-blur-sm animate-fade-in">
                <p>{error}</p>
            </div>
        )}
        
        {isLoading && <LoadingIndicator />}
        
        {analysisResult && <AnalysisResultDisplay result={analysisResult} />}
      </main>

       <footer className="mt-16 text-gray-500 text-sm z-10">
          <p>ساخته شده با Gemini API</p>
        </footer>
    </div>
  );
};

export default App;
