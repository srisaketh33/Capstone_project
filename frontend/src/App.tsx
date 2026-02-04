import { useState } from 'react';
import Layout from './components/Layout';
import StoryEditor from './components/StoryEditor';
import ToolkitSidebar from './components/ToolkitSidebar';
import RightSidebar from './components/RightSidebar';

function App() {
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [sentiment, setSentiment] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(false);

  const [prompt, setPrompt] = useState("");

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/story/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: "demo_user",
          prompt: prompt || text.split('\n').pop() || "Start a story", // Priority: Explicit prompt -> last line -> default
          context_window_size: 3
        })
      });

      const data = await response.json();

      if (data.text) {
        setText(prev => prev + (prev ? "\n\n" : "") + data.text);
      }

      if (data.image_base64) {
        setImages(prev => [data.image_base64, ...prev]);
      }

      if (data.sentiment_analysis) {
        setSentiment(data.sentiment_analysis);
      }

    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout
      leftSidebar={
        <ToolkitSidebar
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerate={handleGenerate}
          isLoading={isLoading}
        />
      }
      editor={<StoryEditor text={text} onChange={setText} />}
      rightSidebar={<RightSidebar images={images} sentiment={sentiment} />}
    />
  );
}

export default App;
