import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/token';
import { runClauseAnalyzer } from '@/lib/tools';

export async function POST(request: NextRequest) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { text } = await request.json();

        if (!text?.trim()) {
            return NextResponse.json({ error: 'Clause text is required' }, { status: 400 });
        }

        const result = await runClauseAnalyzer(text, auth.userId);
        return NextResponse.json(result);
    } catch (err) {
        console.error('Clause analyzer error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
