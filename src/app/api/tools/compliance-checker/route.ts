import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/token';
import { runComplianceChecker } from '@/lib/tools';

export async function POST(request: NextRequest) {
    try {
        const auth = await getAuthUser(request);
        if (!auth) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const { text, jurisdiction, framework } = await request.json();

        if (!text?.trim()) {
            return NextResponse.json({ error: 'Text to check is required' }, { status: 400 });
        }

        const result = await runComplianceChecker(text, auth.userId, jurisdiction, framework);
        return NextResponse.json(result);
    } catch (err) {
        console.error('Compliance checker error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
