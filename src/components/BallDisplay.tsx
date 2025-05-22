
import React from 'react';
import { cn } from '@/lib/utils';

type BallDisplayProps = {
  number: number;
  inactive?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
};

const BallDisplay = ({ number, inactive, onClick, size = 'md' }: BallDisplayProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl'
  };

  return (
    <div 
      className={cn(
        `pool-ball ball-${number}`, 
        sizeClasses[size], 
        inactive && 'inactive',
        onClick ? 'cursor-pointer hover:scale-105 transition-transform' : '',
      )}
      onClick={onClick}
    >
      {number}
    </div>
  );
};

export default BallDisplay;
