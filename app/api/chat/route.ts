import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ITTF_KNOWLEDGE_BASE } from '@/data/ittf-knowledge-base';

export async function POST(request: NextRequest) {
  try {
    // Initialize Gemini (inside function to avoid build-time errors)
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GOOGLE_API_KEY environment variable is not set' },
        { status: 500 }
      );
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const { messages, language = 'en' } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    // Get the latest user message
    const userMessage = messages[messages.length - 1].content;

    // Initialize the model - Using Gemini 2.0 Flash for cost-effectiveness
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // Create system instruction with knowledge base
    const systemInstruction = `You are the ITTF Intelligence Hub, an AI assistant specialized in table tennis knowledge from the International Table Tennis Federation (ITTF) and World Table Tennis (WTT).

CRITICAL CITATION REQUIREMENTS:
- You MUST include full citations for EVERY factual claim
- Citations must include: Document name, Chapter/Section, Article number (if applicable), Page number
- Format: "According to [Document Name] ([Chapter X, Section Y, Article Z, Page N]), [fact]..."
- Example: "According to ITTF Statutes 2025 (Chapter 2, Section 2.5, Article 2.5.1, Page 23), the table must be 2.74m in length..."

KNOWLEDGE BASE:
${ITTF_KNOWLEDGE_BASE}

LANGUAGE INSTRUCTION:
- Detect the language of the user's question
- Respond in the SAME language as the question
- If language parameter is provided: "${language}", respond in that language
- Keep citations in English but translate explanations

RESPONSE GUIDELINES:
- Be comprehensive but concise
- Always cite sources with full details (document, chapter, article, page)
- If information is not in your knowledge base, clearly state this
- Provide specific article numbers and page references
- For rankings/results from last 30 days, note that live data requires checking ittf.com
- Be helpful and friendly while maintaining professionalism`;

    // Generate response
    const chat = model.startChat({
      history: messages.slice(0, -1).map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage([
      { text: systemInstruction },
      { text: userMessage }
    ]);

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      response: text,
      model: 'gemini-2.0-flash-exp'
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
