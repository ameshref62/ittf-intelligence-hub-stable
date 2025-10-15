'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Globe, Loader2, AlertCircle } from 'lucide-react'
import { SAMPLE_QUESTIONS } from '../data/sample-questions'
import { LANGUAGES } from '../data/languages'

// ITTF Official Colors
const ITTF_COLORS = {
  primary: '#0066CC',    // ITTF Blue
  secondary: '#FF6600',  // ITTF Orange  
  dark: '#003366',
  light: '#E6F2FF',
  white: '#FFFFFF',
  gray: '#F5F5F5',
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent, questionText?: string) => {
    e.preventDefault()
    const messageText = questionText || input
    if (!messageText.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: messageText }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          language: selectedLanguage
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: ITTF_COLORS.gray }}>
      {/* Header */}
      <header className="shadow-md" style={{ backgroundColor: ITTF_COLORS.primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full" style={{ backgroundColor: ITTF_COLORS.white }}>
                <span className="text-2xl md:text-3xl">🏓</span>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                  ITTF Intelligence Hub
                </h1>
                <p className="text-xs md:text-sm text-white/90 hidden sm:block">
                  Your AI-powered table tennis knowledge assistant
                </p>
              </div>
            </div>
            
            {/* Language Selector */}
            <div className="relative">
              <label htmlFor="language" className="sr-only">Select Language</label>
              <select
                id="language"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="appearance-none pl-10 pr-10 py-2 md:py-3 rounded-lg border-2 border-white/20 text-white font-medium cursor-pointer transition-all hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm md:text-base"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                {LANGUAGES.map(lang => (
                  <option 
                    key={lang.code} 
                    value={lang.code}
                    className="text-gray-900 bg-white"
                  >
                    {lang.flag} {lang.nativeName}
                  </option>
                ))}
              </select>
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white pointer-events-none" />
            </div>
          </div>
        </div>
      </header>

      {/* Disclaimer Banner */}
      {showDisclaimer && (
        <div className="border-b" style={{ backgroundColor: ITTF_COLORS.secondary, borderColor: ITTF_COLORS.dark }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-white flex-shrink-0 mt-0.5" />
                <div className="text-white text-xs md:text-sm">
                  <p className="font-semibold mb-1">AI-Powered Assistant</p>
                  <p className="opacity-90">
                    This tool provides information based on official ITTF and WTT documents. 
                    While we strive for accuracy, please verify critical information with official sources. 
                    Not affiliated with ITTF.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDisclaimer(false)}
                className="text-white hover:text-white/80 text-lg md:text-xl font-bold flex-shrink-0 px-2"
                aria-label="Close disclaimer"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex flex-col">
        
        {/* Welcome Message & Sample Questions */}
        {messages.length === 0 && (
          <div className="mb-6 md:mb-8 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border-2" style={{ borderColor: ITTF_COLORS.light }}>
              <h2 className="text-xl md:text-2xl font-bold mb-3" style={{ color: ITTF_COLORS.primary }}>
                Welcome to the ITTF Intelligence Hub! 👋
              </h2>
              <p className="text-gray-700 mb-4 text-sm md:text-base">
                Ask me anything about ITTF regulations, WTT events, rankings, equipment, development programs, and more. 
                I can answer in 15 languages!
              </p>
              <p className="text-gray-600 text-sm">
                💡 Tip: Click any question below to get started, or type your own question.
              </p>
            </div>

            {/* Sample Questions */}
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border-2" style={{ borderColor: ITTF_COLORS.light }}>
              <h3 className="text-lg md:text-xl font-bold mb-4" style={{ color: ITTF_COLORS.primary }}>
                Popular Questions:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SAMPLE_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => handleSubmit(e, q.question)}
                    className="text-left p-4 rounded-lg border-2 transition-all hover:shadow-md text-sm md:text-base"
                    style={{
                      borderColor: ITTF_COLORS.light,
                      backgroundColor: ITTF_COLORS.white
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = ITTF_COLORS.primary
                      e.currentTarget.style.backgroundColor = ITTF_COLORS.light
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = ITTF_COLORS.light
                      e.currentTarget.style.backgroundColor = ITTF_COLORS.white
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl md:text-2xl flex-shrink-0">{q.emoji}</span>
                      <span className="font-medium text-gray-800">{q.question}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 space-y-4 mb-6">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 md:px-6 py-3 md:py-4 shadow-sm text-sm md:text-base ${
                  message.role === 'user'
                    ? 'text-white'
                    : 'bg-white border-2'
                }`}
                style={message.role === 'user' 
                  ? { backgroundColor: ITTF_COLORS.primary } 
                  : { borderColor: ITTF_COLORS.light }
                }
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border-2" style={{ borderColor: ITTF_COLORS.light }}>
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: ITTF_COLORS.primary }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="sticky bottom-0 pb-4">
          <form onSubmit={handleSubmit} className="flex gap-2 md:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about ITTF, WTT, rankings, rules..."
              className="flex-1 px-4 md:px-6 py-3 md:py-4 rounded-xl border-2 focus:outline-none focus:ring-2 shadow-sm text-sm md:text-base"
              style={{
                borderColor: ITTF_COLORS.light
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6 md:px-8 py-3 md:py-4 rounded-xl text-white font-semibold shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm md:text-base"
              style={{ backgroundColor: ITTF_COLORS.primary }}
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto" style={{ borderColor: ITTF_COLORS.light, backgroundColor: ITTF_COLORS.white }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* About */}
            <div>
              <h3 className="font-bold mb-2 text-sm md:text-base" style={{ color: ITTF_COLORS.primary }}>
                About This Hub
              </h3>
              <p className="text-xs md:text-sm text-gray-600 mb-2">
                This ITTF Intelligence Hub was created as a community tool to make ITTF and WTT resources 
                more accessible to everyone worldwide.
              </p>
            </div>

            {/* Disclaimer */}
            <div>
              <h3 className="font-bold mb-2 text-sm md:text-base" style={{ color: ITTF_COLORS.primary }}>
                Important Note
              </h3>
              <p className="text-xs md:text-sm text-gray-600">
                This is an independent AI assistant and is not officially affiliated with ITTF or WTT. 
                For official information, please visit{' '}
                <a href="https://www.ittf.com" target="_blank" rel="noopener noreferrer" 
                   className="underline hover:no-underline" style={{ color: ITTF_COLORS.secondary }}>
                  ittf.com
                </a>
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold mb-2 text-sm md:text-base" style={{ color: ITTF_COLORS.primary }}>
                Feedback & Support
              </h3>
              <p className="text-xs md:text-sm text-gray-600 mb-2">
                Have suggestions or found an error?
              </p>
              <a 
                href="mailto:your-email@example.com" 
                className="text-xs md:text-sm font-medium underline hover:no-underline"
                style={{ color: ITTF_COLORS.secondary }}
              >
                Send us feedback
              </a>
            </div>
          </div>

          {/* Attribution */}
          <div className="mt-6 md:mt-8 pt-6 border-t text-center space-y-2" style={{ borderColor: ITTF_COLORS.light }}>
            <p className="text-xs md:text-sm font-semibold" style={{ color: ITTF_COLORS.primary }}>
              © 2025 | Built for the table tennis community
            </p>
            <p className="text-xs text-gray-500">
              Powered by Google Gemini 2.0 Flash • 15 Languages • 1M Token Knowledge Base
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
