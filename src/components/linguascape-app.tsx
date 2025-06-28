"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Loader2 } from 'lucide-react';

type Session = {
  situation: string;
  language: string;
  lastAccessed: number;
};

export function LinguascapeApp() {
  const router = useRouter();
  const [situation, setSituation] = useState('');
  const [language, setLanguage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousSessions, setPreviousSessions] = useState<Session[]>([]);

  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem('linguascape-sessions');
      if (storedSessions) {
        setPreviousSessions(JSON.parse(storedSessions));
      }
    } catch (error) {
        console.error("Failed to parse sessions from localStorage", error);
        setPreviousSessions([]);
    }
  }, []);

  const updateSessionHistory = (session: { situation: string; language: string }) => {
    const newSession: Session = { ...session, lastAccessed: Date.now() };

    const updatedSessions = [
      newSession,
      ...previousSessions.filter(
        (s) => !(s.situation === newSession.situation && s.language === newSession.language)
      ),
    ].slice(0, 9);

    setPreviousSessions(updatedSessions);
    try {
        localStorage.setItem('linguascape-sessions', JSON.stringify(updatedSessions));
    } catch (error) {
        console.error("Failed to save sessions to localStorage", error);
    }
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!situation || !language) return;

    setIsSubmitting(true);
    updateSessionHistory({ situation, language });
    const params = new URLSearchParams({ situation, language });
    router.push(`/learn?${params.toString()}`);
  };

  const handlePreviousSessionClick = (session: Session) => {
    updateSessionHistory(session);
    const params = new URLSearchParams({ situation: session.situation, language: session.language });
    router.push(`/learn?${params.toString()}`);
  }

  const handleExampleClick = (example: string) => {
    setSituation(example);
  };
  
  const exampleSituations = [
    "Checking into a hotel",
    "Asking for directions",
    "Shopping at a market",
    "Making a dinner reservation"
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col items-center">
      <header className="text-center my-8 md:my-12">
        <h1 className="text-5xl font-bold font-headline mb-2">Linguascape</h1>
        <p className="text-xl text-muted-foreground">Your AI-powered guide to real-world conversations.</p>
      </header>

      <Card className="shadow-lg w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Describe a situation</CardTitle>
          <CardDescription>Enter a scenario and a language to get started. For example, "Ordering food at a restaurant" in "Spanish".</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
            <Input 
                name="situation" 
                placeholder="Enter a situation..." 
                required 
                className="flex-grow"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
            />
            <Select name="language" required value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-full md:max-w-xs">
                    <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                    <SelectItem value="German">German</SelectItem>
                    <SelectItem value="Italian">Italian</SelectItem>
                    <SelectItem value="Japanese">Japanese</SelectItem>
                    <SelectItem value="Mandarin Chinese">Mandarin Chinese</SelectItem>
                    <SelectItem value="Russian">Russian</SelectItem>
                    <SelectItem value="Arabic">Arabic</SelectItem>
                    <SelectItem value="Portuguese">Portuguese</SelectItem>
                </SelectContent>
            </Select>
            <Button type="submit" disabled={isSubmitting || !situation || !language} className="w-full md:w-auto">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <BookOpen />}
              Start Learning
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
            <div className="relative w-full">
                <Separator />
                <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">OR</span>
            </div>
            <p className="text-sm text-muted-foreground">Try one of these examples:</p>
            <div className="flex flex-wrap gap-2">
                {exampleSituations.map((ex, i) => (
                    <Button key={i} variant="outline" size="sm" onClick={() => handleExampleClick(ex)}>
                        {ex}
                    </Button>
                ))}
            </div>
        </CardFooter>
      </Card>
      
      {previousSessions.length > 0 && (
        <div className="w-full max-w-4xl mt-12">
            <h2 className="text-2xl font-bold font-headline mb-6 text-center">Previous Sessions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {previousSessions.map((session, index) => (
                    <button
                        key={index}
                        onClick={() => handlePreviousSessionClick(session)}
                        className="text-left w-full h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                        <Card className="h-full flex flex-col hover:border-primary hover:shadow-lg transition-all duration-200">
                            <CardHeader className="flex-grow p-4 pb-2">
                                <CardTitle className="text-base leading-tight font-medium">{session.situation}</CardTitle>
                            </CardHeader>
                            <CardFooter className="p-4 pt-0">
                                <p className="text-sm text-muted-foreground">{session.language}</p>
                            </CardFooter>
                        </Card>
                    </button>
                ))}
            </div>
        </div>
      )}
    </div>
  );
}