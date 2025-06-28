'use server';

import { generateVocabulary, GenerateVocabularyInput, GenerateVocabularyOutput } from '@/ai/flows/generate-vocabulary';
import { regenerateVocabulary, RegenerateVocabularyInput, RegenerateVocabularyOutput } from '@/ai/flows/regenerate-vocabulary';
import { generateQuiz, GenerateQuizInput, GenerateQuizOutput, QuizQuestion } from '@/ai/flows/generate-quiz';
import { generateTitle, GenerateTitleInput, GenerateTitleOutput } from '@/ai/flows/generate-title';
import { GenerateVocabularyInputSchema } from '@/ai/schemas';

type VocabularyState = {
    data?: GenerateVocabularyOutput | RegenerateVocabularyOutput | null;
    error?: any;
}

export async function handleGenerateVocabulary(input: GenerateVocabularyInput): Promise<VocabularyState> {
  const validatedFields = GenerateVocabularyInputSchema.safeParse(input);

  if (!validatedFields.success) {
    return { error: 'Invalid input.' };
  }

  try {
    const result = await generateVocabulary(validatedFields.data);
    return { data: result };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate vocabulary. Please try again.' };
  }
}

export async function handleRegenerateVocabulary(input: RegenerateVocabularyInput): Promise<VocabularyState> {
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

type TitleState = {
    data?: GenerateTitleOutput;
    error?: any;
}

export async function handleGenerateTitle(input: GenerateTitleInput): Promise<TitleState> {
    try {
        const result = await generateTitle(input);
        return { data: result };
    } catch (error) {
        console.error(error);
        return { error: 'Failed to generate title.' };
    }
}
