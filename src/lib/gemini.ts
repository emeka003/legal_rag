import { GoogleGenerativeAI } from '@google/generative-ai';

function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is required');
    }
    return new GoogleGenerativeAI(apiKey);
}

async function withRetry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return withRetry(fn, retries - 1, delay * 2);
    }
}

export async function embedText(text: string): Promise<number[]> {
    return withRetry(async () => {
        const model = getGeminiClient().getGenerativeModel({ model: 'text-embedding-004' });
        const result = await model.embedContent(text);
        return result.embedding.values;
    });
}

export async function chatWithContext(
    question: string,
    context: string,
    history: { role: string; content: string }[],
    systemPrompt?: string
): Promise<string> {
    const model = getGeminiClient().getGenerativeModel({ model: 'gemini-2.0-flash' });

    const defaultSystemPrompt = `You are an expert legal AI assistant. You answer questions about legal documents using ONLY the provided context. 

CRITICAL RULES:
1. Base your answers ONLY on the provided context chunks. Do not make up information.
2. When referencing information, cite the source using [Source: chunk_index] format.
3. If the context doesn't contain enough information to answer, say so clearly.
4. Use precise legal terminology when appropriate.
5. Structure your responses with clear headings and bullet points when helpful.
6. Always highlight potential risks, caveats, or areas requiring professional legal review.

DISCLAIMER: Always remind users that AI-generated legal analysis is not a substitute for professional legal advice.`;

    const formattedHistory = history.map((msg) => ({
        role: msg.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
        history: [
            {
                role: 'user',
                parts: [{ text: 'System instruction: ' + (systemPrompt || defaultSystemPrompt) }],
            },
            {
                role: 'model',
                parts: [{ text: 'Understood. I will follow these instructions carefully.' }],
            },
            ...formattedHistory,
        ],
    });

    const prompt = context
        ? `Context from legal documents:\n\n${context}\n\n---\n\nUser question: ${question}`
        : question;

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    return response.text();
}

export async function generateWithPrompt(
    systemPrompt: string,
    userInput: string,
    context: string
): Promise<string> {
    const model = getGeminiClient().getGenerativeModel({ model: 'gemini-2.0-flash' });

    const chat = model.startChat({
        history: [
            {
                role: 'user',
                parts: [{ text: 'System instruction: ' + systemPrompt }],
            },
            {
                role: 'model',
                parts: [{ text: 'Understood. I will follow these instructions carefully.' }],
            },
        ],
    });

    const prompt = context
        ? `Relevant legal document context:\n\n${context}\n\n---\n\nUser input: ${userInput}`
        : `User input: ${userInput}`;

    const result = await chat.sendMessage(prompt);
    return result.response.text();
}
