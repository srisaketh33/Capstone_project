import React from 'react';

interface MoodBoardProps {
    images: string[];
    sentiment: { [key: string]: number };
}

const MoodBoard: React.FC<MoodBoardProps> = ({ images, sentiment }) => {

    return (
        <div className="space-y-6">
            {/* Sentiment Analysis */}
            {/* Sentiment Analysis Removed */}

            {/* Visuals */}
            <div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Visual Inspiration</h3>
                <div className="grid grid-cols-1 gap-4">
                    {images.map((src, idx) => (
                        <div key={idx} className="relative group rounded-xl overflow-hidden shadow-lg border border-gray-700 transition-transform hover:scale-[1.02]">
                            <img src={`data:image/png;base64,${src}`} alt="Generated visualization" className="w-full h-auto object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-semibold px-2 py-1 bg-black/60 rounded">View Full</span>
                            </div>
                        </div>
                    ))}
                    {images.length === 0 && (
                        <div className="h-48 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-gray-500 italic">
                            Waiting for generation...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MoodBoard;
