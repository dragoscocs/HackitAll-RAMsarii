import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Loader2, Send, Paperclip } from 'lucide-react';

const FloatingAiAssistant = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', content: 'Salut! Sunt asistentul tău EcoSync. Te pot ajuta cu sfaturi de wellbeing, nutriție sau echipament sportiv. Cu ce începem?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      // Store only the raw base64 data, stripping the data URL prefix
      const base64 = reader.result.split(',')[1];
      setSelectedImage(base64);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSend = async () => {
    if (!message.trim() && !selectedImage) return;

    const userMsg = message;
    const imageToSend = selectedImage;

    setChatHistory(prev => [...prev, { role: 'user', content: userMsg || '📷 Imagine atașată' }]);
    setMessage('');
    setSelectedImage(null);
    setIsTyping(true);

    try {
      const contextToSend = [...chatHistory, { role: 'user', content: userMsg }]
        .filter(msg => msg.role !== 'ai' || !msg.content.startsWith('Salut! Sunt asistentul'))
        .slice(-4);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: contextToSend, imageBase64: imageToSend })
      });

      if (!response.ok) throw new Error('Network error');

      const data = await response.text();
      setChatHistory(prev => [...prev, { role: 'ai', content: data }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory(prev => [...prev, { role: 'ai', content: 'Oops! Eroare de conexiune. Mai încearcă.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 transform ${isChatOpen ? 'rotate-90' : 'rotate-0'}`}
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.8) 0%, rgba(168,85,247,0.8) 100%)',
          boxShadow: '0 0 20px rgba(139, 92, 246, 0.7)',
          border: '2px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <div className="relative z-10">
          { isChatOpen ? <X className="text-white"/> : <Bot className="w-8 h-8 text-white" />}
        </div>
      </button>

      {isChatOpen && (
        <div className="absolute bottom-20 right-0 w-[380px] h-[500px] flex flex-col rounded-3xl bg-zinc-900 border border-zinc-700 shadow-2xl overflow-hidden" style={{ animation: 'popIn 0.3s forwards' }}>
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-800 border-b border-zinc-700">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium text-zinc-100">EcoSync AI</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-200 border border-zinc-700'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-zinc-800 border border-zinc-700 rounded-2xl px-4 py-2 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
                  <span className="text-xs text-zinc-400">Procesează...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-zinc-800 border-t border-zinc-700">
            {selectedImage && (
              <div className="relative inline-block mb-2">
                <img
                  src={`data:image/jpeg;base64,${selectedImage}`}
                  alt="Preview"
                  className="h-16 w-16 rounded-lg object-cover border border-zinc-600"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors"
                >
                  <X className="w-2.5 h-2.5 text-white" />
                </button>
              </div>
            )}
            <div className="flex gap-2 items-end">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 bg-zinc-700 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-600 transition-colors flex-shrink-0"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                rows={1}
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white resize-none outline-none focus:border-indigo-500"
                placeholder="Întreabă ceva..."
              />
              <button onClick={handleSend} disabled={(!message.trim() && !selectedImage) || isTyping} className="p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 disabled:opacity-50 flex-shrink-0">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes popIn { 0% { opacity: 0; transform: scale(0.9) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
    </div>
  );
};

export default FloatingAiAssistant;
