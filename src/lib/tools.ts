import { embedText, generateWithPrompt } from './gemini';
import { supabase } from './supabase';

export interface ToolResult {
    result: string;
    citations: {
        documentName: string;
        chunkContent: string;
        similarity: number;
        chunkIndex: number;
    }[];
}

async function getRAGContext(
    input: string,
    userId: string,
    matchCount: number = 5
): Promise<{ context: string; citations: ToolResult['citations'] }> {
    const embedding = await embedText(input);

    const { data: chunks, error } = await supabase.rpc('match_chunks', {
        query_embedding: JSON.stringify(embedding),
        match_count: matchCount,
        filter_user_id: userId,
    });

    if (error || !chunks?.length) {
        return { context: '', citations: [] };
    }

    const docIds = [...new Set(chunks.map((c: { document_id: string }) => c.document_id))];
    const { data: docs } = await supabase
        .from('documents')
        .select('id, filename')
        .in('id', docIds);

    const docMap = new Map(docs?.map((d: { id: string; filename: string }) => [d.id, d.filename]) || []);

    const citations = chunks.map((chunk: { document_id: string; content: string; similarity: number; chunk_index: number }) => ({
        documentName: docMap.get(chunk.document_id) || 'Unknown',
        chunkContent: chunk.content.substring(0, 300),
        similarity: chunk.similarity,
        chunkIndex: chunk.chunk_index,
    }));

    const context = chunks
        .map(
            (chunk: { content: string; chunk_index: number; document_id: string }, i: number) =>
                `[Chunk ${i + 1} | Source: ${docMap.get(chunk.document_id) || 'Unknown'}, Section ${chunk.chunk_index}]\n${chunk.content}`
        )
        .join('\n\n---\n\n');

    return { context, citations };
}

export async function runClauseAnalyzer(text: string, userId: string): Promise<ToolResult> {
    const systemPrompt = `You are an expert contract law attorney specializing in clause analysis. Your task is to:

1. IDENTIFY each distinct clause or provision in the provided text
2. ASSESS the risk level of each clause (Low / Medium / High / Critical)
3. FLAG problematic language including:
   - One-sided terms that heavily favor one party
   - Ambiguous or vague language
   - Missing protections or standard safeguards
   - Unusual or non-standard provisions
   - Potential enforceability issues
4. PROVIDE specific recommendations for each flagged item
5. Give an OVERALL risk assessment

Format your response as structured analysis with clear sections. Reference source documents when available using [Source: document_name] format.

DISCLAIMER: This is AI-generated analysis and should not substitute professional legal advice.`;

    const { context, citations } = await getRAGContext(text, userId);
    const result = await generateWithPrompt(systemPrompt, text, context);
    return { result, citations };
}

export async function runComplianceChecker(
    text: string,
    userId: string,
    jurisdiction?: string,
    framework?: string
): Promise<ToolResult> {
    const frameworkText = framework || 'general legal compliance (GDPR, HIPAA, SOX, ADA as applicable)';
    const jurisdictionText = jurisdiction || 'general / international';

    const systemPrompt = `You are a senior compliance officer and legal analyst. Evaluate the provided text against ${frameworkText} requirements for the ${jurisdictionText} jurisdiction.

Your analysis must:
1. IDENTIFY specific compliance requirements that apply
2. CHECK each requirement against the provided text
3. FLAG any violations or gaps with severity (Minor / Major / Critical)
4. PROVIDE specific recommendations to achieve compliance
5. Give an OVERALL compliance status (Compliant / Partially Compliant / Non-Compliant)

Format your response with clear sections:
- **Applicable Requirements**: List relevant regulations/standards
- **Compliance Status**: Overall assessment
- **Issues Found**: Detailed list of violations/gaps
- **Recommendations**: Specific actions to remediate

Reference source documents when available using [Source: document_name] format.

DISCLAIMER: This is AI-generated compliance analysis and should not substitute professional legal or compliance advice.`;

    const { context, citations } = await getRAGContext(text, userId);
    const result = await generateWithPrompt(systemPrompt, text, context);
    return { result, citations };
}

export async function runPrecedentFinder(query: string, userId: string): Promise<ToolResult> {
    const systemPrompt = `You are a legal research specialist with extensive knowledge of case law and legal precedents. Your task is to:

1. SEARCH the provided document context for relevant legal precedents, case references, and legal patterns
2. RANK them by relevance to the user's query
3. For each precedent found, provide:
   - Case name or reference (if available)
   - Brief summary of the relevant holding or principle
   - Relevance score and explanation of why it's relevant
   - How it might apply to the user's situation
4. IDENTIFY any legal patterns or trends across the found precedents
5. SUGGEST additional areas of research

Format as a structured list of precedents with clear relevance indicators.
Reference source documents using [Source: document_name] format.

DISCLAIMER: This is AI-generated legal research and should not substitute professional legal advice.`;

    const { context, citations } = await getRAGContext(query, userId, 10);
    const result = await generateWithPrompt(systemPrompt, query, context);
    return { result, citations };
}

export async function runNegotiationCoach(
    clauseText: string,
    position: 'buyer' | 'seller' | 'neutral',
    userId: string
): Promise<ToolResult> {
    const positionMap = {
        buyer: 'representing the buyer/purchaser/licensee side',
        seller: 'representing the seller/vendor/licensor side',
        neutral: 'providing balanced analysis for both parties',
    };

    const systemPrompt = `You are an experienced negotiation attorney ${positionMap[position]}. Analyze the provided contract clause and provide strategic negotiation guidance.

Your analysis must include:
1. **Clause Assessment**: What this clause means and its practical implications
2. **Leverage Points**: What aspects can be negotiated and why
3. **Counterarguments**: Specific arguments to make for better terms
4. **Alternative Language**: Suggest revised clause text that better serves the client's interests
5. **BATNA Analysis**: Best Alternative to Negotiated Agreement — what happens if this clause can't be agreed upon
6. **Red Lines**: What terms should never be accepted and why
7. **Compromise Positions**: Acceptable middle-ground options

Be specific and practical. Provide actual suggested replacement language where possible.
Reference source documents when available using [Source: document_name] format.

DISCLAIMER: This is AI-generated negotiation guidance and should not substitute professional legal advice.`;

    const { context, citations } = await getRAGContext(clauseText, userId);
    const result = await generateWithPrompt(systemPrompt, clauseText, context);
    return { result, citations };
}
