"use client";

import React, { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TextToSpeechButtonProps {
  text: string;
  language: string;
}

export function TextToSpeechButton({ text, language }: TextToSpeechButtonProps) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    if (typeof window !== 'undefined' && window.speechSynthesis) {
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        }
        loadVoices();
    }
  }, []);

  const handleSpeak = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    const languageCode = language.split('-')[0];
    const bestVoice = voices.find(v => v.lang.startsWith(languageCode));
    
    if (bestVoice) {
      utterance.voice = bestVoice;
    } else {
      utterance.lang = language;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleSpeak} aria-label={`Listen to "${text}"`}>
      <Volume2 className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
    </Button>
  );
}
