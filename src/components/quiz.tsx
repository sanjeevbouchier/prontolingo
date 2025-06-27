"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import type { QuizQuestion } from '@/lib/quiz-generator';

interface QuizProps {
  questions: QuizQuestion[];
  onRegenerate: () => void;
}

export function Quiz({ questions, onRegenerate }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setIsQuizFinished(false);
  }, [questions]);

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

  const handleAnswerSelect = (answer: string) => {
    if (showFeedback) return;
    setSelectedAnswer(answer);
    setShowFeedback(true);
    if (answer === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      setIsQuizFinished(true);
    }
  };

  const handleRestart = () => {
    onRegenerate();
  };
  
  if (!questions || questions.length === 0) {
      return null;
  }

  const progressValue = ((isQuizFinished ? currentQuestionIndex + 1 : currentQuestionIndex) / questions.length) * 100;
  
  const getButtonClass = (option: string) => {
    if (!showFeedback) return 'hover:bg-accent';
    const isCorrectOption = option === currentQuestion.correctAnswer;
    const isSelected = selectedAnswer === option;

    if (isCorrectOption) {
        return 'border-primary bg-primary/10';
    }
    if (isSelected && !isCorrectOption) {
        return 'border-destructive bg-destructive/10';
    }
    return '';
  }

  return (
    <Card className="w-full bg-secondary/50 border-none shadow-inner">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-headline">Practice Quiz</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleRestart}>
            <RefreshCw className="h-5 w-5" />
            <span className="sr-only">Regenerate Quiz</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isQuizFinished ? (
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-2">Quiz Complete!</h3>
            <p className="text-muted-foreground text-lg mb-4">
              Your score: <span className="font-bold text-primary">{score}</span> / {questions.length}
            </p>
            <Button onClick={handleRestart}>Try Again</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
                <p className="text-sm text-muted-foreground mb-1">Question {currentQuestionIndex + 1} of {questions.length}</p>
                <p className="text-lg font-medium">What is the correct example for: <span className="font-bold text-primary">"{currentQuestion.question}"</span>?</p>
            </div>
            
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className={`w-full justify-start text-left h-auto py-3 whitespace-normal ${getButtonClass(option)}`}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={showFeedback}
                  >
                     <div className="flex items-start w-full">
                       <div className="flex-grow">{option}</div>
                       {showFeedback && selectedAnswer === option && (
                           isCorrect ? <CheckCircle2 className="h-5 w-5 text-primary ml-4 shrink-0"/> : <XCircle className="h-5 w-5 text-destructive ml-4 shrink-0"/>
                       )}
                     </div>
                  </Button>
                )
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <Progress value={progressValue} className="w-full h-2" />
        {showFeedback && !isQuizFinished && (
            <Button onClick={handleNextQuestion} className="w-full">
                {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
