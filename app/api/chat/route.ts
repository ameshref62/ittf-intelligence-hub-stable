import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ITTF_KNOWLEDGE_BASE } from '@/data/ittf-knowledge-base';

export async function POST(request: NextRequest) {
  try {
    const { messages, language } = await request.json();

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
    });

    const userMessage = messages[messages.length - 1].content;
    
    const prompt = `You are the ITTF Intelligence Hub. Answer questions about table tennis using this knowledge base:

${ITTF_KNOWLEDGE_BASE}

User question: ${userMessage}

Provide a detailed answer with citations including document name, chapter, section, and article numbers.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ 
      content: text,
      role: 'assistant'
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
