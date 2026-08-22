import React from 'react'

export default function Example() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-6 p-4">
            {/* Card 1: Basic (Light slate bg, reduced height pb-6) */}
            <div className="w-72 bg-slate-50 text-center text-gray-800/80 border border-gray-200 p-6 pb-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <p className="font-semibold text-gray-900">Basic</p>
                <h1 className="text-3xl font-semibold text-gray-900">$29<span className="text-gray-500 text-sm font-normal">/month</span></h1>
                <ul className="list-none text-gray-500 text-sm mt-5 space-y-1 text-left">
                    <li className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <path d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z" fill="#6366F1"/>
                        </svg>
                        <p className="truncate">Access to all basic courses</p>
                    </li>
                    <li className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <path d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z" fill="#6366F1"/>
                        </svg>
                        <p className="truncate">Community support</p>
                    </li>
                    <li className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <path d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z" fill="#6366F1"/>
                        </svg>
                        <p className="truncate">10 practice projects</p>
                    </li>
                    <li className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <path d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z" fill="#6366F1"/>
                        </svg>
                        <p className="truncate">Course completion certificate</p>
                    </li>
                    <li className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <path d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z" fill="#6366F1"/>
                        </svg>
                        <p className="truncate">Basic code review</p>
                    </li>
                </ul>
                <button type="button" className="bg-indigo-500 text-sm w-full py-2 rounded-lg text-white font-medium mt-6 hover:bg-indigo-600 transition-all cursor-pointer">
                    Get Started
                </button>
            </div>
        
            {/* Card 2: Pro (Indigo Gradient bg, reduced height pb-8) */}
            <div className="w-72 bg-gradient-to-br from-indigo-500 to-indigo-600 relative text-center text-white border border-indigo-400 p-6 pb-8 rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-shadow">
                <p className="absolute px-3 text-xs -top-2.5 left-1/2 -translate-x-1/2 py-0.5 bg-[#8789FB] rounded-full uppercase tracking-wider font-bold">Most Popular</p>
                <p className="font-semibold pt-1">Pro</p>
                <h1 className="text-3xl font-semibold">$79<span className="text-sm font-normal text-indigo-100">/month</span></h1>
                <ul className="list-none text-white text-sm mt-5 space-y-1 text-left">
                    <li className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <path d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z" fill="currentColor"/>
                        </svg>
                        <p className="truncate">Access to all Pro courses</p>
                    </li>
                    <li className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <path d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z" fill="currentColor"/>
                        </svg>
                        <p className="truncate">Priority community support</p>
                    </li>
                    <li className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <path d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z" fill="currentColor"/>
                        </svg>
                        <p className="truncate">30 practice projects</p>
                    </li>
                    <li className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <path d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z" fill="currentColor"/>
                        </svg>
                        <p className="truncate">Course completion certificate</p>
                    </li>
                    <li className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <path d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z" fill="currentColor"/>
                        </svg>
                        <p className="truncate">Advance code review</p>
                    </li>
                </ul>
                <button type="button" className="bg-white text-sm w-full py-2 rounded-lg text-indigo-500 font-medium mt-6 hover:bg-gray-100 transition-all cursor-pointer">
                    Get Started
                </button>
            </div>
        
            {/* Card 3: Enterprise (Amber/Yellow bg, reduced height pb-8) */}
            <div className="w-72 bg-amber-50 text-center text-gray-800/80 border border-amber-200 p-6 pb-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <p className="font-semibold text-amber-900">Enterprise</p>
                <h1 className="text-3xl font-semibold text-amber-900">$199<span className="text-amber-600 text-sm font-normal">/month</span></h1>
                <ul className="list-none text-amber-700/80 text-sm mt-5 space-y-1 text-left">
                    <li className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <path d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z" fill="#D97706"/>
                        </svg>
                        <p className="truncate text-amber-900/90">Access to all courses</p>
                    </li>
                    <li className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <path d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z" fill="#D97706"/>
                        </svg>
                        <p className="truncate text-amber-900/90">Dedicated support</p>
                    </li>
                    <li className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <path d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z" fill="#D97706"/>
                        </svg>
                        <p className="truncate text-amber-900/90">Unlimited projects</p>
                    </li>
                    <li className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <path d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z" fill="#D97706"/>
                        </svg>
                        <p className="truncate text-amber-900/90">Course completion certificate</p>
                    </li>
                    <li className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                            <path d="M7.162 13.5 2.887 9.225l1.07-1.069 3.205 3.207 6.882-6.882 1.069 1.07z" fill="#D97706"/>
                        </svg>
                        <p className="truncate text-amber-900/90">Premium code review</p>
                    </li>
                </ul>
                <button type="button" className="bg-amber-600 text-sm w-full py-2 rounded-lg text-white font-medium mt-6 hover:bg-amber-700 transition-all cursor-pointer">
                    Get Started
                </button>
            </div>
        </div>
    );
}
