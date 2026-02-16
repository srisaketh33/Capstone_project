import React from 'react';
import { Brain } from 'lucide-react';
import MoodBoard from './MoodBoard';

interface RightSidebarProps {
    images: { b64: string, text: string }[];
}

const RightSidebar: React.FC<RightSidebarProps> = ({ images }) => {

    return (
        <div className="h-full flex flex-col bg-white border-l border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gray-50/30">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-indigo-600" /> Creative Insights
                        </h2>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">


                {/* Mood Board Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <span className="w-1 h-1 bg-indigo-400 rounded-full"></span>
                            Story Sceneries
                        </h3>
                        {images.length > 0 && (
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full">
                                {images.length}
                            </span>
                        )}
                    </div>
                    <MoodBoard images={images} />
                </section>
            </div>
        </div>
    );
};

export default RightSidebar;
