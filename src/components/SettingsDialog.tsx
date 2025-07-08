import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  voiceId: string;
  onVoiceIdChange: (voiceId: string) => void;
}

const VOICE_OPTIONS = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', description: 'Natural female voice' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', description: 'Professional male voice' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', description: 'Friendly female voice' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', description: 'Warm female voice' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', description: 'Young male voice' },
];

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  apiKey,
  onApiKeyChange,
  voiceId,
  onVoiceIdChange,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border/20">
        <DialogHeader>
          <DialogTitle className="text-foreground">Voice Assistant Settings</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure your ElevenLabs API settings for text-to-speech functionality.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-foreground">
              ElevenLabs API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              className="bg-background border-border/20"
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a 
                href="https://elevenlabs.io/app/settings/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                ElevenLabs Settings
              </a>
            </p>
          </div>

          {/* Voice Selection */}
          <div className="space-y-2">
            <Label htmlFor="voice" className="text-foreground">
              Voice
            </Label>
            <Select value={voiceId} onValueChange={onVoiceIdChange}>
              <SelectTrigger className="bg-background border-border/20">
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/20">
                {VOICE_OPTIONS.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{voice.name}</span>
                      <span className="text-xs text-muted-foreground">{voice.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-muted/20 rounded-lg">
            <h4 className="text-sm font-medium text-foreground mb-2">How to use:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Click "Start Listening" to begin voice interaction</li>
              <li>• Speak clearly and wait for the response</li>
              <li>• The assistant will respond with both text and voice</li>
              <li>• Requires microphone permission in your browser</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose} className="bg-gradient-primary">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;