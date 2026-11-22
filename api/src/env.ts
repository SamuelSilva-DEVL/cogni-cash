import z from 'zod';

export const envSchema = z.object({
    DATABASE_URL: z.url(),
    PORT: z.coerce.number().default(3333),
    JWT_PRIVATE_KEY: z.string(),
    JWT_PUBLIC_KEY: z.string(),
    AI_API_KEY: z.string().optional(),
    AI_BASE_URL: z.string().default("https://api.openai.com/v1"),
    AI_MODEL: z.string().default("gpt-4o-mini"),
})

export type Env = z.infer<typeof envSchema>