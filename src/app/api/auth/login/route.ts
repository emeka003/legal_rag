import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPassword } from '@/lib/auth';
import { createSessionCookie } from '@/lib/token';
import { loginSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const rateLimitResult = rateLimit(`login:${ip}`, 5, 60000);
        if (!rateLimitResult.success) {
            return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
        }

        const body = await request.json();
        
        // Validate input
        const result = loginSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
        }

        const { email, password } = result.data;

        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, password_hash')
            .eq('email', email.toLowerCase())
            .single();

        if (error || !user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const response = NextResponse.json({ user: { id: user.id, email: user.email } });
        response.headers.set('Set-Cookie', await createSessionCookie(user.id));
        return response;
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
