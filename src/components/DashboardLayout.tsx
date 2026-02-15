'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ email: string } | null>(null);

    useEffect(() => {
        fetch('/api/auth/me')
            .then((res) => {
                if (res.ok) return res.json();
                throw new Error('Not authenticated');
            })
            .then((data) => setUser(data.user))
            .catch(() => router.push('/login'));
    }, [router]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    if (!user) return null;

    const navItems = [
        { href: '/chat', label: 'AI Chat', icon: '💬' },
        { href: '/documents', label: 'Documents', icon: '📄' },
        { href: '/tools', label: 'Legal Tools', icon: '⚖️' },
    ];

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Link href="/chat" className="sidebar-logo">
                        <div className="sidebar-logo-icon">⚖️</div>
                        <span className="sidebar-logo-text">Legal RAG</span>
                    </Link>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-link ${pathname.startsWith(item.href) ? 'active' : ''}`}
                        >
                            <span className="sidebar-link-icon">{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-link" style={{ marginBottom: 8, cursor: 'default' }}>
                        <span className="sidebar-link-icon">👤</span>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {user.email}
                        </div>
                    </div>
                    <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
                        <span className="sidebar-link-icon">🚪</span>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
