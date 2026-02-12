import React, { ReactNode } from 'react';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hoverEffect?: boolean;
}

const GlassCard = ({ children, className = '', hoverEffect = false }: GlassCardProps) => {
    return (
        <div
            className={`
        relative overflow-hidden
        bg-white/60 backdrop-blur-xl
        border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]
        rounded-2xl p-6
        transition-all duration-300 ease-out
        ${hoverEffect ? 'hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:translate-y-[-2px] hover:border-blue-500/20' : ''}
        ${className}
      `}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent pointer-events-none" />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default GlassCard;
