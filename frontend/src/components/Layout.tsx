import { BookOpen, LogOut, Shield } from 'lucide-react';

interface LayoutProps {
    username?: string;
    role?: string;
    leftSidebar: React.ReactNode;
    editor: React.ReactNode;
    rightSidebar: React.ReactNode;
    onLogout: () => void;
    onOpenAdmin?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ username, role, leftSidebar, editor, rightSidebar, onLogout, onOpenAdmin }) => {
    return (
        <div className="h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
            <header className="px-6 py-3 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
                <div className="flex-1 flex items-center gap-4">
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
                        Hi {username || 'Storyteller'}
                    </span>
                    {role?.toLowerCase() === 'admin' && (
                        <button
                            onClick={onOpenAdmin}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all border border-indigo-100 uppercase tracking-wider"
                        >
                            <Shield className="w-3.5 h-3.5" />
                            Admin Dashboard
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 justify-center flex-1">
                    <BookOpen className="w-6 h-6 text-indigo-600" />
                    <h1 className="text-xl font-bold font-serif text-slate-800 tracking-tight">
                        NarrativeForge AI
                    </h1>
                </div>

                <div className="flex items-center gap-4 flex-1 justify-end">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                    >
                        <LogOut className="w-4 h-4" />
                        Log Out
                    </button>
                </div>
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
