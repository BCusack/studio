import {z} from 'genkit';

export const GenerateDynamicMenuInputSchema = z.object({
  fileNames: z.array(z.string()).describe('A list of Markdown file names to consider for the menu.'),
  userQuery: z.string().describe('The user query or context to determine relevant files.'),
});
export type GenerateDynamicMenuInput = z.infer<typeof GenerateDynamicMenuInputSchema>;

export const GenerateDynamicMenuOutputSchema = z.object({
  selectedFiles: z.array(z.string()).describe('A list of Markdown file names selected for the menu.'),
});
export type GenerateDynamicMenuOutput = z.infer<typeof GenerateDynamicMenuOutputSchema>;
