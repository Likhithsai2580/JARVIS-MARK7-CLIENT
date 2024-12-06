import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceCommands from './VoiceCommands';

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject instanceof MediaStream) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleVoiceCommand = (command: string) => {
    console.log('Voice command received:', command);
    
    if (command === 'GREETING') {
      if (currentUser) {
        const speech = new SpeechSynthesisUtterance(`Hello ${currentUser}`);
        window.speechSynthesis.speak(speech);
      }
    } else if (command === 'LOGOUT') {
      setLoginSuccess(false);
      setCurrentUser(null);
      stopCamera();
    } else if (command.startsWith('EXECUTE:')) {
      const cmdText = command.replace('EXECUTE:', '').trim();
      handleCommand(cmdText);
    }
  };

  const handleCommand = async (cmdText: string) => {
    try {
      const response = await fetch('http://localhost:5001/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          command: cmdText,
          user: currentUser
        })
      });
      
      const data = await response.json();
      if (data.success) {
        const speech = new SpeechSynthesisUtterance(data.response || 'Command executed successfully');
        window.speechSynthesis.speak(speech);
      }
    } catch (error) {
      console.error('Command execution failed:', error);
      const speech = new SpeechSynthesisUtterance('Sorry, I could not execute that command');
      window.speechSynthesis.speak(speech);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#000913] overflow-hidden font-roboto">
      {/* ... existing JSX ... */}
      <VoiceCommands onCommand={handleVoiceCommand} />
    </div>
  );
};

export default Home; 