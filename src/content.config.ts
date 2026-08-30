import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    titre: z.string(),
    role: z.string(),
    impact: z.string(),
    tags: z.array(z.string()),
    description: z.string(),
    badge: z.string(),
    url: z.string().optional(),
    ordre: z.number(),
  }),
});

export const collections = { projects };
