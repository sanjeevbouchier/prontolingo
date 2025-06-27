'use server';

/**
 * @fileOverview AI agent for generating a quiz from a vocabulary list.
 *
 * - generateQuiz - A function that handles the quiz generation process.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 * - QuizQuestion - The type for a single quiz question.
 */

import {ai} from '@/ai/genkit';
import {
    GenerateQuizInputSchema,
    type GenerateQuizInput,
    GenerateQuizOutputSchema,
    type GenerateQuizOutput,
    type QuizQuestion
} from '../schemas';

export type { GenerateQuizInput, GenerateQuizOutput, QuizQuestion };

export async function generateQuiz(input: GenerateQuizInput): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateQuizPrompt',
    input: { schema: GenerateQuizInputSchema },
    output: { schema: GenerateQuizOutputSchema },
    prompt: `You are a language learning assistant. Your task is to generate a multiple-choice quiz based on the provided vocabulary list.

From the list of vocabulary words and phrases, create a quiz with up to {{{numQuestions}}} questions. If there aren't enough vocabulary items to create that many questions, create as many as you can.

Each quiz question must have:
- A "question", which is a "wordPhrase" from the vocabulary list.
- An array of 4 unique "options". The options MUST be "exampleSentence" values from the provided vocabulary. One option must be the correct sentence for the "question", and the other three must be distractors from *other* vocabulary items.
- A "correctAnswer", which is the correct "exampleSentence" and must be one of the items in the "options" array.

Ensure the options are shuffled for each question. Do not use the same wordPhrase for more than one question.

Here is the vocabulary to use:
{{#each vocabulary}}
- Word/Phrase: "{{this.wordPhrase}}" ({{this.translation}}) -> Example: "{{this.exampleSentence}}"
{{/each}}

Format your response as a JSON object compliant with the output schema.
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    if (input.vocabulary.length < 4) {
        return { questions: [] };
    }
    const {output} = await prompt(input);
    return output!;
  }
);
