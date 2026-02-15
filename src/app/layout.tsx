import './globals.css';

export const metadata = {
  title: 'AI Legal RAG',
  description: 'AI-powered legal document analysis and chat',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
