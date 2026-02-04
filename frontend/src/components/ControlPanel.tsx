import React from 'react';

interface ControlPanelProps {
    onGenerate: () => void;
    isLoading: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onGenerate, isLoading }) => {
    return (
        <div className="flex justify-end space-x-4">
            <button
                onClick={onGenerate}
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg font-semibold text-white transition-all 
            ${isLoading
                        ? 'bg-gray-600 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:brightness-110 active:scale-95'
                    }`}
            >
                {isLoading ? (
                    <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Forging...
                    </span>
                ) : (
                    "✨ Generate Chapter"
                )}
            </button>
        </div>
    );
};

export default ControlPanel;
