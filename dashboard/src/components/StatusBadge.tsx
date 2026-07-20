import React from 'react';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: 'verified' | 'tampered' | 'pending';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3.5 py-1.5 gap-2',
  };

  if (status === 'verified') {
    return (
      <span className={`inline-flex items-center font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 glow-green ${sizeClasses[size]}`}>
        <CheckCircle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        <span>Verified ✓</span>
      </span>
    );
  }

  if (status === 'tampered') {
    return (
      <span className={`inline-flex items-center font-medium rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/25 glow-red ${sizeClasses[size]}`}>
        <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        <span>Tampered ✗</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 ${sizeClasses[size]}`}>
      <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4 animate-pulse'} />
      <span>Pending</span>
    </span>
  );
};
