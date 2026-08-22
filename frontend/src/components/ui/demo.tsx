import React from 'react'

export default function Example() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-6 p-4">
            
            {/* Card 1: Starter Card (Teal Theme, reduced height/padding) */}
            <div className="relative max-w-85 w-full">
                <div className="mt-4 rounded-xl border border-gray-200 bg-teal-50/10 shadow-md">
                    <div className="border-b p-4">
                        <h3 className="text-xl font-bold text-teal-800">Starter</h3>
                        <p className="text-gray-400 text-xs">Perfect for individuals</p>
                    </div>
            
                    <div className="p-4">
                        <div className="mb-3 flex items-baseline">
                            <span className="text-2xl font-bold text-teal-800">$19</span>
                            <span className="ml-1 text-xs text-gray-500">/month</span>
                        </div>
            
                        <ul className="space-y-1.5 text-gray-600">
                            <li className="flex items-center gap-2">
                                <svg className="h-4 w-4 text-teal-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs">Single project & user</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="h-4 w-4 text-teal-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs">10GB storage space</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="h-4 w-4 text-teal-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs">Standard community support</span>
                            </li>
                        </ul>
                    </div>
            
                    <div className="border-t p-4">
                        <button className="w-full rounded-lg bg-teal-600 hover:bg-teal-700 px-4 py-2 text-white text-xs font-semibold transition-opacity cursor-pointer">
                            Choose Starter
                        </button>
                    </div>
                </div>
            </div>

            {/* Card 2: Business Card (Orange/Pink Ribbon, dark border, reduced height/padding) */}
            <div className="relative max-w-85 w-full">
                <div className="absolute inset-x-0 -top-2 flex justify-center z-10">
                    <span className="rounded-full bg-gradient-to-r from-orange-400 to-pink-500 px-3.5 py-0.5 text-[10px] font-semibold text-white">
                        Most Popular
                    </span>
                </div>
            
                <div className="mt-4 rounded-xl border border-gray-800 bg-white shadow-md">
                    <div className="border-b p-4 pt-5">
                        <h3 className="text-xl font-bold">Business</h3>
                        <p className="text-gray-500 text-xs">Perfect for growing businesses</p>
                    </div>
            
                    <div className="p-4">
                        <div className="mb-3 flex items-baseline">
                            <span className="text-2xl font-bold">$79</span>
                            <span className="ml-1 text-xs text-gray-500">/month</span>
                        </div>
            
                        <ul className="space-y-1.5 text-gray-500">
                            <li className="flex items-center gap-2">
                                <svg className="h-4 w-4 text-blue-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs">Unlimited projects & users</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="h-4 w-4 text-blue-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs">500GB storage</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="h-4 w-4 text-blue-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs">24/7 premium support</span>
                            </li>
                        </ul>
                    </div>
            
                    <div className="border-t p-4">
                        <button className="w-full rounded-lg bg-gray-800 hover:bg-gray-900 px-4 py-2 text-white text-xs font-semibold transition-opacity cursor-pointer">
                            Choose Business
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
