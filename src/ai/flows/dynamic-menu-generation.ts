'use server';

/**
 * @fileOverview Dynamically generates a navigation menu by selecting relevant Markdown files using an LLM.
 *
 * - generateDynamicMenu - A function that generates the dynamic menu.
 * - GenerateDynamicMenuInput - The input type for the generateDynamicMenu function.
 * - GenerateDynamicMenuOutput - The return type for the generateDynamicMenu function.
 */

import {ai} from '@/ai/genkit';
import { GenerateDynamicMenuInputSchema, GenerateDynamicMenuOutputSchema, GenerateDynamicMenuInput, GenerateDynamicMenuOutput as GenerateDynamicMenuOutput } from '../schemas/dynamic-menu-schema';
export type {GenerateDynamicMenuInput, GenerateDynamicMenuOutput};


export async function generateDynamicMenu(input: GenerateDynamicMenuInput): Promise<GenerateDynamicMenuOutput> {
  return generateDynamicMenuFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dynamicMenuPrompt',
  input: {schema: GenerateDynamicMenuInputSchema},
  output: {schema: GenerateDynamicMenuOutputSchema},
  prompt: `You are an expert documentation curator. Given a list of Markdown file names and a user query, select the most relevant files for a navigation menu.

File Names: {{fileNames}}
User Query: {{userQuery}}

Select only the files that are highly relevant to the user query. Return the selected file names in a JSON array.

{{#if fileNames.length}}
  Given the file names, return only the most relevant file names related to: {{{userQuery}}}. Here are the available files: {{fileNames}}
{{else}}
  No files available, return empty array.
{{/if}}

Ensure that the output is a JSON array of strings.
`,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generateDynamicMenuFlow = ai.defineFlow(
  {
    name: 'generateDynamicMenuFlow',
    inputSchema: GenerateDynamicMenuInputSchema,
    outputSchema: GenerateDynamicMenuOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
