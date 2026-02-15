'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import DashboardLayout from '@/components/DashboardLayout';
import type { ToolResult } from '@/lib/tools';

export default function PrecedentFinder() {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<ToolResult | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || loading) return;

        setLoading(true);
        try {
            const res = await fetch('/api/tools/precedent-finder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });
            const data = await res.json();
            setResult(data);
        } catch {
            alert('Search failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="page-header">
                <h1>Precedent Finder</h1>
                <p>Find relevant case law and patterns in your legal documents.</p>
            </div>

            <div className="page-body">
                <form onSubmit={handleSubmit} className="glass-card p-6 mb-8 flex gap-4">
                    <input
                        className="input flex-1"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for legal concepts, case names, or fact patterns..."
                    />
                    <button type="submit" className="btn btn-primary" disabled={loading || !query.trim()}>
                        {loading ? <span className="spinner"></span> : 'Find Precedents'}
                    </button>
                </form>

                {result && (
                    <div className="glass-card p-6 bg-gray-900/50 min-h-[400px]">
                        <h2 className="text-lg font-semibold mb-4">Search Results</h2>
                        <div className="tool-result-content">
                            <ReactMarkdown>{result.result}</ReactMarkdown>

                            {result.citations?.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-gray-700">
                                    <h3 className="text-sm font-semibold uppercase text-gray-400 mb-4">Source References</h3>
                                    <div className="space-y-4">
                                        {result.citations.map((c, i) => (
                                            <div key={i} className="citation-card opacity-80 hover:opacity-100">
                                                <div className="citation-card-header">
                                                    <span className="citation-card-source">{c.documentName}</span>
                                                    <span className="citation-card-score">{Math.round(c.similarity * 100)}% Match</span>
                                                </div>
                                                <div className="citation-card-text line-clamp-2">
                                                    {c.chunkContent}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
