import React from 'react';
import { BookOpen } from 'lucide-react';

interface LayoutProps {
    leftSidebar: React.ReactNode;
    editor: React.ReactNode;
    rightSidebar: React.ReactNode;
    onBackToHome: () => void;
}

const Layout: React.FC<LayoutProps> = ({ leftSidebar, editor, rightSidebar, onBackToHome }) => {
    return (
        <div className="h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
            <header className="px-6 py-3 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                    <h1 className="text-xl font-bold font-serif text-slate-800 tracking-tight">
                        NarrativeForge AI
                    </h1>
                </div>
                <button
                    onClick={onBackToHome}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                    Back to Home
                </button>
            </header>

            {/* Main Content - 3 Column Grid */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left: Toolkit (20%) */}
                <div className="w-80 min-w-[320px] flex-shrink-0 z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                    {leftSidebar}
                </div>

                {/* Center: Editor (Flexible) */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                    <div className="max-w-4xl mx-auto h-full">
                        {editor}
                    </div>
                </div>

                {/* Right: Analysis/Mood Board (25% or fixed width) */}
                <div className="w-96 min-w-[380px] flex-shrink-0 z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
                    {rightSidebar}
                </div>
            </main>
        </div>
    );
};

export default Layout;
