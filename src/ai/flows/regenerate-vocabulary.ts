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
  vocabulary: z.array(z.string()).describe('A list of relevant vocabulary words and phrases in the target language.'),
  exampleSentences: z.array(z.string()).describe('Example sentences or dialogues for each vocabulary word or phrase.'),
});
export type RegenerateVocabularyOutput = z.infer<typeof RegenerateVocabularyOutputSchema>;

export async function regenerateVocabulary(input: RegenerateVocabularyInput): Promise<RegenerateVocabularyOutput> {
  return regenerateVocabularyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'regenerateVocabularyPrompt',
  input: {schema: RegenerateVocabularyInputSchema},
  output: {schema: RegenerateVocabularyOutputSchema},
  prompt: `You are a language learning assistant. Your task is to generate a list of relevant vocabulary words and phrases in the target language, tailored to the real-world situation the user has entered.  Also supply example sentences or dialogues for each word and phrase.

Context: {{{context}}}
Language: {{{language}}}

{{#if previousVocabulary}}
Here is the previous vocabulary:
{{#each previousVocabulary}}- {{{this}}}}
{{/each}}
Avoid repeating these words.
{{/if}}
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
