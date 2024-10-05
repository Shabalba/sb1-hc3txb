import React, { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import { Upload, Download, RefreshCw } from 'lucide-react';

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const memeRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Image = e.target?.result as string;
        setImage(base64Image);
        generateCaption("A funny meme image");
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCaption = async (imageDescription: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer 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`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are an expert joke writer for social media influencers who want to make their audience laugh with fresh, trendy, and youth-oriented humor. The jokes should be hilarious, clever, and relatable to Gen Z. They should also reference modern trends, memes, and internet culture. Keep the tone playful and funny, and be sure to include unexpected punchlines. Incorporate current slang, viral internet trends, and make jokes about things like TikTok challenges, memes, relatable life struggles, awkward moments, and pop culture references (like gaming, fashion, music, and school). Keep the jokes light, not offensive, and ensure they feel fresh and relatable to a young audience (ages 15-25)."
            },
            {
              role: "user",
              content: `Generate a funny caption for this meme image: ${imageDescription}`
            }
          ],
          max_tokens: 100
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        setCaption(data.choices[0].message.content.trim());
      } else {
        throw new Error('Unexpected response structure from OpenAI API');
      }
    } catch (error) {
      console.error('Error generating caption:', error);
      if (error instanceof Error) {
        setError(`Failed to generate caption: ${error.message}`);
      } else {
        setError('An unknown error occurred while generating the caption');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (memeRef.current) {
      try {
        const dataUrl = await toPng(memeRef.current);
        const link = document.createElement('a');
        link.download = 'meme.png';
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error('Error downloading meme:', error);
        setError('Failed to download meme. Please try again.');
      }
    }
  };

  const handleRegenerateCaption = () => {
    if (image) {
      generateCaption("A funny meme image");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">Meme Generator</h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="imageUpload" className="block mb-2 text-sm font-medium text-gray-700">
            Upload an image
          </label>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="imageUpload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
              </div>
              <input id="imageUpload" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
            </label>
          </div>
        </div>
        {image && (
          <div ref={memeRef} className="relative mb-4">
            <img src={image} alt="Uploaded meme" className="w-full rounded-lg" />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg">
              <p className="text-lg font-bold text-center">{caption}</p>
            </div>
          </div>
        )}
        {loading && <p className="text-center mb-4">Generating caption...</p>}
        {error && <p className="text-center mb-4 text-red-500">{error}</p>}
        {image && !loading && (
          <div className="flex justify-between">
            <button
              onClick={handleRegenerateCaption}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Caption
            </button>
            <button
              onClick={handleDownload}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Meme
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;