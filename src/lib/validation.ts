import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const chatSchema = z.object({
    conversationId: z.string().uuid().optional(),
    message: z.string().min(1, 'Message is required').max(10000, 'Message too long'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ChatInput = z.infer<typeof chatSchema>;
