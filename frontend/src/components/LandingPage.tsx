import React from 'react';
import { Bot, BookOpen, Users, Image as ImageIcon } from 'lucide-react';

interface LandingPageProps {
    onLogin: () => void;
    onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onGetStarted }) => {
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
                        onClick={onLogin}
                        className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        Login
                    </button>
                    <button
                        onClick={onGetStarted}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-bold shadow-sm transition-all"
                    >
                        Get Started
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
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-md font-bold text-md shadow-lg shadow-blue-100 transition-all w-full sm:w-auto"
                    >
                        Get Started For Free
                    </button>
                    <button
                        onClick={onLogin}
                        className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-8 py-3.5 rounded-md font-bold text-md transition-all w-full sm:w-auto"
                    >
                        Explore the Forge
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
                            <h3 className="text-xl font-bold text-slate-800 mb-4">AI Story Generation</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Generate compelling story content from simple prompts, with AI that
                                understands narrative structure and character depth.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white p-10 rounded-2xl border border-slate-200 hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-blue-50/50 group text-center">
                            <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-8 mx-auto group-hover:bg-blue-50 transition-colors">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-4">Dynamic Character Builder</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Create and manage detailed character profiles, giving your AI co-writer
                                the context it needs to maintain consistency.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white p-10 rounded-2xl border border-slate-200 hover:border-blue-200 transition-all hover:shadow-xl hover:shadow-blue-50/50 group text-center">
                            <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center mb-8 mx-auto group-hover:bg-blue-50 transition-colors">
                                <ImageIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-4">AI Scene Visualization</h3>
                            <p className="text-slate-500 leading-relaxed text-sm">
                                Bring your scenes to life with AI-generated images, creating a rich,
                                multi-modal experience for your narrative.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-[#f8fafc]">
                <div className="max-w-4xl mx-auto text-center px-6">
                    <div className="bg-blue-600 rounded-3xl p-12 md:p-16 shadow-2xl shadow-blue-200">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Ready to Forged your next masterpiece?
                        </h2>
                        <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
                            Join thousands of writers using NarrativeForge AI to break through
                            writer's block and build immersive worlds.
                        </p>
                        <button
                            onClick={onGetStarted}
                            className="bg-white text-blue-600 hover:bg-slate-50 px-10 py-4 rounded-xl font-bold text-lg shadow-lg transition-all"
                        >
                            Start Creating Now
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-8 border-t border-slate-200 text-center text-slate-400 text-sm bg-white">
                <p>© {new Date().getFullYear()} NarrativeForge AI. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
