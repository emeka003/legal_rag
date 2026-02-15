import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/token';

export async function GET(request: NextRequest) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { data: documents, error } = await supabase
            .from('documents')
            .select('id, filename, file_type, status, error_message, created_at')
            .eq('user_id', auth.userId)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
        }

        return NextResponse.json({ documents: documents || [] });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
