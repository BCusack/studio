import {z} from 'genkit';

export const HomepageContentOutputSchema = z.object({
  title: z.string().describe('The main title for the homepage.'),
  sections: z.array(z.object({
    title: z.string().describe('The title of the section.'),
    content: z.string().describe('The content of the section.'),
    icon: z.enum(["FileText", "Zap", "Shield", "Globe"]).describe('A relevant icon name from the specified lucide-react icons.'),
  })).describe('An array of sections for the homepage.'),
});
export type HomepageContentOutput = z.infer<typeof HomepageContentOutputSchema>;

export const HomepageContentInputSchema = z.object({
  whitepaperContent: z.string().describe('The full content of the whitepaper.'),
});
export type HomepageContentInput = z.infer<typeof HomepageContentInputSchema>;
