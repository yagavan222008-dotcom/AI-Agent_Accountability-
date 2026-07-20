import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'purple' | 'green' | 'red' | 'blue' | 'yellow';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  color = 'purple',
}) => {
  const colorGlows = {
    purple: 'hover:border-purple-500/30 hover:shadow-purple-500/5',
    green: 'hover:border-emerald-500/30 hover:shadow-emerald-500/5',
    red: 'hover:border-rose-500/30 hover:shadow-rose-500/5',
    blue: 'hover:border-blue-500/30 hover:shadow-blue-500/5',
    yellow: 'hover:border-amber-500/30 hover:shadow-amber-500/5',
  };

  const bgGlows = {
    purple: 'bg-purple-500/10 text-purple-400',
    green: 'bg-emerald-500/10 text-emerald-400',
    red: 'bg-rose-500/10 text-rose-400',
    blue: 'bg-blue-500/10 text-blue-400',
    yellow: 'bg-amber-500/10 text-amber-400',
  };

  return (
    <div className={`glassmorphism-card rounded-xl p-6 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border border-slate-800 ${colorGlows[color]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-400 tracking-wider uppercase">{title}</p>
          <h3 className="text-3xl font-bold mt-2 text-white font-mono tracking-tight transition-all duration-500">
            {value}
          </h3>
        </div>
        <div className={`p-2.5 rounded-lg ${bgGlows[color]}`}>
          {icon}
        </div>
      </div>
      {(description || trend) && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {trend && (
            <span className={`font-semibold ${trend.isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trend.value}
            </span>
          )}
          {description && <span className="text-slate-500">{description}</span>}
        </div>
      )}
    </div>
  );
};
