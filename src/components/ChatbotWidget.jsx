//==========================================
// FILE 2: ChatbotWidget.jsx (Expandable Widget)
// ==========================================

import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Maximize2, Minimize2 } from "lucide-react";
import apiServer from "../utils/apiServer";
import API_ROUTES from "../apiRoutes";
import ChatMessage from "../components/ChatMessage";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hello! I'm your GBGreenGuide assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Prevent body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isFullscreen]);

  // ✅ Send message (using apiServer)
  const handleSendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { sender: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Call chatbot API via centralized apiServer method
      const res = await apiServer(
        "post",
        API_ROUTES.CHATBOT,
        { message: trimmed },
        { showNotification: false }
      );

    const botMsg = {
  sender: "bot",
  text: res?.html || res?.reply || "🤖 Sorry, I didn't quite catch that.",
};
setMessages((prev) => [...prev, botMsg]);

    } catch (error) {
      const errMsg = {
        sender: "bot",
        text: "⚠️ Oops! Couldn't connect right now. Please try again later.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) handleSendMessage();
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Close widget completely
  const closeWidget = () => {
    setIsOpen(false);
    setIsFullscreen(false);
  };

  return (
    <>
      {/* Floating Chat Icon (Only visible when widget is closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-18 right-6 cursor-pointer bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-full shadow-2xl hover:shadow-green-500/50 hover:scale-110 transition-all duration-300 z-50 group animate-bounce"
          aria-label="Open chat"
        >
          <MessageCircle size={28} className="group-hover:animate-pulse" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Chat Window - Small (Corner Widget) */}
      {isOpen && !isFullscreen && (
        <div className="fixed bottom-6 right-6 w-[360px] sm:w-[400px] bg-white shadow-2xl rounded-3xl flex flex-col border border-green-100/50 z-50 animate-slideIn max-h-[600px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 text-white flex justify-between items-center px-5 py-4 rounded-t-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <span className="font-bold text-base">GBGreenGuide Bot</span>
                <p className="text-xs text-green-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <div className="relative flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="hover:bg-white/20 p-1.5 cursor-pointer rounded-lg transition-colors"
                aria-label="Expand fullscreen"
              >
                <Maximize2 size={18} />
              </button>
              <button
                onClick={closeWidget}
                className="hover:bg-white/20 p-1.5 cursor-pointer rounded-lg transition-colors"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-50/30 to-white">
            {messages.map((msg, i) => (
              <ChatMessage 
                key={i} 
                sender={msg.sender} 
                text={msg.text}
                isLatest={i === messages.length - 1}
              />
            ))}
            
            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start mb-3 animate-fadeIn">
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

          {/* Input Area */}
          <div className="border-t border-gray-200/50 p-3 bg-white/90 backdrop-blur-sm rounded-b-3xl">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className={`p-2.5 rounded-xl text-white text-sm font-medium transition-all transform ${
                  loading || !input.trim()
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-green-700 hover:shadow-lg active:scale-95"
                }`}
                aria-label="Send message"
              >
                <Send size={18} className={loading ? "animate-pulse" : ""} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window - Fullscreen Mode */}
      {isOpen && isFullscreen && (
        <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 z-50 flex flex-col animate-fadeIn">
          {/* Fullscreen Header */}
          <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 text-white px-6 py-4 shadow-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative max-w-5xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-full backdrop-blur-md">
                  <Bot size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-xl">GBGreenGuide Assistant</h1>
                  <p className="text-sm text-green-100 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-green-300 rounded-full animate-pulse"></span>
                    Online & Ready to Help
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleFullscreen}
                  className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                  aria-label="Exit fullscreen"
                >
                  <Minimize2 size={20} />
                </button>
                <button
                  onClick={closeWidget}
                  className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                  aria-label="Close chat"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Fullscreen Chat Container */}
          <div className="flex-1 overflow-hidden flex flex-col max-w-5xl mx-auto w-full p-4 sm:p-6">
            <div className="flex-1 bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl flex flex-col overflow-hidden border border-green-100/50">
              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50/30 to-white">
                {messages.map((msg, i) => (
                  <ChatMessage 
                    key={i} 
                    sender={msg.sender} 
                    text={msg.text}
                    isLatest={i === messages.length - 1}
                  />
                ))}
                
                {/* Loading Indicator */}
                {loading && (
                  <div className="flex justify-start mb-4 animate-fadeIn">
                    <div className="flex items-end gap-2 max-w-[75%]">
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

              {/* Input Area */}
              <div className="border-t border-gray-200/50 p-4 bg-white/90 backdrop-blur-sm rounded-b-3xl">
                <div className="flex items-center gap-3 max-w-4xl mx-auto">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all placeholder:text-gray-400 bg-white shadow-sm"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={loading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !input.trim()}
                    className={`p-3.5 rounded-xl text-white font-medium transition-all transform shadow-lg ${
                      loading || !input.trim()
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:shadow-xl active:scale-95"
                    }`}
                    aria-label="Send message"
                  >
                    <Send size={20} className={loading ? "animate-pulse" : ""} />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Press Enter to send • Powered by GBGreenGuide AI
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideIn { animation: slideIn 0.4s ease-out; }
        .animate-slideUp { animation: slideUp 0.4s ease-out; }
      `}</style>
    </>
  );
};

export default ChatbotWidget;