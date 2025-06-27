"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { handleGenerateVocabulary, handleRegenerateVocabulary } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { generateQuiz, QuizQuestion } from '@/lib/quiz-generator';
import type { GenerateVocabularyOutput } from '@/ai/flows/generate-vocabulary';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TextToSpeechButton } from '@/components/text-to-speech-button';
import { Quiz } from '@/components/quiz';
import { BookOpen, Languages, Loader2, RefreshCw } from 'lucide-react';

type VocabularyItem = GenerateVocabularyOutput['vocabulary'][0];

const initialState = {
  data: null,
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2 h-4 w-4" />}
      Generate Vocabulary
    </Button>
  );
}

export function LinguascapeApp() {
  const [state, formAction] = useFormState(handleGenerateVocabulary, initialState);
  const { toast } = useToast();

  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [situation, setSituation] = useState('');
  const [language, setLanguage] = useState('');
  const [quizKey, setQuizKey] = useState(0); 
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (state.error) {
      const errorMessage = typeof state.error === 'string' ? state.error : 'An unexpected error occurred.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
    if (state.data) {
      setVocabulary(state.data.vocabulary);
      const newQuestions = generateQuiz(state.data.vocabulary);
      setQuizQuestions(newQuestions);
      setQuizKey(prev => prev + 1);
    }
  }, [state, toast]);

  const regenerateQuiz = useCallback(() => {
    if (vocabulary.length > 0) {
      const newQuestions = generateQuiz(vocabulary);
      setQuizQuestions(newQuestions);
      setQuizKey(prev => prev + 1);
    }
  }, [vocabulary]);
  
  const handleRegenerate = async () => {
    if (!situation || !language) {
        toast({ title: "Error", description: "Please enter a situation and language first.", variant: "destructive" });
        return;
    }
    setIsRegenerating(true);
    const result = await handleRegenerateVocabulary({
        context: situation,
        language: language,
        previousVocabulary: vocabulary.map(v => v.wordPhrase),
    });
    setIsRegenerating(false);

    if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
    } else if (result.data) {
        setVocabulary(prev => [...prev, ...result.data.vocabulary]);
        regenerateQuiz();
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-2">
            <Languages className="h-10 w-10 text-primary"/>
            <h1 className="text-5xl font-bold font-headline">Linguascape</h1>
        </div>
        <p className="text-xl text-muted-foreground">Your AI-powered guide to real-world conversations.</p>
      </header>

      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle>Describe a situation</CardTitle>
          <CardDescription>Enter a scenario and a language to get started. For example, "Ordering food at a restaurant" in "Spanish".</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col md:flex-row gap-4">
            <Input 
                name="situation" 
                placeholder="Enter a situation..." 
                required 
                className="flex-grow"
                onChange={(e) => setSituation(e.target.value)}
            />
            <Input 
                name="language" 
                placeholder="Enter a language..." 
                required 
                className="md:max-w-xs"
                onChange={(e) => setLanguage(e.target.value)}
            />
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
      
      {vocabulary.length > 0 && (
        <div className="space-y-8">
          <Separator />
          <div>
            <h2 className="text-3xl font-bold font-headline mb-4">Your Vocabulary List</h2>
            <div className="grid gap-4 md:grid-cols-2">
                {vocabulary.map((item, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-lg">{item.wordPhrase}</CardTitle>
                            <TextToSpeechButton text={item.wordPhrase} language={language} />
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <p className="text-muted-foreground italic">"{item.exampleSentence}"</p>
                             <TextToSpeechButton text={item.exampleSentence} language={language} />
                        </CardContent>
                    </Card>
                ))}
            </div>
             <div className="text-center mt-6">
                 <Button onClick={handleRegenerate} disabled={isRegenerating}>
                     {isRegenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                     Get More Vocabulary
                 </Button>
             </div>
          </div>

          <Separator />
          <Quiz key={quizKey} questions={quizQuestions} onRegenerate={regenerateQuiz} />
        </div>
      )}
    </div>
  );
}
