'use client';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

export default function ToolsPage() {
    const tools = [
        {
            title: 'Clause Analyzer',
            desc: 'Review contract terms for risks, ambiguity, and one-sided language.',
            icon: '🔍',
            href: '/tools/clause-analyzer',
            color: 'text-blue-400',
        },
        {
            title: 'Compliance Checker',
            desc: 'Verify text against GDPR, HIPAA, or custom compliance frameworks.',
            icon: '✅',
            href: '/tools/compliance-checker',
            color: 'text-green-400',
        },
        {
            title: 'Precedent Finder',
            desc: 'Search uploaded documents for relevant legal precedents and patterns.',
            icon: '⚖️',
            href: '/tools/precedent-finder',
            color: 'text-purple-400',
        },
        {
            title: 'Negotiation Coach',
            desc: 'Get strategic advice, counter-arguments, and alternative phrasing.',
            icon: '🤝',
            href: '/tools/negotiation-coach',
            color: 'text-orange-400',
        },
    ];

    return (
        <DashboardLayout>
            <div className="page-header">
                <h1>AI Legal Tools</h1>
                <p>Specialized AI assistants for common legal tasks.</p>
            </div>

            <div className="page-body">
                <div className="tools-grid">
                    {tools.map((tool) => (
                        <Link key={tool.href} href={tool.href} style={{ textDecoration: 'none' }}>
                            <div className="glass-card tool-card h-full">
                                <div className={`tool-card-icon ${tool.color}`}>{tool.icon}</div>
                                <h3>{tool.title}</h3>
                                <p>{tool.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
