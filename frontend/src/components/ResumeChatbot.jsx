import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const INITIAL_SUGGESTIONS = [
  'What are my biggest weaknesses?',
  'How can I improve my ATS score?',
  'What skills am I missing?',
  'What interview questions should I prepare for?',
  'What projects should I build?',
  'How can I improve my resume?',
];

const ResumeChatbot = ({ reportId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const trimmed = (text || inputValue).trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build history from existing messages (last 10)
      const history = [...messages, userMessage].slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await axios.post(`${API_BASE_URL}/api/chat/${reportId}`, {
        message: trimmed,
        history
      });

      const { answer, suggestedQuestions } = response.data;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: answer
      }]);

      if (suggestedQuestions && suggestedQuestions.length > 0) {
        setSuggestions(suggestedQuestions);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to get a response. Please try again.';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ ${errorMessage}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (question) => {
    sendMessage(question);
  };

  const formatMessage = (content) => {
    if (!content) return '';
    // Basic markdown-like formatting
    return content
      .split('\n')
      .map((line, i) => {
        // Bold text
        let formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Bullet points
        if (formatted.startsWith('- ') || formatted.startsWith('• ')) {
          formatted = `<span class="text-primary mr-2">•</span>${formatted.slice(2)}`;
          return `<div key="${i}" class="flex items-start gap-0 ml-2 my-0.5">${formatted}</div>`;
        }
        if (formatted.trim() === '') return '<br/>';
        return `<p class="my-0.5">${formatted}</p>`;
      })
      .join('');
  };

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transition-shadow"
            aria-label="Open AI Resume Assistant"
          >
            <MessageCircle className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-40 w-[calc(100vw-3rem)] sm:w-[420px] h-[600px] max-h-[calc(100vh-6rem)] flex flex-col rounded-2xl border border-white/10 bg-darkSurface/95 backdrop-blur-xl shadow-[0_0_40px_rgba(0,240,255,0.15)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold text-white">AI Resume Assistant</h3>
                  <p className="text-xs text-gray-400">Ask anything about your resume</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin">
              {/* Welcome Message */}
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="glass-card p-4 rounded-2xl rounded-tl-sm max-w-[85%]">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        Your resume analysis is complete! I can help you understand your <span className="text-primary font-medium">strengths</span>, <span className="text-orange-400 font-medium">weaknesses</span>, <span className="text-red-400 font-medium">missing skills</span>, ATS score, career path, interview preparation, and resume improvements.
                      </p>
                      <p className="text-sm text-gray-400 mt-2">Try asking one of these questions:</p>
                    </div>
                  </div>

                  {/* Initial Suggestion Chips */}
                  <div className="flex flex-wrap gap-2 pl-11">
                    {INITIAL_SUGGESTIONS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(q)}
                        className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary/80 hover:bg-primary/10 hover:text-primary hover:border-primary/50 transition-all"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              {messages.map((msg, index) => (
                <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    msg.role === 'user'
                      ? 'bg-primary/20'
                      : 'bg-gradient-to-br from-primary/20 to-secondary/20'
                  }`}>
                    {msg.role === 'user'
                      ? <User className="w-3.5 h-3.5 text-primary" />
                      : <Bot className="w-3.5 h-3.5 text-primary" />
                    }
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary/15 text-white rounded-tr-sm border border-primary/20'
                      : 'glass-card rounded-tl-sm text-gray-300'
                  }`}>
                    {msg.role === 'user' ? (
                      <p>{msg.content}</p>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                    )}
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="glass-card px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span>AI is analyzing your resume...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Suggestions after messages */}
              {messages.length > 0 && !isLoading && suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 pl-10">
                  {suggestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(q)}
                      className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-gray-400 hover:bg-white/5 hover:text-primary hover:border-primary/30 transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-4 py-3 border-t border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your resume..."
                  disabled={isLoading}
                  className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all disabled:opacity-50"
                  maxLength={2000}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={isLoading || !inputValue.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ResumeChatbot;
