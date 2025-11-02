// ==========================================
// FILE 2: ChatbotPage.jsx (Main Page)
// ==========================================

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Bot } from "lucide-react";
import apiServer from "../utils/apiServer";
import API_ROUTES from "../apiRoutes";
import ChatMessage from "../components/ChatMessage";

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hello! I'm your GBGreenGuide assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    // Add user's message
    const userMessage = { sender: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Call backend API using your existing apiServer pattern
      const res = await apiServer("post", API_ROUTES.CHATBOT, { message: trimmed }, { showNotification: false });
      const botMessage = { sender: "bot", text: res?.reply || "Sorry, no response." };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMsg = { sender: "bot", text: "⚠️ Oops! Something went wrong. Please try again." };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) handleSendMessage();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-4 sm:p-6">
      {/* Main Chat Container */}
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl flex flex-col overflow-hidden border border-green-100/50">
        
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 text-white px-6 py-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg">GBGreenGuide Assistant</h1>
                <p className="text-xs text-green-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                  Online & Ready to Help
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div 
          className="flex-1 p-4 sm:p-6 overflow-y-auto bg-gradient-to-b from-gray-50/30 to-white"
          style={{ 
            height: "calc(100vh - 280px)", 
            maxHeight: "550px",
            minHeight: "400px"
          }}
        >
          {messages.map((msg, index) => (
            <ChatMessage 
              key={index} 
              sender={msg.sender} 
              text={msg.text} 
              isLatest={index === messages.length - 1}
            />
          ))}
          
          {/* Loading Indicator */}
          {loading && (
            <div className="flex justify-start mb-4 animate-fadeIn">
              <div className="flex items-end gap-2 max-w-[85%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl rounded-bl-none bg-white border border-gray-100 shadow-sm">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Enhanced Input Area */}
        <div className="border-t border-gray-200/50 p-4 bg-white/90 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder:text-gray-400 bg-white shadow-sm"
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className={`p-3 rounded-xl text-white font-medium transition-all transform shadow-lg ${
                loading || !input.trim()
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-xl active:scale-95"
              }`}
            >
              <Send size={20} className={loading ? "animate-pulse" : ""} />
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Press Enter to send • Powered by GBGreenGuide AI
          </p>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
      `}</style>
    </div>
  );
};

export default ChatbotPage;