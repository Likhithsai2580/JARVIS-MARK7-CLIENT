import { EventEmitter } from 'events';

class VoiceRecognitionService {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  public events: EventEmitter;

  constructor() {
    this.events = new EventEmitter();
    this.initializeRecognition();
  }

  private initializeRecognition() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.events.emit('onStart');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.events.emit('onEnd');
      };

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        this.events.emit('onResult', transcript);
      };

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        this.events.emit('onError', event.error);
      };
    } else {
      console.error('Speech recognition not supported in this browser');
    }
  }

  public start() {
    if (this.recognition && !this.isListening) {
      this.recognition.start();
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  public isSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }
}

export default VoiceRecognitionService; 