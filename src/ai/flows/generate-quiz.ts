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
    prompt: `You are a language learning assistant. Your task is to generate a multiple-choice quiz that tests a user's ability to respond to real-life situations using the provided vocabulary.

From the list of vocabulary, create a quiz with up to {{{numQuestions}}} questions. If there aren't enough vocabulary items to create that many questions, create as many as you can.

Each quiz question must have:
- A "situation": A short, real-life scenario or a question someone might ask. This situation should be in English and should relate to one of the vocabulary items. The situation should make it so that only one of the provided options is a logical response.
- An array of 4 unique "options": These are potential responses in the target language.
    - One option must be the correct response to the situation. This correct response should be the "exampleSentence" from the relevant vocabulary item.
    - The other three options must be distractors, which should be "exampleSentence" values from *other* vocabulary items in the list.
- A "correctAnswer": This must be the correct "exampleSentence" from the "options" array.

Ensure the options are shuffled for each question. Do not use the same vocabulary item for the correct answer in more than one question.

Here is the vocabulary to use for generating the situations and responses:
{{#each vocabulary}}
- Word/Phrase: "{{this.wordPhrase}}" ({{this.translation}}) -> Example: "{{this.exampleSentence}}" (English: "{{this.exampleSentenceTranslation}}")
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