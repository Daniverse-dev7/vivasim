import { z } from 'zod';
export const providerIds = ['groq','gemini','cerebras','openrouter','huggingface'] as const;
export const messageSchema = z.object({role:z.enum(['user','assistant']),content:z.string().min(1).max(12000),provider:z.string().max(300).optional()}).strict();
export const conversationSchema = z.array(messageSchema).max(80).refine(messages => messages.reduce((n,m)=>n+m.content.length,0)<=100000,'Conversation is too long. Export it before starting a new chat.');
export type Message = z.infer<typeof messageSchema>;
