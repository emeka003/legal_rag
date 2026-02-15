import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/token';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { conversationId } = await params;

        // Verify ownership
        const { data: conv } = await supabase
            .from('conversations')
            .select('id, title')
            .eq('id', conversationId)
            .eq('user_id', auth.userId)
            .single();

        if (!conv) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        const { data: messages, error } = await supabase
            .from('messages')
            .select('id, role, content, citations, created_at')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
        }

        return NextResponse.json({
            conversation: conv,
            messages: messages || [],
        });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { conversationId } = await params;

        const { error } = await supabase
            .from('conversations')
            .delete()
            .eq('id', conversationId)
            .eq('user_id', auth.userId);

        if (error) {
            return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
