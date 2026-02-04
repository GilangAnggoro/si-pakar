import { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Loader2, User, Bot, X, Minimize2 } from 'lucide-react';

const FloatingChatAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Halo! 👋 Saya AI Assistant Si-Pakar. Ada yang bisa saya bantu?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      console.log('📤 Sending message to backend:', userMessage);
      
      // ⭐ MENGGUNAKAN OPENROUTER ENDPOINT ⭐
      const response = await fetch('http://localhost:5000/api/openrouter/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage
        })
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 Response data:', data);
      
      // OpenRouter response in Gemini format
      if (data.candidates && 
          data.candidates[0] && 
          data.candidates[0].content && 
          data.candidates[0].content.parts && 
          data.candidates[0].content.parts[0] && 
          data.candidates[0].content.parts[0].text) {
        
        const aiResponse = data.candidates[0].content.parts[0].text;
        console.log('✅ AI Response:', aiResponse);
        setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        
      } else if (data.error) {
        console.error('❌ Backend error:', data.error);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.candidates?.[0]?.content?.parts?.[0]?.text || '❌ Maaf, terjadi kesalahan. Silakan coba lagi.' 
        }]);
      } else {
        console.error('❌ Invalid response structure:', data);
        throw new Error('Invalid response structure from API');
      }
      
    } catch (error) {
      console.error('❌ Error calling OpenRouter API:', error);
      
      let errorMessage = '❌ Maaf, terjadi kesalahan. ';
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage += 'Pastikan Flask backend sudah berjalan di http://localhost:5000';
      } else if (error.message.includes('HTTP error')) {
        errorMessage += 'Server mengalami masalah. Silakan coba lagi.';
      } else {
        errorMessage += 'Silakan coba lagi atau hubungi administrator.';
      }
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    '🧠 Apa itu gangguan kecemasan?',
    '💡 Tips mengatasi kecemasan',
    '📋 Jenis gangguan kecemasan',
    '👨‍⚕️ Kapan harus ke psikolog?'
  ];

  const handleQuickQuestion = (question) => {
    setInput(question.replace(/^[^\s]+\s/, '')); // Remove emoji
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 group transition-all duration-300 ${
          isOpen ? 'scale-0' : 'scale-100'
        }`}
      >
        <div className="relative">
          {/* Main Button - Clean Blue */}
          <div className="relative w-14 h-14 md:w-16 md:h-16 bg-blue-600 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-300">
            <MessageCircle className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>

          {/* Notification Badge */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            AI
          </div>
        </div>

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
          Tanya AI Assistant
          <div className="absolute top-full right-6 w-2 h-2 bg-gray-800 transform rotate-45 -mt-1"></div>
        </div>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeInScale">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-[90vw] sm:w-96 h-[70vh] sm:h-[600px] flex flex-col overflow-hidden">
            {/* Header - Clean Blue */}
            <div className="bg-blue-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-700 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg">AI Assistant</h3>
                  <p className="text-blue-100 text-xs">Online • OpenRouter AI</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 hover:bg-blue-700 rounded-lg transition-all flex items-center justify-center text-white"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 hover:bg-blue-700 rounded-lg transition-all flex items-center justify-center text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages - Clean Background */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-2 animate-fadeInUp ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Avatar - Clean Design */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-blue-600' 
                      : 'bg-white border-2 border-blue-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-blue-600" />
                    )}
                  </div>

                  {/* Message Bubble - Clean Style */}
                  <div className={`max-w-[75%] ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  }`}>
                    <div className={`rounded-2xl px-4 py-2.5 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-md'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-md'
                    }`}>
                      <p className={`text-sm leading-relaxed whitespace-pre-wrap ${
                        message.role === 'user' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading - Clean Animation */}
              {loading && (
                <div className="flex gap-2 animate-fadeInUp">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 border-blue-600">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      <span className="text-sm text-gray-600">Mengetik...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions - Clean Style */}
            {messages.length <= 1 && (
              <div className="p-4 bg-white border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-700 mb-2.5">Coba tanyakan:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="text-left text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-all border border-blue-600 font-medium"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input - Clean Design */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ketik pesan..."
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all text-sm"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-11 h-11 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 flex items-center justify-center flex-shrink-0"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
              <p className="text-[10px] text-gray-500 text-center mt-2">
                Powered by OpenRouter AI
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChatAI;