'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import DashboardLayout from '@/components/DashboardLayout';
import type { ToolResult } from '@/lib/tools';

export default function NegotiationCoach() {
    const [clauseText, setClauseText] = useState('');
    const [position, setPosition] = useState('neutral');
    const [result, setResult] = useState<ToolResult | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clauseText.trim() || loading) return;

        setLoading(true);
        try {
            const res = await fetch('/api/tools/negotiation-coach', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clauseText, position }),
            });
            const data = await res.json();
            setResult(data);
        } catch {
            alert('Analysis failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="page-header">
                <h1>Negotiation Coach</h1>
                <p>Get strategic guidance, counter-arguments, and alternative phrasing.</p>
            </div>

            <div className="page-body">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <form onSubmit={handleSubmit} className="glass-card p-6 flex flex-col gap-4">
                        <div className="form-group">
                            <label className="form-label">Your Position</label>
                            <select
                                className="input"
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                            >
                                <option value="neutral">Neutral / Balanced</option>
                                <option value="buyer">Representing Buyer / Licensee</option>
                                <option value="seller">Representing Seller / Licensor</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Clause to Negotiate</label>
                            <textarea
                                className="input"
                                value={clauseText}
                                onChange={(e) => setClauseText(e.target.value)}
                                placeholder="Paste the contract clause here..."
                                style={{ height: 250 }}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading || !clauseText.trim()}>
                            {loading ? <span className="spinner"></span> : 'Get Strategy'}
                        </button>
                    </form>

                    <div className="glass-card p-6 bg-gray-900/50 min-h-[400px]">
                        <h2 className="text-lg font-semibold mb-4">Negotiation Strategy</h2>
                        {result ? (
                            <div className="tool-result-content">
                                <ReactMarkdown>{result.result}</ReactMarkdown>

                                {result.citations?.length > 0 && (
                                    <div className="mt-6 pt-4 border-t border-gray-700">
                                        <h3 className="text-sm font-semibold uppercase text-gray-400 mb-2">Supporting Docs</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {result.citations.map((c, i) => (
                                                <span key={i} className="citation-tag" title={c.chunkContent}>
                                                    {c.documentName}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-gray-500 text-center mt-20">
                                Strategy will appear here...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
