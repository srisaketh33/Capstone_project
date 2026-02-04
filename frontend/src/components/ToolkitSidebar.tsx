import React from 'react';

interface ToolkitSidebarProps {
    prompt: string;
    setPrompt: (value: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
}

const ToolkitSidebar: React.FC<ToolkitSidebarProps> = ({ prompt, setPrompt, onGenerate, isLoading }) => {
    return (
        <div className="h-full flex flex-col bg-white border-r border-gray-200 p-6">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                    <span className="text-2xl">✨</span> AI Toolkit
                </h2>
            </div>

            <div className="space-y-6">
                {/* Prompt Section */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Idea or Prompt
                    </label>
                    <textarea
                        className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none placeholder-gray-400"
                        placeholder="A detective in a city powered by steam..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    />
                </div>

                {/* Generate Button */}
                <button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all shadow-md flex items-center justify-center gap-2
                        ${isLoading
                            ? 'bg-indigo-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
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

                {/* Refinement Tools (Visual Only) */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Refinement Tools
                    </h3>
                    <div className="space-y-2">
                        <button className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 flex items-center gap-2 transition-colors">
                            <span>😉</span> Sentiment Control
                        </button>
                        <button className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 flex items-center gap-2 transition-colors">
                            <span>📝</span> Plot Coherence
                        </button>
                        <button className="w-full py-2 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-700 flex items-center gap-2 transition-colors">
                            <span>🖼️</span> Visual Inspiration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ToolkitSidebar;
