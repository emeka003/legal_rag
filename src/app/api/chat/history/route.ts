import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/token';

export async function GET(request: NextRequest) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { data: conversations, error } = await supabase
            .from('conversations')
            .select('id, title, created_at, updated_at')
            .eq('user_id', auth.userId)
            .order('updated_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
        }

        return NextResponse.json({ conversations: conversations || [] });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
