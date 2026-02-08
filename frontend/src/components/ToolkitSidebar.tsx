import React from 'react';

interface ToolkitSidebarProps {
    onLogin: () => void;
    onLogout: () => void;
    onGenerate: () => void;
    isLoading: boolean;
    token: string | null;
    enableSentiment: boolean;
    setEnableSentiment: (v: boolean) => void;
    enablePlot: boolean;
    setEnablePlot: (v: boolean) => void;
    enableVisual: boolean;
    setEnableVisual: (v: boolean) => void;
    onClear: () => void;
    prompt: string;
    setPrompt: (v: string) => void;
}

const ToolkitSidebar: React.FC<ToolkitSidebarProps> = ({
    onGenerate,
    isLoading,
    token,
    enableSentiment,
    setEnableSentiment,
    enablePlot,
    setEnablePlot,
    enableVisual,
    setEnableVisual,
    onClear,
    onLogin,
    onLogout,
    prompt,
    setPrompt
}) => {
    return (
        <div className="h-full flex flex-col bg-white border-r border-gray-200 p-6 overflow-y-auto">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                    <span className="text-2xl">⚡</span> Toolkit
                </h2>
            </div>

            {!token ? (
                <div className="space-y-4">
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-4">
                        <p className="text-sm text-indigo-700 font-medium">
                            Welcome! Click below to unlock the AI generation tools.
                        </p>
                    </div>

                    <button
                        onClick={onLogin}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg shadow-md transition-all active:scale-95"
                    >
                        Log In
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Prompt Input Section */}
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
                            Prompt Forge
                        </h3>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="What should happen next in your story?"
                            className="w-full p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-sm text-indigo-900 placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] resize-none mb-3 shadow-inner"
                        />

                        <button
                            onClick={onGenerate}
                            disabled={isLoading}
                            className={`w-full py-4 px-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2
                            ${isLoading
                                    ? 'bg-indigo-400 cursor-not-allowed opacity-80'
                                    : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-indigo-200'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Forging...</span>
                                </>
                            ) : (
                                <>
                                    <span>✨</span> Generate Narrative
                                </>
                            )}
                        </button>
                    </div>

                    {/* Refinement Tools */}
                    <div>
                        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
                            Refinement Controls
                        </h3>
                        <div className="space-y-2">
                            <button
                                onClick={() => setEnableSentiment(!enableSentiment)}
                                className={`w-full py-3 px-4 border rounded-xl text-sm flex items-center gap-3 transition-all
                                ${enableSentiment
                                        ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'
                                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                                    }`}
                            >
                                <span className="text-lg">😉</span>
                                <span className="font-semibold">Sentiment Control</span>
                            </button>
                            <button
                                onClick={() => setEnablePlot(!enablePlot)}
                                className={`w-full py-3 px-4 border rounded-xl text-sm flex items-center gap-3 transition-all
                                ${enablePlot
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                                    }`}
                            >
                                <span className="text-lg">📝</span>
                                <span className="font-semibold">Plot Coherence</span>
                            </button>
                            <button
                                onClick={() => setEnableVisual(!enableVisual)}
                                className={`w-full py-3 px-4 border rounded-xl text-sm flex items-center gap-3 transition-all
                                ${enableVisual
                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                                        : 'bg-white hover:bg-gray-50 border-gray-900 text-gray-900'
                                    }`}
                            >
                                <span className="text-lg">🖼️</span>
                                <span className="font-semibold">Visual Inspiration</span>
                                {enableVisual && <span className="ml-auto text-[10px] font-bold text-indigo-400">ON</span>}
                            </button>
                        </div>
                    </div>

                    <div className="pt-8 space-y-3 border-t border-gray-100">
                        <button
                            onClick={onClear}
                            className="w-full py-2 px-3 border border-red-100 rounded-lg text-xs text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <span>🗑️</span> Clear Story
                        </button>
                        <button
                            onClick={onLogout}
                            className="w-full py-2 px-3 border border-gray-100 rounded-lg text-xs text-gray-400 hover:bg-gray-50 transition-colors uppercase font-bold tracking-wider"
                        >
                            Sign Out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ToolkitSidebar;
