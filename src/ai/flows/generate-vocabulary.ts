'use server';

/**
 * @fileOverview Vocabulary generator for a given real-world situation.
 *
 * - generateVocabulary - A function that handles the vocabulary generation process.
 * - GenerateVocabularyInput - The input type for the generateVocabulary function.
 * - GenerateVocabularyOutput - The return type for the generateVocabulary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVocabularyInputSchema = z.object({
  situation: z.string().describe("A real-world situation (e.g., 'ordering coffee in Paris')."),
  targetLanguage: z.string().describe("The target language for vocabulary generation (e.g., 'French')."),
  numResults: z.number().default(5).describe('The number of vocabulary words/phrases to generate.'),
});
export type GenerateVocabularyInput = z.infer<typeof GenerateVocabularyInputSchema>;

const GenerateVocabularyOutputSchema = z.object({
  vocabulary: z.array(
    z.object({
      wordPhrase: z.string().describe('The vocabulary word or phrase in the target language.'),
      translation: z.string().describe('The English translation of the word or phrase.'),
      exampleSentence: z.string().describe('An example sentence using the word or phrase.'),
      exampleSentenceTranslation: z.string().describe('The English translation of the example sentence.'),
      type: z.enum(['word', 'phrase']).describe("Whether the item is a 'word' or a 'phrase'."),
    })
  ).describe('A list of vocabulary words/phrases, their translations, and example sentences.'),
});
export type GenerateVocabularyOutput = z.infer<typeof GenerateVocabularyOutputSchema>;

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
