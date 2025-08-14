import React from 'react';
import { SafetyLevel } from '../types';
import type { AnalysisResult } from '../types';
import { ShieldCheckIcon, ShieldExclamationIcon, ShieldXIcon, ExternalLinkIcon } from './icons';

interface AnalysisResultProps {
  result: AnalysisResult;
}

const resultConfig = {
  [SafetyLevel.SAFE]: {
    title: 'این لینک امن به نظر می‌رسد',
    Icon: ShieldCheckIcon,
    containerClasses: 'bg-green-900/20 border-green-400/30 shadow-lg shadow-green-500/10',
    iconClasses: 'text-green-400',
    titleClasses: 'text-green-300',
  },
  [SafetyLevel.CAUTION]: {
    title: 'احتیاط کنید',
    Icon: ShieldExclamationIcon,
    containerClasses: 'bg-yellow-900/20 border-yellow-400/30 shadow-lg shadow-yellow-500/10',
    iconClasses: 'text-yellow-400',
    titleClasses: 'text-yellow-300',
  },
  [SafetyLevel.DANGEROUS]: {
    title: 'لینک خطرناک شناسایی شد',
    Icon: ShieldXIcon,
    containerClasses: 'bg-red-900/20 border-red-400/30 shadow-lg shadow-red-500/10',
    iconClasses: 'text-red-400',
    titleClasses: 'text-red-300',
  },
};

const AnalysisResultDisplay: React.FC<AnalysisResultProps> = ({ result }) => {
  const config = resultConfig[result.safetyLevel];

  if (!config) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mt-8 space-y-6 animate-fade-in">
      {/* Card 1: Main Status & Summary */}
      <div className={`w-full p-6 border rounded-xl backdrop-blur-md ${config.containerClasses} transition-all duration-500`}>
        <div className="flex items-start">
          <config.Icon className={`w-10 h-10 ml-4 flex-shrink-0 ${config.iconClasses}`} />
          <div className="flex-grow">
            <h2 className={`text-2xl font-bold ${config.titleClasses}`}>{config.title}</h2>
            <p className="text-gray-300 mt-2 text-base leading-relaxed">{result.summary}</p>
          </div>
        </div>
      </div>

      {/* Card 2: Details */}
      <div className="w-full p-6 border border-gray-700/50 bg-gray-800/30 rounded-xl shadow-lg backdrop-blur-md">
        <h3 className="text-xl font-semibold text-gray-200 mb-4">جزئیات تحلیل</h3>
        <p className="text-gray-400 whitespace-pre-wrap leading-relaxed">{result.details}</p>
      </div>

      {/* Card 3: Sources */}
      {result.sources && result.sources.length > 0 && (
        <div className="w-full p-6 border border-gray-700/50 bg-gray-800/30 rounded-xl shadow-lg backdrop-blur-md">
          <h3 className="text-xl font-semibold text-gray-200 mb-4">منابع بررسی شده</h3>
          <ul className="space-y-3">
            {result.sources.map((source, index) => (
              <li key={index} className="flex items-center space-x-3 rtl:space-x-reverse">
                 <ExternalLinkIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                 <a 
                   href={source.uri} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-blue-400 hover:text-blue-300 hover:underline transition-colors truncate"
                   title={source.uri}
                 >
                   {source.title || source.uri}
                 </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnalysisResultDisplay;
