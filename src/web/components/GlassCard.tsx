import React, { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverEffect = false }) => {
    return (
        <div
            className={`
        relative overflow-hidden
        bg-white/80 backdrop-blur-md
        border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]
        rounded-2xl p-8
        transition-all duration-300
        ${hoverEffect ? 'hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 hover:border-indigo-500/20 cursor-pointer' : ''}
        ${className}
      `}
        >
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default GlassCard;
