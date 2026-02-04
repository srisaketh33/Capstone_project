import React from 'react';

interface LayoutProps {
    leftSidebar: React.ReactNode;
    editor: React.ReactNode;
    rightSidebar: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ leftSidebar, editor, rightSidebar }) => {
    return (
        <div className="h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
            {/* Header */}
            <header className="px-6 py-3 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🤖</span>
                    <h1 className="text-xl font-bold font-serif text-indigo-900 tracking-tight">
                        StoryCraft AI
                    </h1>
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    Export
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

