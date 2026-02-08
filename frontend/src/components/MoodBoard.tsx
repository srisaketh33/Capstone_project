import React, { useState } from 'react';
import { Download, Maximize2, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MoodBoardProps {
    images: { b64: string, text: string }[];
}

const MoodBoard: React.FC<MoodBoardProps> = ({ images }) => {
    const [selectedImage, setSelectedImage] = useState<{ b64: string, text: string } | null>(null);

    const handleDownload = (b64: string, filename: string) => {
        const link = document.createElement('a');
        link.href = `data:image/png;base64,${b64}`;
        link.download = `narrative-forge-${filename.slice(0, 20).replace(/\s+/g, '-') || 'image'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] underline decoration-indigo-500/30">
                        Visual Inspiration
                    </h3>
                </div>
                <div className="flex flex-col gap-6">
                    {images.map((item, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={idx}
                            className="flex flex-col gap-3 group"
                        >
                            <div className="relative rounded-2xl overflow-hidden shadow-md border border-gray-100 transition-all hover:shadow-xl hover:shadow-indigo-500/10 bg-white">
                                <img
                                    src={`data:image/png;base64,${item.b64}`}
                                    alt="Generated visualization"
                                    className="w-full h-auto object-cover min-h-[200px]"
                                />

                                {/* Overlay Controls */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                                    <button
                                        onClick={() => setSelectedImage(item)}
                                        className="p-3 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all backdrop-blur-md border border-white/30"
                                        title="Enlarge"
                                    >
                                        <Maximize2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDownload(item.b64, item.text)}
                                        className="p-3 bg-white/20 hover:bg-white/40 rounded-full text-white transition-all backdrop-blur-md border border-white/30"
                                        title="Download"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="px-1">
                                <h4 className="text-[12px] font-bold text-slate-700 leading-tight tracking-tight uppercase border-l-2 border-blue-500 pl-2">
                                    {item.text || 'Untitled Scene'}
                                </h4>
                            </div>
                        </motion.div>
                    ))}

                    {images.length === 0 && (
                        <div className="h-64 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-3 bg-white/50 animate-pulse">
                            <ImageIcon className="w-8 h-8 opacity-20" />
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Awaiting Vision...</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Enlarged Modal */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-12 backdrop-blur-sm"
                        onClick={() => setSelectedImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-5xl w-full max-h-full flex flex-col gap-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition-colors"
                            >
                                <X className="w-8 h-8" />
                            </button>

                            <img
                                src={`data:image/png;base64,${selectedImage.b64}`}
                                alt="Enlarged visualization"
                                className="w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl"
                            />

                            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
                                <h3 className="text-white text-lg font-bold tracking-widest uppercase text-center">
                                    {selectedImage.text}
                                </h3>
                                <div className="mt-4 flex justify-center">
                                    <button
                                        onClick={() => handleDownload(selectedImage.b64, selectedImage.text)}
                                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg transition-all"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download Masterpiece
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MoodBoard;
