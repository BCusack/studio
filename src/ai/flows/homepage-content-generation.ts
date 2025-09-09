'use server';
// runtime guard: ensure a GenAI API key is present in server environment
if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
  throw new Error('Missing API key: set GEMINI_API_KEY or GOOGLE_API_KEY in your environment');
}
/**
 * @fileOverview A flow for generating homepage content from a whitepaper.
 *
 * - generateHomepageContent - Generates structured content for the homepage.
 * - HomepageContentInput - The input type for the generateHomepageContent function.
 * - HomepageContentOutput - The return type for the generateHomepageContent function.
 */

import { ai } from '@/ai/genkit';
import { HomepageContentInputSchema, HomepageContentOutputSchema, HomepageContentInput, HomepageContentOutput as HomepageContentOutput } from '../schemas/homepage-content-schema';
export type { HomepageContentInput, HomepageContentOutput };


export async function generateHomepageContent(input: HomepageContentInput): Promise<HomepageContentOutput> {
  return generateHomepageContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateHomepageContentPrompt',
  input: { schema: HomepageContentInputSchema },
  output: { schema: HomepageContentOutputSchema },
  prompt: `You are a web content strategist. Your task is to generate compelling homepage content based on the provided whitepaper.

The homepage should have a main title and a few sections that highlight the key features or concepts from the whitepaper. Each section needs a short, engaging title, a brief paragraph of content, and a relevant icon from the lucide-react library.

Available icons: FileText, Zap, Shield, Globe. Choose the most appropriate icon for each section.

Whitepaper Content:
{{{whitepaperContent}}}

Generate the homepage content based on this whitepaper. Ensure the output is a JSON object matching the specified schema.
`,
});

const generateHomepageContentFlow = ai.defineFlow(
  {
    name: 'generateHomepageContentFlow',
    inputSchema: HomepageContentInputSchema,
    outputSchema: HomepageContentOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
