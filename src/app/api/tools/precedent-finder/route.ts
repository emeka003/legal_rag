import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/token';
import { runPrecedentFinder } from '@/lib/tools';

export async function POST(request: NextRequest) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { query } = await request.json();

        if (!query?.trim()) {
            return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
        }

        const result = await runPrecedentFinder(query, auth.userId);
        return NextResponse.json(result);
    } catch (err) {
        console.error('Precedent finder error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
