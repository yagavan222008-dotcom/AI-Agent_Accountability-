import React from 'react';
import { Check } from 'lucide-react';
import { Option } from '../types/decision';

interface OptionScoreBarProps {
  options: Option[];
  chosenOptionId: string;
}

export const OptionScoreBar: React.FC<OptionScoreBarProps> = ({ options, chosenOptionId }) => {
  // Sort options by score descending
  const sortedOptions = [...options].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-4">
      {sortedOptions.map((opt) => {
        const isChosen = opt.option_id === chosenOptionId;
        const percentage = Math.round(opt.score * 100);
        
        return (
          <div key={opt.option_id} className={`p-4 rounded-lg border transition-all duration-300 ${
            isChosen 
              ? 'bg-purple-950/20 border-purple-500/30 shadow-lg shadow-purple-950/10' 
              : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                {isChosen && (
                  <span className="p-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/40">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                <span className={`text-sm font-medium ${isChosen ? 'text-white' : 'text-slate-300'}`}>
                  {opt.option_id}
                </span>
                {isChosen && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    CHOSEN
                  </span>
                )}
              </div>
              <span className={`text-sm font-mono font-bold ${isChosen ? 'text-purple-400' : 'text-slate-400'}`}>
                {(opt.score).toFixed(2)} ({percentage}%)
              </span>
            </div>
            
            <p className={`text-sm mb-3 ${isChosen ? 'text-slate-200' : 'text-slate-400'}`}>
              {opt.description}
            </p>

            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  isChosen 
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 glow-purple' 
                    : 'bg-slate-700'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
