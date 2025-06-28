'use server';
    
/**
 * @fileOverview Generates a title for a learning session.
 *
 * - generateTitle - A function that handles title generation.
 * - GenerateTitleInput - The input type for the generateTitle function.
 * - GenerateTitleOutput - The return type for the generateTitle function.
 */

import {ai} from '@/ai/genkit';
import {
    GenerateTitleInputSchema,
    type GenerateTitleInput,
    GenerateTitleOutputSchema,
    type GenerateTitleOutput
} from '../schemas';

export type { GenerateTitleInput, GenerateTitleOutput };

export async function generateTitle(input: GenerateTitleInput): Promise<GenerateTitleOutput> {
    return generateTitleFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateTitlePrompt',
    input: {schema: GenerateTitleInputSchema},
    output: {schema: GenerateTitleOutputSchema},
    prompt: `You are a language learning assistant. Your task is to generate a short, engaging title for a learning session based on a given situation and language. The title should be in English.

Situation: {{{situation}}}
Target Language: {{{language}}}

Generate a title that is creative and relevant to the situation. For example, for "ordering coffee in Paris", a good title could be "Parisian Café Conversations".

Format your response as a JSON object with a single key called "title".
`,
});

const generateTitleFlow = ai.defineFlow(
    {
    name: 'generateTitleFlow',
    inputSchema: GenerateTitleInputSchema,
    outputSchema: GenerateTitleOutputSchema,
    },
    async input => {
    const {output} = await prompt(input);
    return output!;
    }
);
