import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/token';
import { runNegotiationCoach } from '@/lib/tools';

export async function POST(request: NextRequest) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { clauseText, position } = await request.json();

        if (!clauseText?.trim()) {
            return NextResponse.json({ error: 'Clause text is required' }, { status: 400 });
        }

        const validPositions = ['buyer', 'seller', 'neutral'];
        const pos = validPositions.includes(position) ? position : 'neutral';

        const result = await runNegotiationCoach(clauseText, pos, auth.userId);
        return NextResponse.json(result);
    } catch (err) {
        console.error('Negotiation coach error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
