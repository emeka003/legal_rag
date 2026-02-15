import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/token';

export async function GET(request: NextRequest) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, created_at')
            .eq('id', auth.userId)
            .single();

        if (error || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
