import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const [time, setTime] = useState(new Date());
  const [bootSequence, setBootSequence] = useState(true);
  const [systemChecks, setSystemChecks] = useState({
    os: { status: 'checking', value: '' },
    audio: { status: 'checking', value: false },
    network: { status: 'checking', value: false },
    initialization: { status: 'checking', value: 0 }
  });

  // System checks simulation
  useEffect(() => {
    // Check OS
    setTimeout(() => {
      setSystemChecks(prev => ({
        ...prev,
        os: { status: 'complete', value: window.navigator.platform }
      }));
    }, 1000);

    // Check Audio
    setTimeout(() => {
      navigator.mediaDevices?.getUserMedia({ audio: true })
        .then(() => {
          setSystemChecks(prev => ({
            ...prev,
            audio: { status: 'complete', value: true }
          }));
        })
        .catch(() => {
          setSystemChecks(prev => ({
            ...prev,
            audio: { status: 'error', value: false }
          }));
        });
    }, 2000);

    // Check Network (ping simulation)
    setTimeout(() => {
      fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' })
        .then(() => {
          setSystemChecks(prev => ({
            ...prev,
            network: { status: 'complete', value: true }
          }));
        })
        .catch(() => {
          setSystemChecks(prev => ({
            ...prev,
            network: { status: 'error', value: false }
          }));
        });
    }, 3000);

    // Initialization progress
    const initInterval = setInterval(() => {
      setSystemChecks(prev => {
        if (prev.initialization.value >= 100) {
          clearInterval(initInterval);
          setTimeout(() => setBootSequence(false), 1000);
          return prev;
        }
        return {
          ...prev,
          initialization: { 
            status: prev.initialization.value >= 100 ? 'complete' : 'checking',
            value: Math.min(prev.initialization.value + 5, 100)
          }
        };
      });
    }, 100);

    // Clock update
    const timer = setInterval(() => setTime(new Date()), 1000);

    return () => {
      clearInterval(timer);
      clearInterval(initInterval);
    };
  }, []);

  // System Check Component
  const SystemCheck = ({ label, status, value }) => (
    <div className="flex items-center justify-between text-[#00a8ff] bg-blue-900/10 p-3 rounded-lg">
      <span>{label}</span>
      <div className="flex items-center gap-2">
        {status === 'checking' && (
          <motion.div 
            className="w-3 h-3 border-2 border-t-transparent border-[#00a8ff] rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {status === 'complete' && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-green-400"
          >
            ✓
          </motion.span>
        )}
        {status === 'error' && (
          <motion.span 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-red-400"
          >
            ✗
          </motion.span>
        )}
        <span className="min-w-[100px] text-right">{value}</span>
      </div>
    </div>
  );

  // Status Item Component
  const StatusItem = ({ text, delay }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-center gap-3 group hover:bg-blue-900/20 p-3 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-500/30"
    >
      <motion.span
        className="w-2 h-2 bg-[#00a8ff] rounded-full inline-block group-hover:bg-white"
        animate={{ scale: [1, 1.5, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="group-hover:text-white transition-colors duration-300">
        {text}
      </span>
    </motion.div>
  );

  return (
    <div className="relative w-screen h-screen bg-[#000913] overflow-hidden font-roboto">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      
      {/* Loading Screen */}
      <AnimatePresence>
        {bootSequence && (
          <motion.div 
            className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center"
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.h1 
              className="text-[#00a8ff] text-4xl mb-8 font-bold"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              JARVIS MARK 7
            </motion.h1>
            
            <div className="space-y-4 w-[400px]">
              <SystemCheck 
                label="Operating System"
                status={systemChecks.os.status}
                value={systemChecks.os.value || 'Detecting...'}
              />
              <SystemCheck 
                label="Audio Systems"
                status={systemChecks.audio.status}
                value={systemChecks.audio.value ? 'Available' : 'Checking...'}
              />
              <SystemCheck 
                label="Network Connection"
                status={systemChecks.network.status}
                value={systemChecks.network.value ? 'Connected' : 'Checking...'}
              />
              
              <div className="mt-8">
                <div className="flex justify-between text-[#00a8ff] text-sm mb-2">
                  <span>System Initialization</span>
                  <span>{systemChecks.initialization.value}%</span>
                </div>
                <div className="w-full h-2 bg-blue-900/20 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#00a8ff]"
                    initial={{ width: 0 }}
                    animate={{ width: `${systemChecks.initialization.value}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time Display */}
      <div className="absolute top-5 right-8 text-[#00a8ff] z-50 flex flex-col items-end bg-blue-900/10 p-3 rounded-lg border border-blue-500/30 backdrop-blur-sm">
        <motion.div 
          className="text-3xl font-bold tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {time.toLocaleTimeString()}
        </motion.div>
        <motion.div 
          className="text-sm opacity-70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {time.toLocaleDateString()}
        </motion.div>
      </div>

      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-blue-900/30 via-blue-800/20 to-blue-900/30 backdrop-blur-md z-40 border-b border-blue-500/30">
        <div className="flex justify-center items-center h-full gap-12">
          {['HOME', 'SETTINGS', 'TUTORIALS', 'COMMUNITY', 'NEARBY'].map((item, index) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-[#00a8ff] text-lg tracking-wider hover:text-white transition-all duration-300 relative group"
              whileHover={{ scale: 1.05, textShadow: "0 0 8px rgb(0, 168, 255)" }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {item}
              <motion.div 
                className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00a8ff] to-transparent"
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>
          ))}
        </div>
      </nav>

      {/* Left Section - Changelog */}
      <motion.div 
        className="absolute left-5 top-20 w-[300px] h-[calc(100vh-100px)] bg-gradient-to-b from-blue-900/10 to-blue-950/5 border border-blue-500/30 p-5 z-20 rounded-lg backdrop-blur-sm"
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-[#00a8ff] text-xl mb-5 font-medium">Changelog</h2>
        <div className="text-[#00a8ff] text-sm space-y-3 bg-blue-900/10 p-4 rounded-lg border border-blue-500/20">
          <p className="text-lg font-medium">Version 7.0.1</p>
          <p className="flex items-center gap-2">
            <span className="w-1 h-1 bg-[#00a8ff] rounded-full" />
            Enhanced neural processing
          </p>
          <p className="flex items-center gap-2">
            <span className="w-1 h-1 bg-[#00a8ff] rounded-full" />
            Improved response time
          </p>
          <p className="flex items-center gap-2">
            <span className="w-1 h-1 bg-[#00a8ff] rounded-full" />
            Added new interface elements
          </p>
        </div>
      </motion.div>

      {/* Center Section - Main Display */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-8">
        {/* Top GIF */}
        <motion.div
          className="relative p-2 rounded-lg bg-gradient-to-b from-blue-900/10 to-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="https://i.pinimg.com/originals/00/54/5c/00545cb7179c504433d4c8f5e845f286.gif"
            className="w-[180px] h-[180px] object-contain rounded-lg"
            alt="Jarvis Interface"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#00a8ff]/10 to-transparent rounded-lg" />
        </motion.div>
        
        {/* Main Center GIF */}
        <motion.div
          className="relative p-3 rounded-xl bg-gradient-to-b from-blue-900/10 to-transparent"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <img
            src="https://media2.giphy.com/media/2g8EYDN0VWFMY/giphy.webp"
            className="w-[500px] h-[375px] object-contain rounded-lg shadow-[0_0_30px_rgba(0,168,255,0.3)]"
            alt="Jarvis Animation"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#00a8ff]/10 to-transparent rounded-xl" />
        </motion.div>
      </div>

      {/* Right Section - System Status */}
      <motion.div 
        className="absolute right-5 top-20 w-[300px] h-[calc(100vh-100px)] bg-gradient-to-b from-blue-900/10 to-blue-950/5 border border-blue-500/30 p-5 z-20 rounded-lg backdrop-blur-sm"
        initial={{ x: 300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-[#00a8ff] text-xl mb-5 font-medium">System Status</h2>
        <div className="text-[#00a8ff] text-sm space-y-4">
          {statusMessages.map((item) => (
            <StatusItem key={item.id} text={item.text} delay={item.delay} />
          ))}
        </div>
      </motion.div>

      {/* Corner Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-40 h-40 border-r-2 border-t-2 border-[#00a8ff]/30 rounded-tr-3xl bg-gradient-to-br from-blue-500/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-40 h-40 border-l-2 border-b-2 border-[#00a8ff]/30 rounded-bl-3xl bg-gradient-to-tl from-blue-500/5 to-transparent" />
      </div>
    </div>
  );
};

const statusMessages = [
  { id: 1, text: "All systems operational", delay: 0.2 },
  { id: 2, text: "Neural network: Active", delay: 0.4 },
  { id: 3, text: "Security protocols: Enabled", delay: 0.6 },
  { id: 4, text: "Voice recognition: Ready", delay: 0.8 }
];

export default Home; 