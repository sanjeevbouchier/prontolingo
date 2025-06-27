"use client";

import React, { useState, useEffect, useCallback, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { handleGenerateVocabulary, handleRegenerateVocabulary } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import { generateQuiz, QuizQuestion } from '@/lib/quiz-generator';
import type { GenerateVocabularyOutput } from '@/ai/flows/generate-vocabulary';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TextToSpeechButton } from '@/components/text-to-speech-button';
import { Quiz } from '@/components/quiz';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [state, formAction] = useActionState(handleGenerateVocabulary, initialState);
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
        const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to regenerate vocabulary.';
        toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } else if (result.data) {
        setVocabulary(prev => [...prev, ...result.data.vocabulary]);
        regenerateQuiz();
    }
  };
  
  const words = vocabulary.filter(item => item.type === 'word');
  const phrases = vocabulary.filter(item => item.type === 'phrase');

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
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
      
      {vocabulary.length > 0 && (
        <div className="space-y-8">
          <Separator />
          <div>
            <h2 className="text-3xl font-bold font-headline mb-4 text-center">Your Vocabulary List</h2>
            <Tabs defaultValue="vocabulary" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="vocabulary">Vocabulary ({words.length})</TabsTrigger>
                <TabsTrigger value="phrases">Phrases ({phrases.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="vocabulary" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                    {words.map((item, index) => (
                        <Card key={`word-${index}`}>
                          <CardHeader className="pb-4">
                              <div className="flex items-start justify-between">
                                  <div>
                                      <CardTitle className="text-lg">{item.wordPhrase}</CardTitle>
                                      <p className="text-sm text-muted-foreground">{item.translation}</p>
                                  </div>
                                  <TextToSpeechButton text={item.wordPhrase} language={language} />
                              </div>
                          </CardHeader>
                          <CardContent className="flex items-start justify-between">
                              <div className="space-y-1 italic text-sm">
                                  <p>"{item.exampleSentence}"</p>
                                  <p className="text-muted-foreground">"{item.exampleSentenceTranslation}"</p>
                              </div>
                               <TextToSpeechButton text={item.exampleSentence} language={language} />
                          </CardContent>
                        </Card>
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="phrases" className="mt-4">
                <div className="grid gap-4 md:grid-cols-1">
                    {phrases.map((item, index) => (
                      <Card key={`phrase-${index}`}>
                        <CardHeader className="pb-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-lg">{item.wordPhrase}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{item.translation}</p>
                                </div>
                                <TextToSpeechButton text={item.wordPhrase} language={language} />
                            </div>
                        </CardHeader>
                        <CardContent className="flex items-start justify-between">
                            <div className="space-y-1 italic text-sm">
                                <p>"{item.exampleSentence}"</p>
                                <p className="text-muted-foreground">"{item.exampleSentenceTranslation}"</p>
                            </div>
                             <TextToSpeechButton text={item.exampleSentence} language={language} />
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
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
