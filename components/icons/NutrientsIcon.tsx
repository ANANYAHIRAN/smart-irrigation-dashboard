import React from 'react';

export const NutrientsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M12 2.5a5.5 5.5 0 0 1 5.5 5.5v5a5.5 5.5 0 0 1-5.5 5.5H6.5A5.5 5.5 0 0 1 1 13V8A5.5 5.5 0 0 1 6.5 2.5H12Z" />
        <path d="M12 18.5V22" />
        <path d="M8 22h8" />
        <path d="M7 10.5a2.5 2.5 0 1 1 5 0v-2" />
    </svg>
);
