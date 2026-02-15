import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/token';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { id } = await params;

        // Verify ownership
        const { data: doc } = await supabase
            .from('documents')
            .select('id')
            .eq('id', id)
            .eq('user_id', auth.userId)
            .single();

        if (!doc) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Cascading delete will remove chunks too
        const { error } = await supabase.from('documents').delete().eq('id', id);

        if (error) {
            return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
