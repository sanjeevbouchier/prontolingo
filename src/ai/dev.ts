'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/regenerate-vocabulary.ts';
import '@/ai/flows/generate-vocabulary.ts';
import '@/ai/flows/generate-quiz.ts';
