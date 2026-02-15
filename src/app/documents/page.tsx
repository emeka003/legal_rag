'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

interface Document {
    id: string;
    filename: string;
    status: 'processing' | 'ready' | 'error';
    error_message?: string;
    created_at: string;
}

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);

    const fetchDocuments = async () => {
        const res = await fetch('/api/documents');
        const data = await res.json();
        setDocuments(data.documents || []);
    };

    useEffect(() => {
        const loadDocuments = async () => {
            await fetchDocuments();
        };
        loadDocuments();
    }, []);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setUploading(true);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append('file', file);

            try {
                await fetch('/api/documents/upload', {
                    method: 'POST',
                    body: formData,
                });
            } catch (err) {
                console.error('Upload failed', err);
            }
        }

        await fetchDocuments();
        setUploading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Permanently delete this document and its chunks?')) return;
        await fetch(`/api/documents/${id}`, { method: 'DELETE' });
        fetchDocuments();
    };

    return (
        <DashboardLayout>
            <div className="page-header">
                <h1>Documents</h1>
                <p>Manage legal files (PDF, TXT, MD) used for knowledge retrieval.</p>
            </div>

            <div className="page-body">
                <div
                    className={`upload-zone ${dragActive ? 'dragover' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={(e) => {
                        handleDrag(e);
                        handleUpload(e.dataTransfer.files);
                    }}
                    onClick={() => document.getElementById('file-input')?.click()}
                >
                    <div className="upload-zone-icon">📄</div>
                    <h3>Click or Drag files to upload</h3>
                    <p>Supports PDF, Markdown, and TXT files</p>
                    <input
                        id="file-input"
                        type="file"
                        multiple
                        accept=".pdf,.txt,.md,.markdown"
                        style={{ display: 'none' }}
                        onChange={(e) => handleUpload(e.target.files)}
                    />
                    {uploading && <div className="mt-4"><span className="spinner"></span> Processing...</div>}
                </div>

                <div className="documents-grid">
                    {documents.map((doc) => (
                        <div key={doc.id} className="glass-card document-card">
                            <div className="document-card-header">
                                <div className="flex items-center">
                                    <span className="document-card-icon">
                                        {doc.filename.endsWith('.pdf') ? '📕' : doc.filename.endsWith('.md') ? '📝' : '📄'}
                                    </span>
                                    <span className="document-card-name">{doc.filename}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(doc.id)}
                                    className="text-gray-500 hover:text-red-500"
                                    title="Delete"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="document-card-meta justify-between">
                                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                <span className={`badge badge-${doc.status === 'ready' ? 'success' : doc.status === 'error' ? 'danger' : 'warning'}`}>
                                    {doc.status}
                                </span>
                            </div>
                            {doc.error_message && (
                                <div className="text-xs text-red-400 mt-2">{doc.error_message}</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
