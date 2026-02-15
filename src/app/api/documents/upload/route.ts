import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/token';
import { chunkText } from '@/lib/chunker';
import { embedText } from '@/lib/gemini';
import pdfParse from 'pdf-parse';
import { marked } from 'marked';

async function extractText(buffer: Buffer, filename: string): Promise<string> {
    const ext = filename.split('.').pop()?.toLowerCase();

    switch (ext) {
        case 'pdf': {
            const data = await pdfParse(buffer);
            return data.text;
        }
        case 'md':
        case 'markdown': {
            const mdText = buffer.toString('utf-8');
            // Convert markdown to HTML then strip tags to get plain text
            const html = await marked(mdText);
            return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        }
        case 'txt':
        default:
            return buffer.toString('utf-8');
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const allowedTypes = ['pdf', 'txt', 'md', 'markdown'];
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        if (!allowedTypes.includes(ext)) {
            return NextResponse.json(
                { error: 'Unsupported file type. Allowed: PDF, TXT, MD' },
                { status: 400 }
            );
        }

        // Create document record
        const { data: doc, error: docError } = await supabase
            .from('documents')
            .insert({
                user_id: auth.userId,
                filename: file.name,
                file_type: ext,
                status: 'processing',
            })
            .select('id')
            .single();

        if (docError || !doc) {
            return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 });
        }

        // Process asynchronously (but within same request)
        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const text = await extractText(buffer, file.name);

            if (!text.trim()) {
                await supabase
                    .from('documents')
                    .update({ status: 'error', error_message: 'No text content found in file' })
                    .eq('id', doc.id);
                return NextResponse.json({ document: { id: doc.id, status: 'error' } });
            }

            const chunks = chunkText(text);

            // Embed and store chunks in batches
            const batchSize = 5;
            for (let i = 0; i < chunks.length; i += batchSize) {
                const batch = chunks.slice(i, i + batchSize);
                const embeddings = await Promise.all(batch.map((chunk) => embedText(chunk)));

                const records = batch.map((content, j) => ({
                    document_id: doc.id,
                    content,
                    chunk_index: i + j,
                    embedding: JSON.stringify(embeddings[j]),
                }));

                const { error: chunkError } = await supabase.from('chunks').insert(records);
                if (chunkError) {
                    throw new Error(`Failed to insert chunks: ${chunkError.message}`);
                }
            }

            await supabase.from('documents').update({ status: 'ready' }).eq('id', doc.id);

            return NextResponse.json({
                document: { id: doc.id, status: 'ready', chunks: chunks.length },
            });
        } catch (processError) {
            const msg = processError instanceof Error ? processError.message : 'Processing failed';
            await supabase
                .from('documents')
                .update({ status: 'error', error_message: msg })
                .eq('id', doc.id);
            return NextResponse.json({ document: { id: doc.id, status: 'error', error: msg } });
        }
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
