import React from 'react';

interface StoryEditorProps {
    text: string;
    onChange: (text: string) => void;
}

const StoryEditor: React.FC<StoryEditorProps> = ({ text, onChange }) => {
    return (
        <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-white">
                <h2 className="text-lg font-serif font-bold text-gray-900">Interactive Story Editor</h2>
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
