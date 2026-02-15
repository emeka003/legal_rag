'use client';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import DashboardLayout from '@/components/DashboardLayout';
import type { ToolResult } from '@/lib/tools';

export default function ComplianceChecker() {
    const [text, setText] = useState('');
    const [jurisdiction, setJurisdiction] = useState('');
    const [framework, setFramework] = useState('');
    const [result, setResult] = useState<ToolResult | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || loading) return;

        setLoading(true);
        try {
            const res = await fetch('/api/tools/compliance-checker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, jurisdiction, framework }),
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
                <h1>Compliance Checker</h1>
                <p>Ensure text adheres to legal and regulatory standards.</p>
            </div>

            <div className="page-body">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <form onSubmit={handleSubmit} className="glass-card p-6 flex flex-col gap-4">
                        <div className="form-group">
                            <label className="form-label">Jurisdiction (Optional)</label>
                            <input
                                className="input"
                                value={jurisdiction}
                                onChange={(e) => setJurisdiction(e.target.value)}
                                placeholder="e.g., California, EU, Federal"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Framework (Optional)</label>
                            <input
                                className="input"
                                value={framework}
                                onChange={(e) => setFramework(e.target.value)}
                                placeholder="e.g., GDPR, CCPA, HIPAA"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Text to Check</label>
                            <textarea
                                className="input"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Paste policy, contract, or procedure text here..."
                                style={{ height: 200 }}
                            />
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={loading || !text.trim()}>
                            {loading ? <span className="spinner"></span> : 'Check Compliance'}
                        </button>
                    </form>

                    <div className="glass-card p-6 bg-gray-900/50 min-h-[400px]">
                        <h2 className="text-lg font-semibold mb-4">Compliance Report</h2>
                        {result ? (
                            <div className="tool-result-content">
                                <ReactMarkdown>{result.result}</ReactMarkdown>

                                {result.citations?.length > 0 && (
                                    <div className="mt-6 pt-4 border-t border-gray-700">
                                        <h3 className="text-sm font-semibold uppercase text-gray-400 mb-2">Relevant Sources</h3>
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
                                Report will appear here...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
