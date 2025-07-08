import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import VoiceVisualizer from './VoiceVisualizer';
import SettingsDialog from './SettingsDialog';

// Add type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const VoiceAssistant: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [voiceId, setVoiceId] = useState('Aria');
  
  const { toast } = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    // Check for speech recognition support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    if (recognitionRef.current) {
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');

        if (event.results[event.results.length - 1].isFinal) {
          handleUserMessage(transcript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        stopAudioVisualization();
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        stopAudioVisualization();
        toast({
          title: "Speech Recognition Error",
          description: "Failed to process speech. Please try again.",
          variant: "destructive"
        });
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const startListening = async () => {
    try {
      if (!recognitionRef.current) return;
      
      await setupAudioVisualization();
      recognitionRef.current.start();
      setIsListening(true);
      
      toast({
        title: "Listening...",
        description: "Speak clearly and I'll assist you",
      });
    } catch (error) {
      console.error('Error starting recognition:', error);
      toast({
        title: "Microphone Error",
        description: "Unable to access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    stopAudioVisualization();
  };

  const setupAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        setAudioLevel(average / 255);
        
        if (isListening) {
          animationRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error setting up audio visualization:', error);
    }
  };

  const stopAudioVisualization = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setAudioLevel(0);
  };

  const handleUserMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response (replace with actual AI API)
    const response = await getAIResponse(text.trim());
    
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response,
      isUser: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    
    // Convert AI response to speech
    if (apiKey) {
      await speakText(response);
    }
  };

  const getAIResponse = async (userText: string): Promise<string> => {
    // Simulated responses - replace with actual AI API call
    const responses = [
      "I understand you're asking about that. Let me help you with that.",
      "That's an interesting question. Here's what I think...",
      "I'd be happy to assist you with that request.",
      "Based on what you've said, I recommend...",
      "Let me provide you with some helpful information about that."
    ];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const speakText = async (text: string) => {
    if (!apiKey) {
      toast({
        title: "ElevenLabs API Key Required",
        description: "Please add your ElevenLabs API key in settings to enable text-to-speech.",
        variant: "destructive"
      });
      return;
    }

    setIsSpeaking(true);
    
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/9BWtsMINqrJLrRacOk9x', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsSpeaking(false);
      toast({
        title: "Speech Generation Error",
        description: "Failed to generate speech. Check your API key.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col items-center justify-center p-4">
      {/* Settings Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsSettingsOpen(true)}
        className="absolute top-4 right-4 border-border/20 bg-card/50 backdrop-blur-sm"
      >
        <Settings className="h-4 w-4" />
      </Button>

      <div className="w-full max-w-2xl space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            AI Voice Assistant
          </h1>
          <p className="text-muted-foreground">
            Speak naturally and I'll respond with voice and text
          </p>
        </div>

        {/* Voice Visualizer */}
        <div className="flex justify-center">
          <VoiceVisualizer 
            isActive={isListening || isSpeaking}
            audioLevel={isListening ? audioLevel : (isSpeaking ? 0.7 : 0)}
            mode={isListening ? 'listening' : isSpeaking ? 'speaking' : 'idle'}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <Button
            size="lg"
            onClick={isListening ? stopListening : startListening}
            className={`relative px-8 py-6 rounded-full transition-all duration-300 ${
              isListening 
                ? 'bg-destructive hover:bg-destructive/90 shadow-voice animate-pulse-glow' 
                : 'bg-gradient-primary hover:shadow-glow'
            }`}
          >
            {isListening ? (
              <MicOff className="h-6 w-6 mr-2" />
            ) : (
              <Mic className="h-6 w-6 mr-2" />
            )}
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </Button>

          <Button
            variant="outline"
            size="lg"
            disabled={!isSpeaking}
            className="px-6 py-6 rounded-full border-border/20 bg-card/50 backdrop-blur-sm"
          >
            {isSpeaking ? (
              <VolumeX className="h-6 w-6" />
            ) : (
              <Volume2 className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Chat Messages */}
        {messages.length > 0 && (
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/20 max-h-64 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isUser
                        ? 'bg-gradient-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Status */}
        <div className="text-center text-sm text-muted-foreground">
          {isListening && "🎤 Listening..."}
          {isSpeaking && "🔊 Speaking..."}
          {!isListening && !isSpeaking && "Ready to assist"}
        </div>
      </div>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onApiKeyChange={setApiKey}
        voiceId={voiceId}
        onVoiceIdChange={setVoiceId}
      />
    </div>
  );
};

export default VoiceAssistant;