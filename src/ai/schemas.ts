import { z } from 'zod';

// Base Schemas
export const VocabularyItemSchema = z.object({
  wordPhrase: z.string().describe('The vocabulary word or phrase in the target language.'),
  translation: z.string().describe('The English translation of the word or phrase.'),
  exampleSentence: z.string().describe('An example sentence using the word or phrase.'),
  exampleSentenceTranslation: z.string().describe('The English translation of the example sentence.'),
  type: z.enum(['word', 'phrase']).describe("Whether the item is a 'word' or a 'phrase'."),
});
export type VocabularyItem = z.infer<typeof VocabularyItemSchema>;

export const QuizQuestionSchema = z.object({
    situation: z.string().describe('A short, real-life situation or question that a person might encounter, presented in English.'),
    options: z.array(z.string()).length(4).describe('A list of four possible responses in the target language.'),
    correctAnswer: z.string().describe('The correct response from the options list, appropriate for the situation.'),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

// Generate Vocabulary Flow
export const GenerateVocabularyInputSchema = z.object({
  situation: z.string().describe("A real-world situation (e.g., 'ordering coffee in Paris')."),
  targetLanguage: z.string().describe("The target language for vocabulary generation (e.g., 'French')."),
  numResults: z.number().default(5).describe('The number of vocabulary words/phrases to generate.'),
});
export type GenerateVocabularyInput = z.infer<typeof GenerateVocabularyInputSchema>;

export const GenerateVocabularyOutputSchema = z.object({
  vocabulary: z.array(VocabularyItemSchema)
    .describe('A list of vocabulary words/phrases, their translations, and example sentences.'),
});
export type GenerateVocabularyOutput = z.infer<typeof GenerateVocabularyOutputSchema>;


// Regenerate Vocabulary Flow
export const RegenerateVocabularyInputSchema = z.object({
  context: z.string().describe('The context or situation for which to generate vocabulary.'),
  language: z.string().describe('The target language for the vocabulary.'),
  previousVocabulary: z.array(z.string()).optional().describe('The previous list of vocabulary words, if any.')
});
export type RegenerateVocabularyInput = z.infer<typeof RegenerateVocabularyInputSchema>;

export const RegenerateVocabularyOutputSchema = z.object({
  vocabulary: z.array(VocabularyItemSchema)
    .describe('A list of new vocabulary words/phrases, their translations, and example sentences, not including the previous ones.'),
});
export type RegenerateVocabularyOutput = z.infer<typeof RegenerateVocabularyOutputSchema>;


// Generate Quiz Flow
export const GenerateQuizInputSchema = z.object({
  vocabulary: z.array(VocabularyItemSchema).describe('The list of vocabulary items to create a quiz from.'),
  numQuestions: z.number().default(6).describe('The number of questions to generate.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

export const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;

// Generate Title Flow
export const GenerateTitleInputSchema = z.object({
  situation: z.string().describe("The real-world situation."),
  language: z.string().describe("The target language."),
});
export type GenerateTitleInput = z.infer<typeof GenerateTitleInputSchema>;

export const GenerateTitleOutputSchema = z.object({
    title: z.string().describe('A creative title for the learning session.'),
});
export type GenerateTitleOutput = z.infer<typeof GenerateTitleOutputSchema>;
