import { useState, useEffect, useRef } from 'react'
import { X, Send, Sparkles, Clock, Calendar, Users, MapPin, CheckCircle, AlertCircle } from 'lucide-react'
import { api } from '../services/api'
import toast from 'react-hot-toast'

export default function AIChatModal({ onClose, onEventCreated }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([])
  
  const inputRef = useRef(null)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Focus input when modal opens
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Simulate AI processing (replace with actual AI API call)
      const response = await processAIRequest(input.trim())
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.message,
        eventData: response.eventData,
        responseType: response.type
      }

      setMessages(prev => [...prev, aiMessage])

      // If AI created an event, notify parent
      if (response.eventData && onEventCreated) {
        onEventCreated(response.eventData)
      }

    } catch (error) {
      console.error('AI processing error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'Omlouvám se, došlo k chybě při zpracování požadavku. Zkus to prosím znovu.',
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const processAIRequest = async (text) => {
    try {
      // Send conversation history for context
      const conversationHistory = messages.map(msg => ({
        type: msg.type,
        content: msg.content,
        eventData: msg.eventData
      }));
      
      const response = await api.post('/ai/process', { 
        text,
        conversationHistory 
      })
      return response.data
    } catch (error) {
      console.error('AI API error:', error)
      throw error
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  // Simple markdown-like formatting
  const formatMessage = (content) => {
    if (!content) return '';
    
    // Replace **text** with bold
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Replace • with bullet points
    formatted = formatted.replace(/•/g, '• ');
    
    // Replace \n with <br>
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  }

  const getMessageIcon = (responseType) => {
    switch (responseType) {
      case 'greeting':
        return <Sparkles className="h-4 w-4 text-blue-600" />;
      case 'calendar_analysis':
        return <Calendar className="h-4 w-4 text-green-600" />;
      case 'meeting_suggestion':
        return <Users className="h-4 w-4 text-purple-600" />;
      case 'event_creation':
        return <Clock className="h-4 w-4 text-orange-600" />;
      case 'help':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Sparkles className="h-4 w-4 text-gray-600" />;
    }
  }

  const getMessageStyle = (responseType) => {
    switch (responseType) {
      case 'greeting':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'calendar_analysis':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'meeting_suggestion':
        return 'bg-purple-50 border-purple-200 text-purple-900';
      case 'event_creation':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'help':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      default:
        return 'bg-white border-gray-300 text-gray-900';
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="fixed inset-0 bg-black/50"></div>
      <div 
        className="relative bg-white w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-red-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wide">AI Asistent</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            title="Zavřít (Esc)"
          >
            <X className="h-4 w-4 text-white font-bold" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 border-2 ${
                  message.type === 'user'
                    ? 'bg-red-600 text-white border-red-700 shadow-sm'
                    : message.isError
                    ? 'bg-red-50 text-red-800 border-red-300'
                    : getMessageStyle(message.responseType)
                }`}
              >
                {message.type === 'ai' && !message.isError && (
                  <div className="flex items-center mb-2">
                    {getMessageIcon(message.responseType)}
                    <span className="ml-2 text-xs font-bold uppercase tracking-wide opacity-75">
                      {message.responseType === 'greeting' && 'Pozdrav'}
                      {message.responseType === 'calendar_analysis' && 'Analýza kalendáře'}
                      {message.responseType === 'meeting_suggestion' && 'Návrh termínů'}
                      {message.responseType === 'event_creation' && 'Vytvoření události'}
                      {message.responseType === 'help' && 'Nápověda'}
                    </span>
                  </div>
                )}
                
                <div 
                  className="text-sm leading-relaxed font-medium"
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                />
                
                {message.eventData && (
                  <div className="mt-3 p-3 bg-white border-2 border-gray-200">
                    <h4 className="font-bold text-sm mb-2 text-gray-900 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Návrh události:
                    </h4>
                    <div className="space-y-1 text-xs mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-2 text-red-600" />
                        <span className="font-bold">{message.eventData.title}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-2 text-red-600" />
                        <span className="font-medium">{message.eventData.date} {message.eventData.time}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onEventCreated(message.eventData)}
                      className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold border-2 border-red-700 transition-colors"
                    >
                      Vytvořit událost
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border-2 border-gray-300 px-4 py-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t-2 border-gray-200 p-6 bg-white">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Napiš, s čím ti mohu pomoci..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white text-gray-900 placeholder-gray-500 font-medium"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-red-700 shadow-sm transition-colors font-bold text-white flex items-center justify-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
