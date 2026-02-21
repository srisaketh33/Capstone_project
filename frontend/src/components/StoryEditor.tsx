import React from 'react';
import { Trash2, History } from 'lucide-react';

interface StoryEditorProps {
    text: string;
    onChange: (text: string) => void;
    onClear?: () => void;
    onFetchHistory?: () => void;
}

const StoryEditor: React.FC<StoryEditorProps> = ({ text, onChange, onClear, onFetchHistory }) => {
    return (
        <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center">
                <h2 className="text-lg font-serif font-bold text-gray-900">Interactive Story Editor</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onFetchHistory}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium group"
                        title="View History"
                    >
                        <History className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">History</span>
                    </button>
                    <div className="w-[1px] h-4 bg-gray-200 mx-1"></div>
                    <button
                        onClick={onClear}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium group"
                        title="Clear Story"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">Clear</span>
                    </button>
                </div>
            </div>
            <textarea
                className="flex-1 w-full p-6 bg-white text-gray-900 focus:outline-none resize-none font-serif text-lg leading-relaxed placeholder-gray-300"
                placeholder="Your story will appear here. Start by entering a prompt and clicking 'Generate Narrative', or just start writing!"
                value={text}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};

export default StoryEditor;
