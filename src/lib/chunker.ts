export function chunkText(text: string, maxChunkSize: number = 1500, overlap: number = 200): string[] {
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const paragraphs = cleanText.split(/\n\n+/);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const paragraph of paragraphs) {
        const trimmed = paragraph.trim();
        if (!trimmed) continue;

        if (currentChunk.length + trimmed.length + 2 > maxChunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());

            // Keep overlap from end of previous chunk
            if (overlap > 0) {
                const words = currentChunk.split(/\s+/);
                const overlapWords: string[] = [];
                let overlapLen = 0;
                for (let i = words.length - 1; i >= 0 && overlapLen < overlap; i--) {
                    overlapWords.unshift(words[i]);
                    overlapLen += words[i].length + 1;
                }
                currentChunk = overlapWords.join(' ') + '\n\n' + trimmed;
            } else {
                currentChunk = trimmed;
            }
        } else {
            currentChunk = currentChunk ? currentChunk + '\n\n' + trimmed : trimmed;
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    // Handle case where a single paragraph is too long
    const finalChunks: string[] = [];
    for (const chunk of chunks) {
        if (chunk.length > maxChunkSize * 1.5) {
            const sentences = chunk.split(/(?<=[.!?])\s+/);
            let subChunk = '';
            for (const sentence of sentences) {
                if (subChunk.length + sentence.length + 1 > maxChunkSize && subChunk.length > 0) {
                    finalChunks.push(subChunk.trim());
                    subChunk = sentence;
                } else {
                    subChunk = subChunk ? subChunk + ' ' + sentence : sentence;
                }
            }
            if (subChunk.trim()) {
                finalChunks.push(subChunk.trim());
            }
        } else {
            finalChunks.push(chunk);
        }
    }

    return finalChunks.filter((c) => c.length > 20);
}
