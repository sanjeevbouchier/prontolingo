import type { GenerateVocabularyOutput } from '@/ai/flows/generate-vocabulary';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function generateQuiz(vocabulary: GenerateVocabularyOutput['vocabulary'], numQuestions: number = 6): QuizQuestion[] {
  if (vocabulary.length < 4) {
    return [];
  }

  const shuffledVocabulary = shuffleArray(vocabulary);
  const questions: QuizQuestion[] = [];

  for (let i = 0; i < Math.min(numQuestions, shuffledVocabulary.length); i++) {
    const correctEntry = shuffledVocabulary[i];
    
    const question = correctEntry.wordPhrase;
    const correctAnswer = correctEntry.exampleSentence;
    
    const distractors = shuffledVocabulary
      .filter(item => item.wordPhrase !== correctEntry.wordPhrase)
      .map(item => item.exampleSentence);

    const shuffledDistractors = shuffleArray(distractors).slice(0, 3);
    
    if (shuffledDistractors.length < 3) {
      continue;
    }
    
    const options = shuffleArray([correctAnswer, ...shuffledDistractors]);
    
    questions.push({
      question,
      options,
      correctAnswer,
    });
  }

  return questions;
}
