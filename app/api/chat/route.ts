import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ITTF_KNOWLEDGE_BASE } from '@/data/ittf-knowledge-base';

export async function POST(request: NextRequest) {
  try {
    const { messages, language } = await request.json();

    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const userMessage = messages[messages.length - 1].content;

    const systemInstruction = `You are the ITTF Intelligence Hub, an AI assistant specialized in table tennis knowledge from the International Table Tennis Federation (ITTF) and World Table Tennis (WTT).

CRITICAL CITATION REQUIREMENTS:
- You MUST include full citations for EVERY factual claim
- Citations must include: Document name, Chapter/Section, Article number (if applicable), Page number

KNOWLEDGE BASE:
${ITTF_KNOWLEDGE_BASE}

LANGUAGE INSTRUCTION:
- Detect the language of the user's question
- Respond in the SAME language as the question
- If language parameter is provided: "${language}", respond in that language

RESPONSE GUIDELINES:
- Be comprehensive but concise
- Always cite sources with full details`;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      systemInstruction: systemInstruction,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });

    // FIX: Just send the string, not an array of objects
    const result = await chat.sendMessage(userMessage);
    const text = result.response.text();

    return NextResponse.json({ 
      content: text,
      role: 'assistant'
    });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
