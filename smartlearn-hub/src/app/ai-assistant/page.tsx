"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      text: "Hello! I'm your AI assistant. How can I help you today?", 
      timestamp: new Date(),
      messageId: Date.now()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api";
  
  // Check if device is mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { 
      role: "user", 
      text: input, 
      timestamp: new Date(),
      messageId: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      setMessages(prev => [...prev, { 
        role: "assistant", 
        text: data.reply, 
        timestamp: new Date(),
        messageId: Date.now()
      }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        text: "Sorry, I'm having trouble connecting right now. Please try again later.", 
        timestamp: new Date(),
        messageId: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Clear conversation
  const clearChat = () => {
    setMessages([{ 
      role: "assistant", 
      text: "Hello! I'm your AI assistant. How can I help you today?", 
      timestamp: new Date(),
      messageId: Date.now()
    }]);
  };

  // Copy message to clipboard
  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Mobile Header - Sticky */}
      {isMobile && (
        <header className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <motion.div 
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <span className="text-xl">🤖</span>
              </motion.div>
              <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${isOnline ? 'bg-green-400' : 'bg-red-400'} rounded-full border-2 border-white`}></div>
            </div>
            <div>
              <h1 className="font-bold text-lg">AI Assistant</h1>
              <p className="text-xs text-blue-100">{isOnline ? "Online" : "Offline"}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button 
              onClick={clearChat}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Clear conversation"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </motion.button>
          </div>
        </header>
      )}

      {/* Messages Area - Different layout for PC */}
      <div className={`${isMobile ? 'h-[calc(100vh-136px)]' : 'h-screen pb-24'} overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900`}>
        {!isMobile && (
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-full shadow-md">
              <div className="relative">
                <motion.div 
                  className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <span className="text-xl">🤖</span>
                </motion.div>
                <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${isOnline ? 'bg-green-400' : 'bg-red-400'} rounded-full border-2 border-white`}></div>
              </div>
              <div>
                <h1 className="font-bold text-lg">AI Assistant</h1>
                <p className="text-xs text-gray-500">{isOnline ? "Online" : "Offline"}</p>
              </div>
              <motion.button 
                onClick={clearChat}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Clear conversation"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </motion.button>
            </div>
          </div>
        )}

        {/* Empty space to push messages to bottom on PC */}
        {!isMobile && <div className="flex-grow"></div>}

        {/* Messages */}
        {messages.map((msg) => (
          <motion.div
            key={msg.messageId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex items-start gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <motion.div 
                className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-sm">🤖</span>
              </motion.div>
            )}
            <div className={`flex flex-col max-w-[85%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <motion.div
                className={`relative px-4 py-3 rounded-2xl shadow-sm ${msg.role === "user"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none"
                  : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-600"
                }`}
                whileHover={{ y: -2 }}
              >
                {msg.text}
                <motion.button 
                  className="absolute -top-2 -right-2 p-1 bg-gray-200 dark:bg-gray-600 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                  onClick={() => copyMessage(msg.text)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </motion.button>
              </motion.div>
              <span className={`text-xs mt-1 px-2 text-gray-500 dark:text-gray-400`}>
                {formatTime(msg.timestamp)}
              </span>
            </div>
            {msg.role === "user" && (
              <motion.div 
                className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center text-white"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-sm">👤</span>
              </motion.div>
            )}
          </motion.div>
        ))}
        
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-3 justify-start"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                <span className="text-sm">🤖</span>
              </div>
              <div className="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-gray-100 dark:border-gray-600">
                <div className="flex space-x-1.5">
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-gray-400"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-gray-400"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-gray-400"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={chatEndRef} />
      </div>

      {/* Input Area - Sticky Bottom */}
      <div className={`sticky bottom-0 p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg ${!isMobile ? 'mx-auto max-w-2xl rounded-t-xl' : ''}`}>
        <div className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
              placeholder="Type a message..."
              disabled={loading}
            />
          </div>
          <motion.button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-sm flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
