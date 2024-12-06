import React, { useEffect, useState } from 'react';
import { Box, IconButton, Typography, CircularProgress } from '@mui/material';
import { Mic, MicOff } from '@mui/icons-material';
import VoiceRecognitionService from '../services/VoiceRecognitionService';

interface VoiceCommandsProps {
  onCommand: (command: string) => void;
}

const VoiceCommands: React.FC<VoiceCommandsProps> = ({ onCommand }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceService] = useState(() => new VoiceRecognitionService());

  useEffect(() => {
    voiceService.events.on('onStart', () => {
      setIsListening(true);
    });

    voiceService.events.on('onEnd', () => {
      setIsListening(false);
    });

    voiceService.events.on('onResult', (text: string) => {
      setTranscript(text);
      processCommand(text);
    });

    voiceService.events.on('onError', (error: string) => {
      console.error('Voice recognition error:', error);
      setIsListening(false);
    });

    return () => {
      voiceService.stop();
    };
  }, [voiceService]);

  const processCommand = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Basic command processing
    if (lowerText.includes('jarvis')) {
      if (lowerText.includes('hello') || lowerText.includes('hi')) {
        onCommand('GREETING');
      } else if (lowerText.includes('logout') || lowerText.includes('sign out')) {
        onCommand('LOGOUT');
      } else if (lowerText.includes('execute') || lowerText.includes('run')) {
        const command = lowerText.replace(/jarvis|execute|run/gi, '').trim();
        onCommand(`EXECUTE:${command}`);
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      voiceService.stop();
    } else {
      voiceService.start();
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {transcript && (
          <Typography
            variant="body2"
            sx={{
              bgcolor: 'background.paper',
              p: 1,
              borderRadius: 1,
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {transcript}
          </Typography>
        )}
        <IconButton
          color={isListening ? 'primary' : 'default'}
          onClick={toggleListening}
          sx={{
            width: 56,
            height: 56,
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'action.hover'
            },
            boxShadow: 3
          }}
        >
          {isListening ? (
            <>
              <Mic />
              <CircularProgress
                size={52}
                sx={{
                  position: 'absolute',
                  color: 'primary.main'
                }}
              />
            </>
          ) : (
            <MicOff />
          )}
        </IconButton>
      </Box>
    </Box>
  );
};

export default VoiceCommands; 