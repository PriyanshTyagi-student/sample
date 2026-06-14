'use client';

import React from 'react';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'primary',
  children,
  icon,
  size = 'md',
  className = '',
  loading = false,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-6 py-2',
    lg: 'px-8 py-3 text-lg',
  };

  const baseClasses = `rounded-lg font-medium transition-all border backdrop-blur-xl flex items-center gap-2 ${sizeClasses[size]}`;

  const variantClasses = {
    primary: 'bg-white/10 hover:bg-white/20 border-white/20 text-white',
    secondary: 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80',
    danger: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-300',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};
