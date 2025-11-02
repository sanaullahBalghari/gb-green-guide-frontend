
// ==========================================
// FILE 1: ChatMessage.jsx (Component)
// ==========================================

import React from "react";
import { Bot, User } from "lucide-react";

const ChatMessage = ({ sender, text, isLatest }) => {
  const isUser = sender === "user";

  return (
    <div
      className={`flex mb-4 animate-fadeIn ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[75%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser
              ? "bg-gradient-to-br from-green-500 to-green-600 shadow-md"
              : "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md"
          }`}
        >
          {isUser ? (
            <User size={16} className="text-white" />
          ) : (
            <Bot size={16} className="text-white" />
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? "bg-gradient-to-br from-green-600 to-green-700 text-white rounded-br-none"
              : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
          } ${isLatest ? "animate-slideUp" : ""}`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{text}</p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;