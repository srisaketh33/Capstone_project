import { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { X, Trash2 } from 'lucide-react';
import Layout from './components/Layout';
import StoryEditor from './components/StoryEditor';
import ToolkitSidebar from './components/ToolkitSidebar';
import RightSidebar from './components/RightSidebar';
import LandingPage from './components/LandingPage';

function App() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<{ b64: string, text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [enableSentiment, setEnableSentiment] = useState(true);

  const [enablePlot, setEnablePlot] = useState(true);
  const [enableVisual, setEnableVisual] = useState(false);

  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [username] = useState("Admin");
  const [password] = useState("Password@123");

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      // Direct login with internal credentials
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error("Login failed");
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      navigate('/forge');
    } catch (error) {
      console.error("Auto-login failed:", error);
      // Fallback: still navigate to forge if dev environment, 
      // but usually we want token to be valid.
      navigate('/forge');
    }
  };

  const handleGenerate = async (passedToken?: string) => {
    const activeToken = passedToken || token;
    if (!activeToken) {
      alert("Please login first");
      navigate('/');
      return;
    }
    if (!prompt.trim()) {
      setErrorMsg("Please enter a prompt to generate the story.");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await fetch('http://127.0.0.1:8000/story/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({
          user_id: username,
          prompt: prompt,
          context_window_size: 3,
          enable_sentiment: enableSentiment,
          enable_plot_coherence: enablePlot,
          enable_image_generation: enableVisual
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Backend connection failed");
      }

      const data = await response.json();

      if (data.text) {
        setText(prev => prev + (prev ? "\n\n" : "") + data.text);
        setPrompt("");
      }

      if (data.image_base64) {
        setImages(prev => [{ b64: data.image_base64, text: data.title || "Story Visual" }, ...prev]);
      }


    } catch (error: any) {
      console.error("Generation failed:", error);
      setErrorMsg(error.message || "Failed to generate story. Check backend logs.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setText("");
    setImages([]);
    setPrompt("");
    setErrorMsg("");
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the entire story?")) {
      resetState();
    }
  };


  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyItems, setHistoryItems] = useState<{ prompt: string, timestamp: string }[]>([]);

  const handleFetchHistory = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/memory/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.metadatas && data.metadatas.length > 0) {
        const items = data.metadatas
          .map((m: any) => ({
            prompt: m.prompt || "Continue the story",
            timestamp: m.timestamp ? new Date(m.timestamp).toLocaleString() : "Recently"
          }))
          .filter((item: any) => item.prompt !== "Continue the story");

        setHistoryItems(items);
      } else {
        setHistoryItems([]);
      }
      setShowHistoryModal(true);
    } catch (err) {
      alert("Failed to fetch history");
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Delete all prompt history? This cannot be undone.")) return;
    try {
      await fetch('http://127.0.0.1:8000/memory/clear', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setHistoryItems([]);
    } catch (err) {
      alert("Failed to clear history");
    }
  };

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={<LandingPage onGetStarted={handleLogin} />}
        />
        <Route
          path="/forge"
          element={
            token ? (
              <Layout
                onBackToHome={() => {
                  resetState();
                  navigate('/');
                }}
                leftSidebar={
                  <ToolkitSidebar
                    onGenerate={() => handleGenerate()}
                    isLoading={isLoading}
                    token={token}
                    enableSentiment={enableSentiment}
                    setEnableSentiment={setEnableSentiment}
                    enablePlot={enablePlot}
                    setEnablePlot={setEnablePlot}
                    enableVisual={enableVisual}
                    setEnableVisual={setEnableVisual}
                    prompt={prompt}
                    setPrompt={setPrompt}
                  />
                }
                editor={
                  <div className="h-full flex flex-col gap-4">
                    {errorMsg && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                        {errorMsg}
                      </div>
                    )}
                    <StoryEditor
                      text={text}
                      onChange={setText}
                      onClear={handleClear}
                      onFetchHistory={handleFetchHistory}
                    />
                  </div>
                }
                rightSidebar={
                  <RightSidebar
                    images={images}
                  />
                }
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>

      {/* Global History Modal - Simplified Version */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Prompt History</h3>
                <p className="text-xs text-gray-500 font-medium">Recorded prompts from your session</p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4">
              {historyItems.map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed group hover:bg-indigo-50/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                      Recent Prompt {historyItems.length - idx}
                    </div>
                    <div className="text-[10px] font-medium text-gray-400">
                      {item.timestamp}
                    </div>
                  </div>
                  <div className="text-gray-900 font-medium">
                    {item.prompt}
                  </div>
                </div>
              ))}
              {historyItems.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No history found yet.
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center">
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 text-red-500 hover:text-red-700 text-xs font-bold transition-colors uppercase tracking-wider flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Clear All
              </button>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
