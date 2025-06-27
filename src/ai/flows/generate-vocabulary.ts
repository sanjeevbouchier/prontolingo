'use server';

/**
 * @fileOverview Vocabulary generator for a given real-world situation.
 *
 * - generateVocabulary - A function that handles the vocabulary generation process.
 * - GenerateVocabularyInput - The input type for the generateVocabulary function.
 * - GenerateVocabularyOutput - The return type for the generateVocabulary function.
 */

import {ai} from '@/ai/genkit';
import {
  GenerateVocabularyInputSchema,
  type GenerateVocabularyInput,
  GenerateVocabularyOutputSchema,
  type GenerateVocabularyOutput
} from '../schemas';

export type { GenerateVocabularyInput, GenerateVocabularyOutput };

export async function generateVocabulary(input: GenerateVocabularyInput): Promise<GenerateVocabularyOutput> {
  return generateVocabularyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateVocabularyPrompt',
  input: {schema: GenerateVocabularyInputSchema},
  output: {schema: GenerateVocabularyOutputSchema},
  prompt: `You are a language learning assistant. Your task is to generate a list of relevant vocabulary words and phrases in the target language for a given real-world situation.

Situation: {{{situation}}}
Target Language: {{{targetLanguage}}}

Generate {{{numResults}}} vocabulary items. For each item, provide:
1.  The word or phrase in the target language.
2.  The English translation of the word or phrase.
3.  An example sentence in the target language.
4.  The English translation of the example sentence.
5.  The type of item: either 'word' for single words, or 'phrase' for multi-word expressions.

Format your response as a JSON object with a single key called "vocabulary" whose value is an array of objects. Each object in the array has five keys:

*   "wordPhrase": The vocabulary word or phrase in the target language.
*   "translation": The English translation.
*   "exampleSentence": An example sentence.
*   "exampleSentenceTranslation": The English translation of the example sentence.
*   "type": "word" or "phrase".

Make sure that the response only contains the JSON, with no other preamble or explanatory text.
`,
});

const generateVocabularyFlow = ai.defineFlow(
  {
    name: 'generateVocabularyFlow',
    inputSchema: GenerateVocabularyInputSchema,
    outputSchema: GenerateVocabularyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
