'use server';

/**
 * @fileOverview AI agent for regenerating vocabulary based on a given context.
 *
 * - regenerateVocabulary - A function that regenerates the vocabulary.
 * - RegenerateVocabularyInput - The input type for the regenerateVocabulary function.
 * - RegenerateVocabularyOutput - The return type for the regenerateVocabulary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RegenerateVocabularyInputSchema = z.object({
  context: z.string().describe('The context or situation for which to generate vocabulary.'),
  language: z.string().describe('The target language for the vocabulary.'),
  previousVocabulary: z.array(z.string()).optional().describe('The previous list of vocabulary words, if any.')
});
export type RegenerateVocabularyInput = z.infer<typeof RegenerateVocabularyInputSchema>;

const RegenerateVocabularyOutputSchema = z.object({
  vocabulary: z.array(
    z.object({
      wordPhrase: z.string().describe('The vocabulary word or phrase in the target language.'),
      translation: z.string().describe('The English translation of the word or phrase.'),
      exampleSentence: z.string().describe('An example sentence using the word or phrase.'),
      exampleSentenceTranslation: z.string().describe('The English translation of the example sentence.'),
      type: z.enum(['word', 'phrase']).describe("Whether the item is a 'word' or a 'phrase'."),
    })
  ).describe('A list of new vocabulary words/phrases, their translations, and example sentences, not including the previous ones.'),
});
export type RegenerateVocabularyOutput = z.infer<typeof RegenerateVocabularyOutputSchema>;

export async function regenerateVocabulary(input: RegenerateVocabularyInput): Promise<RegenerateVocabularyOutput> {
  return regenerateVocabularyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'regenerateVocabularyPrompt',
  input: {schema: RegenerateVocabularyInputSchema},
  output: {schema: RegenerateVocabularyOutputSchema},
  prompt: `You are a language learning assistant. Your task is to generate a new list of relevant vocabulary words and phrases in the target language, tailored to the real-world situation the user has entered.

Context: {{{context}}}
Language: {{{language}}}

Generate 5 new vocabulary items. For each item, provide:
1.  The word or phrase in the target language.
2.  The English translation of the word or phrase.
3.  An example sentence in the target language.
4.  The English translation of the example sentence.
5.  The type of item: either 'word' for single words, or 'phrase' for multi-word expressions.

{{#if previousVocabulary}}
Here is the previous vocabulary you have already provided:
{{#each previousVocabulary}}- {{{this}}}
{{/each}}
Do not generate any of these words or phrases again. Generate completely new and distinct items.
{{/if}}

Format your response as a JSON object with a single key called "vocabulary" whose value is an array of objects. Each object in the array has five keys:

*   "wordPhrase": The vocabulary word or phrase in the target language.
*   "translation": The English translation.
*   "exampleSentence": An example sentence.
*   "exampleSentenceTranslation": The English translation of the example sentence.
*   "type": "word" or "phrase".

Make sure that the response only contains the JSON, with no other preamble or explanatory text.
`,
});

const regenerateVocabularyFlow = ai.defineFlow(
  {
    name: 'regenerateVocabularyFlow',
    inputSchema: RegenerateVocabularyInputSchema,
    outputSchema: RegenerateVocabularyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
