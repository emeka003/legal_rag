import Link from "next/link";
import "./globals.css";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
      <div className="text-center max-w-2xl px-6">
        <div className="text-6xl mb-6">⚖️</div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Legal RAG AI
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          AI-powered legal document analysis and chat assistant
        </p>
        
        <div className="space-y-4">
          <p className="text-gray-400 mb-8">
            Upload legal documents, contracts, and case files. Get instant AI analysis, 
            risk assessments, and answers to your legal questions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup" 
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              Get Started
            </Link>
            <Link 
              href="/login" 
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl mb-2">📄</div>
            <h3 className="font-semibold text-white mb-1">Document Analysis</h3>
            <p className="text-sm text-gray-400">Upload and analyze legal documents with AI</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl mb-2">💬</div>
            <h3 className="font-semibold text-white mb-1">AI Chat</h3>
            <p className="text-sm text-gray-400">Ask questions about your documents</p>
          </div>
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="text-2xl mb-2">⚖️</div>
            <h3 className="font-semibold text-white mb-1">Legal Tools</h3>
            <p className="text-sm text-gray-400">Clause analysis, compliance checks & more</p>
          </div>
        </div>
      </div>
    </div>
  );
}
