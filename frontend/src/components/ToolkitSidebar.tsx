import React from 'react';
import {
    Zap,
    Sparkles,
    Smile,
    GitBranch,
    Image as ImageIcon,
    Trash2,
    History,
    ArrowLeft
} from 'lucide-react';

interface ToolkitSidebarProps {
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
    onBackToHome: () => void;
    onFetchHistory: () => void;
    prompt: string;
    setPrompt: (v: string) => void;
}

const ToolkitSidebar: React.FC<ToolkitSidebarProps> = ({
    onGenerate,
    isLoading,
    enableSentiment,
    setEnableSentiment,
    enablePlot,
    setEnablePlot,
    enableVisual,
    setEnableVisual,
    onClear,
    onBackToHome,
    onFetchHistory,
    prompt,
    setPrompt
}) => {
    return (
        <div className="h-full flex flex-col bg-white border-r border-gray-200 p-6 overflow-y-auto">
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-600 fill-indigo-600" /> Toolkit
                </h2>
            </div>

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
                </div>

                {/* Refinement Tools */}
                <div>
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
                        Refinement Controls
                    </h3>
                    <div className="space-y-2">
                        <button
                            onClick={() => setEnableSentiment(!enableSentiment)}
                            title="love, joy, anger, fear, sadness, surprise"
                            className={`w-full py-3 px-4 border rounded-xl text-sm flex items-center gap-3 transition-all
                            ${enableSentiment
                                    ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'
                                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                                }`}
                        >
                            <Smile className={`w-5 h-5 ${enableSentiment ? 'text-rose-500' : 'text-gray-400'}`} />
                            <span className="font-semibold">Emotion Mix</span>
                        </button>
                        <button
                            onClick={() => setEnablePlot(!enablePlot)}
                            title="scenes and character conversations"
                            className={`w-full py-3 px-4 border rounded-xl text-sm flex items-center gap-3 transition-all
                            ${enablePlot
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm'
                                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                                }`}
                        >
                            <GitBranch className={`w-5 h-5 ${enablePlot ? 'text-emerald-500' : 'text-gray-400'}`} />
                            <span className="font-semibold">Story Plot</span>
                        </button>
                        <button
                            onClick={() => setEnableVisual(!enableVisual)}
                            title="your story and images created by AI"
                            className={`w-full py-3 px-4 border rounded-xl text-sm flex items-center gap-3 transition-all
                            ${enableVisual
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                                    : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
                                }`}
                        >
                            <ImageIcon className={`w-5 h-5 ${enableVisual ? 'text-indigo-500' : 'text-gray-600'}`} />
                            <span className="font-semibold">Image Ideas</span>
                        </button>
                    </div>
                </div>

                {/* Generate Button Section (Moved Down) */}
                <div>
                    {!enableSentiment && !enablePlot && !enableVisual ? (
                        <div className="mb-3 p-3 bg-amber-50 border border-amber-100 rounded-xl text-[11px] text-amber-700 font-medium animate-pulse">
                            ⚠️ Select at least one Refinement Control above to enable Forge.
                        </div>
                    ) : null}

                    <button
                        onClick={onGenerate}
                        disabled={isLoading || (!enableSentiment && !enablePlot && !enableVisual)}
                        className={`w-full py-4 px-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2
                        ${isLoading || (!enableSentiment && !enablePlot && !enableVisual)
                                ? 'bg-gray-300 cursor-not-allowed shadow-none'
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
                                <Sparkles className="w-5 h-5" />
                                <span>Generate Narrative</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="pt-8 space-y-3 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={onClear}
                            className="py-2 px-3 border border-red-100 rounded-lg text-[10px] text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-1 font-bold"
                        >
                            <Trash2 className="w-3 h-3" /> Clear
                        </button>
                        <button
                            onClick={onFetchHistory}
                            className="py-2 px-3 border border-indigo-100 rounded-lg text-[10px] text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1 font-bold"
                        >
                            <History className="w-3 h-3" /> History
                        </button>
                    </div>
                    <button
                        onClick={onBackToHome}
                        className="w-full py-3 px-3 bg-gray-900 text-white rounded-xl text-xs hover:bg-gray-800 transition-all uppercase font-bold tracking-wider flex items-center justify-center gap-2 shadow-lg"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Home</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ToolkitSidebar;
