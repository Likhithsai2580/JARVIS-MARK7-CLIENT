import { useState } from 'react'
import axios from 'axios'
import './App.css'

interface Asset {
  url: string;
  type?: string;
  repeat?: string;
  size?: string;
  width?: number;
  height?: number;
}

interface ThemeAssets {
  backgroundPattern?: Asset;
  loadingAnimation?: Asset;
  icons?: Record<string, Record<string, string>>;
  decorativeElements?: {
    cornerAccents?: string[];
    dividers?: string[];
    backgrounds?: Record<string, string>;
  };
  cursor?: Record<string, string>;
}

interface Theme {
  name: string;
  author?: string;
  version: string;
  figmaUrl?: string;
  previewImage?: string;
  assets?: ThemeAssets;
  components: Record<string, any>;
}

function App() {
  const [figmaUrl, setFigmaUrl] = useState('')
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null)
  const [message, setMessage] = useState('')

  const BASE_URL = 'http://localhost:8000/api'

  const handleGenerateTheme = async () => {
    if (!figmaUrl) {
      setMessage('Please enter a Figma URL')
      return
    }

    try {
      const response = await axios.post(`${BASE_URL}/theme/generate`, { url: figmaUrl })
      setMessage('Theme generated successfully!')
      setCurrentTheme(response.data)
    } catch (error) {
      setMessage('Error generating theme')
      console.error('Error:', error)
    }
  }

  const handleResetTheme = async () => {
    try {
      await axios.post(`${BASE_URL}/theme/reset`)
      setMessage('Theme reset successfully!')
      setCurrentTheme(null)
    } catch (error) {
      setMessage('Error resetting theme')
      console.error('Error:', error)
    }
  }

  const getCurrentTheme = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/theme/current`)
      setCurrentTheme(response.data)
      setMessage('Theme fetched successfully!')
    } catch (error) {
      setMessage('Error fetching current theme')
      console.error('Error:', error)
    }
  }

  return (
    <div className="container">
      <header className="header">
        <h1>JARVIS Theme Service</h1>
        <p className="subtitle">Generate themes from Figma designs</p>
      </header>
      
      <main className="main">
        <div className="theme-form">
          <div className="input-group">
            <label htmlFor="figmaUrl">Figma URL</label>
            <input
              id="figmaUrl"
              type="text"
              value={figmaUrl}
              onChange={(e) => setFigmaUrl(e.target.value)}
              placeholder="Paste your Figma file URL here"
              className="url-input"
            />
          </div>
          <div className="button-group">
            <button 
              onClick={handleGenerateTheme} 
              className="button primary"
              disabled={!figmaUrl}
            >
              Generate Theme
            </button>
            <button onClick={handleResetTheme} className="button">
              Reset Theme
            </button>
            <button onClick={getCurrentTheme} className="button">
              Get Current Theme
            </button>
          </div>
        </div>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {currentTheme && (
          <div className="theme-display">
            <h2>Current Theme</h2>
            <pre>{JSON.stringify(currentTheme, null, 2)}</pre>
          </div>
        )}
      </main>
    </div>
  )
}

export default App 