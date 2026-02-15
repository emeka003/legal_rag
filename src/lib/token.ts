import { NextRequest } from 'next/server';

const AUTH_SECRET = process.env.AUTH_SECRET;
if (!AUTH_SECRET) {
    throw new Error('AUTH_SECRET environment variable is required');
}
const COOKIE_NAME = 'legal-rag-session';

async function getKey() {
    const enc = new TextEncoder();
    return crypto.subtle.importKey(
        'raw',
        enc.encode(AUTH_SECRET),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    );
}

export async function createToken(userId: string): Promise<string> {
    const payload = JSON.stringify({ userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
    const encoded = Buffer.from(payload).toString('base64url');

    const key = await getKey();
    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        new TextEncoder().encode(encoded)
    );

    const sigBase64 = Buffer.from(signature).toString('base64url');
    return `${encoded}.${sigBase64}`;
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
    try {
        const [encoded, sigBase64] = token.split('.');
        if (!encoded || !sigBase64) return null;

        const key = await getKey();
        const signature = Buffer.from(sigBase64, 'base64url');

        const valid = await crypto.subtle.verify(
            'HMAC',
            key,
            signature,
            new TextEncoder().encode(encoded)
        );

        if (!valid) return null;

        const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString());
        if (payload.exp < Date.now()) return null;

        return { userId: payload.userId };
    } catch {
        return null;
    }
}

export async function getAuthUser(request: NextRequest): Promise<{ userId: string } | null> {
    const cookie = request.cookies.get(COOKIE_NAME);
    if (!cookie?.value) return null;
    return verifyToken(cookie.value);
}

export async function createSessionCookie(userId: string): Promise<string> {
    const token = await createToken(userId);
    return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
}

export function clearSessionCookie(): string {
    return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export { COOKIE_NAME };
