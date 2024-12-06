import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import JarvisClient from '../services/jarvisClient';

const Home = () => {
  const [time, setTime] = useState(new Date());
  const [bootSequence, setBootSequence] = useState(true);
  const [systemChecks, setSystemChecks] = useState({
    os: { status: 'checking', value: '' },
    audio: { status: 'checking', value: false },
    network: { status: 'checking', value: false },
    initialization: { status: 'checking', value: 0 }
  });
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [failedFaceAttempts, setFailedFaceAttempts] = useState(0);
  const [requiresTraditionalLogin, setRequiresTraditionalLogin] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [showTraditionalLogin, setShowTraditionalLogin] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [jarvisResponse, setJarvisResponse] = useState(null);
  const recognitionRef = useRef(null);
  const jarvisClientRef = useRef(null);

  // Initialize JARVIS client
  useEffect(() => {
    const dnsServer = localStorage.getItem('jarvis_dns_server');
    if (dnsServer) {
      jarvisClientRef.current = new JarvisClient(dnsServer);
    }
  }, []);

  // Process transcript with JARVIS
  const processTranscriptWithJarvis = async (text) => {
    if (!jarvisClientRef.current) {
      const dnsServer = localStorage.getItem('jarvis_dns_server');
      if (!dnsServer) {
        console.error('DNS server not configured');
        return;
      }
      jarvisClientRef.current = new JarvisClient(dnsServer);
    }

    setIsProcessing(true);
    try {
      const response = await jarvisClientRef.current.sendPrompt(text, {
        type: 'voice_command',
        priority: 'high',
        require_metrics: true
      });
      setJarvisResponse(response);
      console.log('JARVIS Response:', response);
    } catch (error) {
      console.error('Failed to process with JARVIS:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onstart = () => {
        setIsListening(true);
        setJarvisResponse(null); // Clear previous response when starting new recognition
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
        
        // Process the command if it's final
        if (event.results[current].isFinal) {
          processTranscriptWithJarvis(transcriptText);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.error('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleVoiceRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

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

  // Add function to start camera
  const startCamera = useCallback(async () => {
    console.log('Starting camera...');
    try {
      if (videoRef.current?.srcObject) {
        // If camera is already running, stop it first
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          setIsCameraActive(true);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError(error.message);
      setSystemChecks(prev => ({
        ...prev,
        security: { status: 'error', value: 'Camera access denied' }
      }));
    }
  }, []);

  // Add function to stop camera
  const stopCamera = useCallback(() => {
    console.log('Stopping camera...');
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  }, []);

  // Update the captureFrame function
  const captureFrame = useCallback(() => {
    console.log('Attempting to capture frame...');
    if (!videoRef.current || !isCameraActive) {
        console.error('Video reference not available or camera not active');
        return null;
    }

    try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Could not get canvas context');
            return null;
        }
        
        // Draw the video frame to canvas
        ctx.drawImage(videoRef.current, 0, 0);
        
        // Convert to base64
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        console.log('Frame captured successfully');
        return imageData;
    } catch (error) {
        console.error('Error capturing frame:', error);
        return null;
    }
  }, [isCameraActive]);

  // Updated handleRegistration function
  const handleRegistration = async () => {
    setIsProcessing(true);
    console.log('Starting registration process...');

    try {
      if (!username || !password || !email) {
        console.error('Missing required fields');
        setSystemChecks(prev => ({
          ...prev,
          security: { status: 'error', value: 'Username, email and password are required' }
        }));
        setIsProcessing(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setSystemChecks(prev => ({
          ...prev,
          security: { status: 'error', value: 'Please enter a valid email address' }
        }));
        setIsProcessing(false);
        return;
      }

      if (!isCameraActive) {
        console.log('Camera not active, starting camera...');
        await startCamera();
      }

      // Ensure camera is active before capturing
      if (!isCameraActive) {
        console.error('Camera failed to start');
        setSystemChecks(prev => ({
          ...prev,
          security: { status: 'error', value: 'Camera failed to start' }
        }));
        setIsProcessing(false);
        return;
      }

      // Capture image from video stream
      const imageData = captureFrame();
      if (!imageData) {
        console.error('Failed to capture image');
        setSystemChecks(prev => ({
          ...prev,
          security: { status: 'error', value: 'Failed to capture image' }
        }));
        setIsProcessing(false);
        return;
      }

      // Send registration request
      console.log('Sending registration request to server...');
      const response = await fetch('http://localhost:5001/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mode: 'register',
          username: username,
          email: email,
          password: password,
          faceImage: imageData
        })
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (data.success) {
        setSystemChecks(prev => ({
          ...prev,
          security: { status: 'complete', value: 'Registration successful' }
        }));
        setShowAuth(false);
        stopCamera();
        setIsRegistering(false);
      } else {
        setSystemChecks(prev => ({
          ...prev,
          security: { status: 'error', value: data.error || 'Registration failed' }
        }));
      }
    } catch (error) {
      console.error('Registration error:', error);
      setSystemChecks(prev => ({
        ...prev,
        security: { status: 'error', value: 'Registration failed: ' + error.message }
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  // Add this function to handle face login response
  const handleFaceLoginResponse = async (response) => {
    if (response.success) {
      setLoginSuccess(true);
      setCurrentUser(response.username);
      setShowAuth(false);
      setFailedAttempts(0);
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        setShowTraditionalLogin(true);
      }
    }
  };

  // Add traditional login handler
  const handleTraditionalLogin = async () => {
    try {
      setIsProcessing(true);
      const response = await fetch('http://127.0.0.1:5001/traditional_login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });
      
      const data = await response.json();
      
      if (data.message === 'Traditional login successful') {
        setLoginSuccess(true);
        setCurrentUser(data.username);
        setShowAuth(false);
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      alert('Login failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Update the renderAuthUI function
  const renderAuthUI = () => {
    return (
      <motion.div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-gray-900/95 p-8 rounded-lg shadow-xl max-w-md w-full mx-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-blue-400">
            {isRegistering ? "Register" : (showTraditionalLogin ? "Traditional Login" : "Face Recognition Login")}
          </h2>

          {isRegistering ? (
            // Registration Form
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
              />
              <div className="relative w-full aspect-video bg-black/20 rounded-lg overflow-hidden">
                <video
                  key="registration-video"
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onLoadedMetadata={() => {
                    console.log('Video metadata loaded');
                    setIsCameraActive(true);
                  }}
                />
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-64 h-64 border-2 border-dashed border-blue-500/50 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500/70 text-sm mt-36">
                    Position your face within the circle
                  </div>
                </div>
              </div>
              <button
                onClick={handleRegistration}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Register"}
              </button>
            </div>
          ) : showTraditionalLogin ? (
            // Traditional Login Form
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700"
              />
              <button
                onClick={handleTraditionalLogin}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
              >
                {isProcessing ? "Processing..." : "Login"}
              </button>
            </div>
          ) : (
            // Face Recognition Login
            <div className="space-y-4">
              <div className="relative w-full aspect-video bg-black/20 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-64 h-64 border-2 border-dashed border-blue-500/50 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500/70 text-sm mt-36">
                    Position your face within the circle
                  </div>
                </div>
              </div>
              {failedAttempts > 0 && (
                <div className="text-red-400 text-sm text-center">
                  Failed attempts: {failedAttempts}/5
                  {failedAttempts >= 5 && (
                    <button
                      onClick={() => setShowTraditionalLogin(true)}
                      className="ml-2 text-blue-400 hover:text-blue-300"
                    >
                      Switch to traditional login
                    </button>
                  )}
                </div>
              )}
              <button
                onClick={handleFaceLogin}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
              >
                {isProcessing ? "Processing..." : "Verify Face"}
              </button>
            </div>
          )}

          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => {
                setShowAuth(false);
                stopCamera();
                setFailedAttempts(0);
                setShowTraditionalLogin(false);
                setIsRegistering(false);
              }}
              className="text-gray-400 hover:text-gray-300"
            >
              Cancel
            </button>
            {!isRegistering && !showTraditionalLogin && (
              <button
                onClick={() => {
                  setIsRegistering(true);
                  startCamera();
                }}
                className="text-blue-400 hover:text-blue-300"
              >
                Register New User
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Add greeting component
  const Greeting = () => {
    if (!currentUser) return null;
    
    return (
      <div className="absolute bottom-8 left-8 text-xl text-blue-400">
        Hello, {currentUser}
      </div>
    );
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
      // Clean up any other resources
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [stopCamera]);

  // Update the handleAuth function
  const handleAuth = async () => {
    setIsProcessing(true);
    try {
        const imageData = captureFrame();
        if (!imageData) {
            console.error('No image data captured');
            setSystemChecks(prev => ({
                ...prev,
                security: { status: 'error', value: 'Failed to capture image' }
            }));
            setIsProcessing(false);
            return;
        }

        console.log('Sending auth request...');
        const response = await fetch('http://localhost:5001/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                mode: 'login',
                faceImage: imageData
            })
        });

        const data = await response.json();
        if (data.success) {
            setShowAuth(false);
            stopCamera();
            setSystemChecks(prev => ({
                ...prev,
                security: { status: 'complete', value: 'Authentication successful' }
            }));
        } else {
            setSystemChecks(prev => ({
                ...prev,
                security: { status: 'error', value: data.error || 'Authentication failed' }
            }));
        }
    } catch (error) {
        console.error('Authentication error:', error);
        setSystemChecks(prev => ({
            ...prev,
            security: { status: 'error', value: 'Authentication failed' }
        }));
    } finally {
        setIsProcessing(false);
    }
  };

  const handleFaceLogin = async () => {
    try {
      setIsProcessing(true);
      const imageData = captureFrame();
      
      const response = await fetch('http://localhost:5001/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mode: 'login',
          faceImage: imageData
        })
      });

      const data = await response.json();
      if (data.success) {
        setLoginSuccess(true);
        setCurrentUser(data.username);
        setShowAuth(false);
        setFailedAttempts(0);
        stopCamera();
      } else {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        
        if (newAttempts >= 5) {
          setShowTraditionalLogin(true);
        }
      }
    } catch (error) {
      console.error('Face login error:', error);
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        setShowTraditionalLogin(true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
        
        // Process the command if it's final
        if (event.results[current].isFinal) {
          processVoiceCommand(transcriptText);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.error('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const processVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase().trim();
    
    // Add your voice commands here
    if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
      console.log('Greeting detected');
      // Add your greeting response here
    } else if (lowerCommand.includes('settings')) {
      window.location.href = '/settings';
    } else if (lowerCommand.includes('home')) {
      window.location.href = '/';
    }
    // Add more command processing as needed
  };

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

      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 w-full h-16 bg-gradient-to-r from-blue-900/30 via-blue-800/20 to-blue-900/30 backdrop-blur-md z-40 border-b border-blue-500/30">
        <div className="flex justify-between items-center h-full px-8">
          <div className="flex gap-12">
            {[
              { name: 'HOME', path: '/' },
              { name: 'SETTINGS', path: '/settings' },
              { name: 'TUTORIALS', path: '/tutorials' },
              { name: 'COMMUNITY', path: '/community' },
              { name: 'NEARBY', path: '/nearby' }
            ].map((item, index) => (
              <motion.div key={item.name}>
                <Link
                  to={item.path}
                  className="text-[#00a8ff] text-lg tracking-wider hover:text-white transition-all duration-300 relative group"
                  style={{ textDecoration: 'none' }}
                >
                  {item.name}
                  <motion.div 
                    className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00a8ff] to-transparent"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-8">
            {/* Time Display - Moved inside nav bar */}
            <div className="text-[#00a8ff] flex flex-col items-end">
              <motion.div 
                className="text-xl font-bold tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {time.toLocaleTimeString()}
              </motion.div>
              <motion.div 
                className="text-xs opacity-70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {time.toLocaleDateString()}
              </motion.div>
            </div>

            {/* Login/Register Button */}
            <button
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              onClick={() => {
                setShowAuth(true);
                startCamera();
              }}
            >
              {loginSuccess ? (
                <div className="flex items-center gap-2">
                  <span>Welcome, {currentUser}</span>
                  <span>|</span>
                  <span>Switch User</span>
                </div>
              ) : (
                "Login / Register"
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Left Section - Changelog */}
      <div className="absolute left-5 top-20 w-[300px] h-[calc(100vh-100px)] bg-gradient-to-b from-blue-900/10 to-blue-950/5 border border-blue-500/30 p-5 z-20 rounded-lg backdrop-blur-sm">
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
      </div>

      {/* Right Section - System Status */}
      <div className="absolute right-5 top-20 w-[300px] h-[calc(100vh-100px)] bg-gradient-to-b from-blue-900/10 to-blue-950/5 border border-blue-500/30 p-5 z-20 rounded-lg backdrop-blur-sm">
        <h2 className="text-[#00a8ff] text-xl mb-5 font-medium">System Status</h2>
        <div className="text-[#00a8ff] text-sm space-y-4">
          {statusMessages.map((item) => (
            <StatusItem key={item.id} text={item.text} delay={item.delay} />
          ))}
        </div>

        {/* Top GIF moved below system status */}
        <motion.div
          className="relative p-2 rounded-lg bg-gradient-to-b from-blue-900/10 to-transparent mt-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <img
            src="https://i.pinimg.com/originals/00/54/5c/00545cb7179c504433d4c8f5e845f286.gif"
            className="w-[180px] h-[180px] object-contain rounded-lg mx-auto"
            alt="Jarvis Interface"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#00a8ff]/10 to-transparent rounded-lg" />
        </motion.div>
      </div>

      {/* Center Section - Main Display */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-8">
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

        {/* Transcript Display */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full max-w-[500px] min-h-[60px] bg-gradient-to-r from-blue-900/30 via-blue-800/20 to-blue-900/30 backdrop-blur-sm rounded-lg border border-blue-500/30 p-4 flex flex-col items-center justify-center text-center gap-2"
          >
            <span className="text-[#00a8ff] text-lg font-light">
              {transcript || (isListening ? "Listening..." : "Click the microphone to speak")}
            </span>
            {isProcessing && (
              <motion.div
                className="w-4 h-4 border-2 border-t-transparent border-[#00a8ff] rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            )}
            {jarvisResponse && !isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-400 text-sm mt-2"
              >
                {typeof jarvisResponse === 'string' 
                  ? jarvisResponse 
                  : JSON.stringify(jarvisResponse, null, 2)}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Microphone Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleVoiceRecognition}
          className={`w-16 h-16 bg-[#00a8ff]/20 hover:bg-[#00a8ff]/30 border-2 ${
            isListening ? 'border-red-500/50 bg-red-500/20' : 'border-[#00a8ff]/50'
          } rounded-full flex items-center justify-center text-[#00a8ff] transition-all duration-300 group mt-4 relative`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-8 w-8 group-hover:text-white transition-colors ${
              isListening ? 'text-red-500' : 'text-[#00a8ff]'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
          {isListening && (
            <motion.div
              className="absolute -inset-1 border-2 border-red-500/50 rounded-full"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.button>

        {/* Voice Recognition Feedback */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-[#00a8ff] text-sm mt-2 bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-500/30"
            >
              {transcript || "Listening..."}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && renderAuthUI()}
      </AnimatePresence>

      {/* Corner Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-40 h-40 border-r-2 border-t-2 border-[#00a8ff]/30 rounded-tr-3xl bg-gradient-to-br from-blue-500/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-40 h-40 border-l-2 border-b-2 border-[#00a8ff]/30 rounded-bl-3xl bg-gradient-to-tl from-blue-500/5 to-transparent" />
      </div>

      {/* Greeting */}
      {loginSuccess && !showAuth && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-2xl text-[#00a8ff] font-medium backdrop-blur-sm bg-blue-900/10 px-6 py-3 rounded-lg border border-blue-500/30"
        >
          Hello, {currentUser}
        </motion.div>
      )}
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