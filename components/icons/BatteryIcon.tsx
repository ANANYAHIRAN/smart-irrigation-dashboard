
import React from 'react';

export const BatteryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m-12.728 0a9 9 0 010-12.728m12.728 0L12 12l6.364-6.364zM5.636 5.636L12 12m0 0L5.636 18.364" />
        <path d="M12 12L5.636 5.636M12 12l6.364 6.364" strokeLinecap="round" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12h2M2 12h2M12 2v2M12 20v2" />
    </svg>
);
