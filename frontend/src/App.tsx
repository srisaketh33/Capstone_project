import { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
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
  const [sentiment, setSentiment] = useState<{ [key: string]: number }>({});
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
      alert("Login failed: check backend connection");
    }
  };

  const handleGenerate = async (passedToken?: string) => {
    const activeToken = passedToken || token;
    if (!activeToken) {
      alert("Please login first");
      navigate('/');
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
          prompt: prompt || "Continue the story",
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

      if (data.sentiment_analysis) {
        setSentiment(data.sentiment_analysis);
      }

    } catch (error: any) {
      console.error("Generation failed:", error);
      setErrorMsg(error.message || "Failed to generate story. Check backend logs.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm("Are you sure you want to clear the entire story?")) {
      setText("");
      setImages([]);
      setSentiment({});
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setText("");
    setPrompt("");
    setImages([]);
    setSentiment({});
    setErrorMsg("");
    navigate('/');
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          token ? <Navigate to="/forge" /> : <LandingPage onLogin={handleLogin} onGetStarted={handleLogin} />
        }
      />
      <Route
        path="/forge"
        element={
          token ? (
            <Layout
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
                  onClear={handleClear}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
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
                  <StoryEditor text={text} onChange={setText} />
                </div>
              }
              rightSidebar={
                <RightSidebar
                  images={images}
                  sentiment={sentiment}
                />
              }
            />
          ) : (
            <Navigate to="/" />
          )
        }
      />
    </Routes>
  );
}

export default App;
