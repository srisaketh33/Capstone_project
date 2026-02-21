import React from 'react';
import { Bot, BookOpen, Users, Image as ImageIcon, ArrowRight, Sparkles } from 'lucide-react';

interface LandingPageProps {
    onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    return (
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
            {/* Navigation */}
            <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200">
                <div className="flex items-center gap-2">
                    <div className="bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                        <BookOpen className="w-5 h-5 text-slate-700" />
                    </div>
                    <span className="font-bold text-lg text-slate-800 tracking-tight">NarrativeForge AI</span>
                </div>
                <div className="flex items-center gap-6">
                    <button
                        onClick={onGetStarted}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                    >
                        Get Started <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="max-w-5xl mx-auto pt-20 pb-16 text-center px-6">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-100 shadow-sm">
                        <Bot className="w-12 h-12 text-blue-600" />
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#1e293b] leading-tight mb-6">
                    Your Multi-Modal AI Assistant for <br />
                    <span className="text-blue-600">Creative Narrative Generation</span>
                </h1>

                <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto mb-10 leading-relaxed">
                    Unleash your creativity with AI-powered story generation, dynamic
                    character building, and vivid scene visualization.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={onGetStarted}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-100 transition-all w-full sm:w-auto active:scale-95 flex items-center justify-center gap-3"
                    >
                        <Sparkles className="w-5 h-5" /> Start Creating Your Story
                    </button>
                </div>
            </header>

            {/* Features Section */}
            <section className="bg-white py-24 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-extrabold text-slate-800 mb-4">Features</h2>
                        <p className="text-slate-500 text-lg">
                            NarrativeForge AI provides a powerful suite of tools to bring your stories to life.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="bg-white p-10 rounded-2xl border border-slate-200 hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-blue-50/50 group text-center">
                            <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-8 mx-auto group-hover:bg-blue-50 transition-colors">
                                <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-4">Story Generation</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Make full stories from user prompts, so that can understand the story flow and characters.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-10 rounded-2xl border border-slate-200 hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-blue-50/50 group text-center">
                            <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-8 mx-auto group-hover:bg-blue-50 transition-colors">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-4">Character Helper</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Create and edit detailed character profiles so it keeps them consistent.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-10 rounded-2xl border border-slate-200 hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-blue-50/50 group text-center">
                            <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-8 mx-auto group-hover:bg-blue-50 transition-colors">
                                <ImageIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-4">AI Scene Visualization</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Turn your scenes into AI images for a experience of story and visuals at a time.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-8 border-t border-slate-200 text-center text-slate-400 text-sm bg-white">
                <p>Copyright {new Date().getFullYear()} NarrativeForge AI. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
