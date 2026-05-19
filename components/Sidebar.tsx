
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { DashboardIcon } from './icons/DashboardIcon';
import { NutrientsIcon } from './icons/NutrientsIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { InfoIcon } from './icons/InfoIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface SidebarProps {
    openInfoModal: () => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}


export const Sidebar: React.FC<SidebarProps> = ({ openInfoModal, isSidebarOpen, setIsSidebarOpen }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const closeSidebarMobile = () => {
        if (isSidebarOpen) setIsSidebarOpen(false);
    }

    const navLinkClass = ({ isActive }: { isActive: boolean }) => `
        flex items-center w-full h-11 px-3 rounded-xl transition-all duration-200 group
        ${isActive
            ? 'bg-white dark:bg-white/10 text-apple-blue shadow-apple'
            : 'text-light-on-surface-variant dark:text-on-surface-variant hover:bg-white/50 dark:hover:bg-white/5'
        }
    `;

    const iconClass = (isActive: boolean) => `
        ${isActive ? 'text-apple-blue' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}
    `;

    return (
        <>
            {/* Mobile overlay */}
            <div className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-20 transition-opacity lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)}></div>

            <aside className={`fixed lg:relative z-20 flex flex-col h-screen 
            bg-white/70 dark:bg-surface/70 backdrop-blur-xl border-r border-white/20 dark:border-white/5 
            p-4 transition-all duration-300 shadow-xl lg:shadow-none
            ${isCollapsed ? 'w-20' : 'w-72'}
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
        `}>
                <div className={`flex items-center mb-10 mt-2 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
                    {!isCollapsed ? (
                        <h2 className="text-2xl font-bold tracking-tight text-light-on-surface dark:text-white">
                            Smart <span className="text-apple-blue">Farm</span>
                        </h2>
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-apple-blue"></div>
                    )}
                </div>

                <nav className="flex-grow space-y-1">
                    {/* Dashboard */}
                    <NavLink to="/" onClick={closeSidebarMobile} className={navLinkClass}>
                        {({ isActive }) => (
                            <>
                                <div className={iconClass(isActive)}>
                                    <DashboardIcon className="w-5 h-5" />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium text-sm">Dashboard</span>}
                            </>
                        )}
                    </NavLink>

                    {/* Nutrients */}
                    <NavLink to="/nutrients" onClick={closeSidebarMobile} className={navLinkClass}>
                        {({ isActive }) => (
                            <>
                                <div className={iconClass(isActive)}>
                                    <NutrientsIcon className="w-5 h-5" />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium text-sm">Nutrients</span>}
                            </>
                        )}
                    </NavLink>

                    {/* History */}
                    <NavLink to="/history" onClick={closeSidebarMobile} className={navLinkClass}>
                        {({ isActive }) => (
                            <>
                                <div className={iconClass(isActive)}>
                                    <HistoryIcon className="w-5 h-5" />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium text-sm">History</span>}
                            </>
                        )}
                    </NavLink>

                    {/* Settings */}
                    <NavLink to="/settings" onClick={closeSidebarMobile} className={navLinkClass}>
                        {({ isActive }) => (
                            <>
                                <div className={iconClass(isActive)}>
                                    <SettingsIcon className="w-5 h-5" />
                                </div>
                                {!isCollapsed && <span className="ml-3 font-medium text-sm">Settings</span>}
                            </>
                        )}
                    </NavLink>
                </nav>

                <div className="mt-auto space-y-1">
                    <button
                        onClick={openInfoModal}
                        className="flex items-center w-full h-11 px-3 rounded-xl text-light-on-surface-variant dark:text-on-surface-variant hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-200 group"
                    >
                        <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                            <InfoIcon className="w-5 h-5" />
                        </div>
                        {!isCollapsed && <span className="ml-3 font-medium text-sm">System Info</span>}
                    </button>

                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="hidden lg:flex items-center w-full h-11 px-3 rounded-xl text-light-on-surface-variant dark:text-on-surface-variant hover:bg-white/50 dark:hover:bg-white/5 transition-all duration-200 group"
                    >
                        <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300">
                            {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
                        </div>
                        {!isCollapsed && <span className="ml-3 font-medium text-sm">Collapse</span>}
                    </button>
                </div>
            </aside>
        </>
    );
};
