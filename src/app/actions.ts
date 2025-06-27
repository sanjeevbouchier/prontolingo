'use server';

import { generateVocabulary, GenerateVocabularyInput, GenerateVocabularyOutput } from '@/ai/flows/generate-vocabulary';
import { regenerateVocabulary, RegenerateVocabularyInput, RegenerateVocabularyOutput } from '@/ai/flows/regenerate-vocabulary';
import { generateQuiz, GenerateQuizInput, GenerateQuizOutput, QuizQuestion } from '@/ai/flows/generate-quiz';
import { z } from 'zod';

const situationSchema = z.object({
  situation: z.string().min(3, { message: 'Situation must be at least 3 characters long.' }),
  language: z.string().min(2, { message: 'Language must be at least 2 characters long.' }),
});

type FormState = {
    data?: GenerateVocabularyOutput | null;
    error?: any;
}

export async function handleGenerateVocabulary(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = situationSchema.safeParse({
    situation: formData.get('situation'),
    language: formData.get('language'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { situation, language } = validatedFields.data;

  try {
    const input: GenerateVocabularyInput = {
      situation,
      targetLanguage: language,
      numResults: 10,
    };
    const result = await generateVocabulary(input);
    return { data: result };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate vocabulary. Please try again.' };
  }
}

export async function handleRegenerateVocabulary(input: RegenerateVocabularyInput): Promise<FormState> {
    try {
        const result: RegenerateVocabularyOutput = await regenerateVocabulary(input);
        return { data: result };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to regenerate vocabulary. Please try again.' };
    }
}

type QuizState = {
    data?: QuizQuestion[];
    error?: any;
}
export async function handleGenerateQuiz(input: GenerateQuizInput): Promise<QuizState> {
    try {
        const result: GenerateQuizOutput = await generateQuiz(input);
        return { data: result.questions };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to generate quiz. Please try again.' };
    }
}
