import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';
import { createSessionCookie } from '@/lib/token';
import { signupSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
        const rateLimitResult = rateLimit(`signup:${ip}`, 3, 3600000);
        if (!rateLimitResult.success) {
            return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
        }

        const body = await request.json();
        
        // Validate input
        const result = signupSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: 'Invalid input', details: result.error.flatten() }, { status: 400 });
        }

        const { email, password } = result.data;

        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existing) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        const passwordHash = await hashPassword(password);

        const { data: user, error } = await supabase
            .from('users')
            .insert({ email: email.toLowerCase(), password_hash: passwordHash })
            .select('id, email')
            .single();

        if (error) {
            return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
        }

        const response = NextResponse.json({ user: { id: user.id, email: user.email } });
        response.headers.set('Set-Cookie', await createSessionCookie(user.id));
        return response;
    } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
