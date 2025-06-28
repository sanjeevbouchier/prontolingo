"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { handleGenerateVocabulary, handleRegenerateVocabulary, handleGenerateQuiz, handleGenerateTitle } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";
import type { VocabularyItem, QuizQuestion } from '@/ai/schemas';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { TextToSpeechButton } from '@/components/text-to-speech-button';
import { Quiz } from '@/components/quiz';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, RefreshCw, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function LearnView() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();

    const situation = searchParams.get('situation');
    const language = searchParams.get('language');

    const [title, setTitle] = useState('');
    const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [quizKey, setQuizKey] = useState(0); 
    const [isGenerating, setIsGenerating] = useState(true);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);

    const getQuiz = useCallback(async (currentVocabulary: VocabularyItem[]) => {
        if (currentVocabulary.length < 4) {
        setQuizQuestions([]);
        return;
        }
        setIsGeneratingQuiz(true);
        const result = await handleGenerateQuiz({ vocabulary: currentVocabulary, numQuestions: 6 });
        setIsGeneratingQuiz(false);

        if (result.error) {
        const errorMessage = typeof result.error === 'string' ? result.error : 'Failed to generate quiz.';
        toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
        } else if (result.data) {
        setQuizQuestions(result.data);
        setQuizKey((prev) => prev + 1);
        }
    }, [toast]);
    
    const regenerateQuiz = useCallback(() => {
    if (vocabulary.length > 0) {
        getQuiz(vocabulary);
    }
    }, [vocabulary, getQuiz]);

    useEffect(() => {
    if (!situation || !language) {
        router.push('/');
        return;
    }

    const fetchData = async () => {
        setIsGenerating(true);

        const titlePromise = handleGenerateTitle({ situation, language });
        const vocabPromise = handleGenerateVocabulary({
        situation,
        targetLanguage: language,
        numResults: 10,
        });

        const [titleResult, vocabResult] = await Promise.all([titlePromise, vocabPromise]);

        if (titleResult.error || !titleResult.data) {
            toast({ title: 'Error', description: 'Failed to generate a title.', variant: 'destructive' });
            setTitle(situation); // Fallback to the user-provided situation
        } else {
            setTitle(titleResult.data.title);
        }

        if (vocabResult.error || !vocabResult.data) {
            toast({ title: 'Error', description: 'Failed to generate vocabulary.', variant: 'destructive' });
            setVocabulary([]);
        } else {
            if (vocabResult.data?.vocabulary) {
                setVocabulary(vocabResult.data.vocabulary);
                getQuiz(vocabResult.data.vocabulary);
            }
        }

        setIsGenerating(false);
    };
    
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [situation, language, router, toast]);
    
    const handleRegenerate = async () => {
    if (!situation || !language) return;

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
        const newVocabulary = [...vocabulary, ...result.data.vocabulary];
        setVocabulary(newVocabulary);
        getQuiz(newVocabulary);
    }
    };
    
    const words = vocabulary.filter(item => item.type === 'word');
    const phrases = vocabulary.filter(item => item.type === 'phrase');

    return (
    <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft />
            <span className="sr-only">Back</span>
            </Button>
            {isGenerating ? (
                <Skeleton className="h-9 w-2/3" />
            ) : (
            <h1 className="text-4xl font-bold font-headline">{title}</h1>
            )}
        </div>
        </header>

        {isGenerating && (
        <div className="space-y-8">
            <div className="flex items-center justify-center space-x-2 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xl text-muted-foreground">Building your lesson...</p>
            </div>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
        )}
        
        {!isGenerating && vocabulary.length > 0 && (
        <div className="space-y-8">
            <Separator />
            <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-bold font-headline">Your Vocabulary List</h2>
                    <Button onClick={handleRegenerate} disabled={isRegenerating || isGeneratingQuiz}>
                        {isRegenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Get More Vocabulary
                    </Button>
            </div>
            <Tabs defaultValue="words" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="words">Words ({words.length})</TabsTrigger>
                <TabsTrigger value="phrases">Phrases ({phrases.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="words" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2">
                    {words.map((item, index) => (
                        <Card key={`word-${index}`}>
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{item.wordPhrase}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{item.translation}</p>
                                    </div>
                                    <TextToSpeechButton text={item.wordPhrase} language={language || ''} />
                                </div>
                            </CardHeader>
                            <CardContent className="flex items-start justify-between">
                                <div className="space-y-1 italic text-sm">
                                    <p>"{item.exampleSentence}"</p>
                                    <p className="text-muted-foreground">"{item.exampleSentenceTranslation}"</p>
                                </div>
                                <TextToSpeechButton text={item.exampleSentence} language={language || ''} />
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
                                <TextToSpeechButton text={item.wordPhrase} language={language || ''} />
                            </div>
                        </CardHeader>
                        <CardContent className="flex items-start justify-between">
                            <div className="space-y-1 italic text-sm">
                                <p>"{item.exampleSentence}"</p>
                                <p className="text-muted-foreground">"{item.exampleSentenceTranslation}"</p>
                            </div>
                                <TextToSpeechButton text={item.exampleSentence} language={language || ''} />
                        </CardContent>
                        </Card>
                    ))}
                </div>
                </TabsContent>
            </Tabs>
            </div>

            <Separator />
            {isGeneratingQuiz && (
                <div className="flex items-center justify-center space-x-2 py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-muted-foreground">Generating your quiz...</p>
                </div>
            )}
            {!isGeneratingQuiz && quizQuestions.length > 0 && (
                <Quiz key={quizKey} questions={quizQuestions} onRegenerate={regenerateQuiz} />
            )}
        </div>
        )}

        {!isGenerating && vocabulary.length === 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>No Vocabulary Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>We couldn't generate vocabulary for the specified situation. Please try a different one.</p>
                </CardContent>
            </Card>
        )}
    </div>
    );
}
