import React, { useState } from 'react';
import MoodBoard from './MoodBoard';

interface RightSidebarProps {
    images: string[];
    sentiment: { [key: string]: number };
}

const RightSidebar: React.FC<RightSidebarProps> = ({ images, sentiment }) => {
    const [activeTab, setActiveTab] = useState<'analysis' | 'moodboard'>('moodboard');

    return (
        <div className="h-full flex flex-col bg-white border-l border-gray-200">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('analysis')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 
                    ${activeTab === 'analysis'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    🤖 Analysis
                </button>
                <button
                    onClick={() => setActiveTab('moodboard')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 
                    ${activeTab === 'moodboard'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    🖼️ Mood Board
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                {activeTab === 'analysis' ? (
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h3 className="text-lg font-serif font-bold text-gray-900 mb-2">Analysis</h3>
                            <p className="text-sm text-gray-500 mb-4">Results from AI analysis tools will appear here.</p>

                            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-2 mb-2">
                                    <span>✨</span> Getting Started
                                </h4>
                                <p className="text-xs text-indigo-800 leading-relaxed">
                                    Welcome to Story Forge! Enter a story idea in the <b>AI Toolkit</b> on the left and click <b>Generate Narrative</b> to start.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="mb-2">
                            <h3 className="text-lg font-serif font-bold text-gray-900">Mood Board</h3>
                            <p className="text-sm text-gray-500">Assemble visuals for your story.</p>
                        </div>
                        <MoodBoard images={images} sentiment={sentiment} />

                        {/* Placeholder for future uploads */}
                        <div className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                            <span className="text-2xl mb-1">+</span>
                            <span className="text-xs font-medium">Upload Images (coming soon)</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RightSidebar;
