import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/token';
import { embedText, chatWithContext } from '@/lib/gemini';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { conversationId, message } = await request.json();

        if (!message?.trim()) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Get or create conversation
        let convId = conversationId;
        if (!convId) {
            const { data: conv, error } = await supabase
                .from('conversations')
                .insert({
                    user_id: auth.userId,
                    title: message.substring(0, 100),
                })
                .select('id')
                .single();

            if (error || !conv) {
                return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
            }
            convId = conv.id;
        }

        // Save user message
        await supabase.from('messages').insert({
            id: uuidv4(),
            conversation_id: convId,
            role: 'user',
            content: message,
        });

        // Embed the question and search for relevant chunks
        const embedding = await embedText(message);

        const { data: chunks } = await supabase.rpc('match_chunks', {
            query_embedding: JSON.stringify(embedding),
            match_count: 5,
            filter_user_id: auth.userId,
        });

        // Get document names for citations
        let citations: { documentName: string; chunkContent: string; similarity: number; chunkIndex: number }[] = [];
        let context = '';

        if (chunks?.length) {
            const docIds = [...new Set(chunks.map((c: { document_id: string }) => c.document_id))];
            const { data: docs } = await supabase
                .from('documents')
                .select('id, filename')
                .in('id', docIds);

            const docMap = new Map(docs?.map((d: { id: string; filename: string }) => [d.id, d.filename]) || []);

            citations = chunks.map((chunk: { document_id: string; content: string; similarity: number; chunk_index: number }) => ({
                documentName: docMap.get(chunk.document_id) || 'Unknown',
                chunkContent: chunk.content.substring(0, 300),
                similarity: chunk.similarity,
                chunkIndex: chunk.chunk_index,
            }));

            context = chunks
                .map(
                    (chunk: { content: string; chunk_index: number; document_id: string }, i: number) =>
                        `[Chunk ${i + 1} | Source: ${docMap.get(chunk.document_id) || 'Unknown'}, Section ${chunk.chunk_index}]\n${chunk.content}`
                )
                .join('\n\n---\n\n');
        }

        // Get chat history
        const { data: history } = await supabase
            .from('messages')
            .select('role, content')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: true })
            .limit(20);

        const chatHistory = (history || []).slice(0, -1); // Exclude the message we just saved

        // Generate response
        const answer = await chatWithContext(message, context, chatHistory);

        // Save assistant message
        await supabase.from('messages').insert({
            id: uuidv4(),
            conversation_id: convId,
            role: 'assistant',
            content: answer,
            citations: JSON.stringify(citations),
        });

        // Update conversation timestamp
        await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', convId);

        return NextResponse.json({
            conversationId: convId,
            answer,
            citations,
        });
    } catch (err) {
        console.error('Chat error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
