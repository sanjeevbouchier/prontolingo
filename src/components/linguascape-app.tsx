"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages, BookOpen, Loader2 } from 'lucide-react';

export function LinguascapeApp() {
  const router = useRouter();
  const [situation, setSituation] = useState('');
  const [language, setLanguage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!situation || !language) return;

    setIsSubmitting(true);
    const params = new URLSearchParams({ situation, language });
    router.push(`/learn?${params.toString()}`);
  };
  
  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-screen">
      <header className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-2">
            <Languages className="h-10 w-10 text-primary"/>
            <h1 className="text-5xl font-bold font-headline">Linguascape</h1>
        </div>
        <p className="text-xl text-muted-foreground">Your AI-powered guide to real-world conversations.</p>
      </header>

      <Card className="mb-8 shadow-lg w-full max-w-2xl">
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
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><BookOpen className="mr-2 h-4 w-4" /> Start Learning</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
