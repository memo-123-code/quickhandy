"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export interface ChatMessage {
  sender: string;
  text: string;
  time: string;
}

interface SmartNegotiationChatProps {
  onClose: () => void;
  otherPartyName: string;
  otherPartyPhotoUrl: string;
  currentUserRole: "client" | "provider";
}

export default function SmartNegotiationChat({
  onClose,
  otherPartyName,
  otherPartyPhotoUrl,
  currentUserRole,
}: SmartNegotiationChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: "system", text: "Welcome to QuickHandy Chat. For your safety and to comply with platform rules, please keep all negotiations and payments on the platform.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const moderateMessage = (text: string): { isValid: boolean; sanitizedText: string; reason?: string } => {
    let isValid = true;
    let sanitizedText = text;

    // 1. Regex to detect Egyptian Phone Numbers (010, 011, 012, 015 followed by 8 digits, ignoring spaces/dashes)
    const phoneRegex = /(?:0\s*1\s*[0125]\s*)(?:\d\s*){8}/g;
    
    // 2. Keywords for bypassing (Arabic & English)
    const bypassKeywords = ["واتس", "رقم", "فون", "whatsapp", "call me", "تليفون", "موبايل"];
    
    if (phoneRegex.test(sanitizedText)) {
      isValid = false;
      sanitizedText = sanitizedText.replace(phoneRegex, "[BLOCKED BY AI]");
    }

    bypassKeywords.forEach(keyword => {
      const keywordRegex = new RegExp(keyword, "gi");
      if (keywordRegex.test(sanitizedText)) {
        isValid = false;
        sanitizedText = sanitizedText.replace(keywordRegex, "[BLOCKED BY AI]");
      }
    });

    return { 
      isValid, 
      sanitizedText, 
      reason: !isValid ? "Sharing contact info or attempting to deal outside QuickHandy violates our terms." : undefined 
    };
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { isValid, sanitizedText, reason } = moderateMessage(newMessage);

    if (!isValid) {
      toast.error(`System Alert: ${reason} Repeated attempts will suspend your account.`, { duration: 5000 });
      setNewMessage(sanitizedText); // Replace input with [BLOCKED BY AI] so the user sees what was caught
      
      // Optionally add a system warning to the chat
      setMessages(prev => [...prev, { 
        sender: "system", 
        text: `Warning: Message blocked. ${reason}`, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
      return;
    }

    setMessages(prev => [
      ...prev,
      { sender: "me", text: sanitizedText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setNewMessage("");

    // Mock auto-reply for demo
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { sender: "other", text: "Understood.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 2000);
  };

  return (
    <div className="absolute inset-0 z-[2000] bg-slate-950/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[480px] overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src={otherPartyPhotoUrl || "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=120&h=120&fit=crop&crop=faces"}
                alt={otherPartyName}
                className="w-9 h-9 rounded-full object-cover border border-brand-orange-500/20 bg-slate-800"
              />
              <span className="absolute bottom-0 end-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div>
              <h4 dir="auto" className="text-xs font-bold text-white">{otherPartyName}</h4>
              <span className="text-[9px] text-green-400 font-medium">Online & Ready</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/25 flex flex-col">
          {messages.map((msg, idx) => {
            if (msg.sender === "system") {
              return (
                <div key={idx} className="flex justify-center my-2">
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] px-3 py-1.5 rounded-lg text-center max-w-[90%] flex flex-col items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span dir="auto">{msg.text}</span>
                  </div>
                </div>
              );
            }
            const isMe = msg.sender === "me";
            return (
              <div key={idx} className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] ${isMe ? "self-end" : "self-start"}`}>
                <div
                  dir="auto"
                  className={`px-3 py-2 text-sm rounded-2xl ${
                    isMe
                      ? "bg-brand-orange-500 text-white rounded-br-sm"
                      : "bg-slate-800 text-slate-200 border border-slate-700/50 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[8px] text-slate-500 mt-1 px-1">{msg.time}</span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-slate-900 border-t border-slate-800/80">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              dir="auto"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-full px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-brand-orange-500/50 pr-12 transition-colors"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="absolute right-1.5 p-1.5 bg-brand-orange-500 hover:bg-brand-orange-400 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-full transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 text-center flex justify-center items-center gap-1">
             <ShieldAlert className="w-3 h-3 text-slate-500" />
             <p className="text-[8px] text-slate-500 uppercase tracking-wider">AI Moderated Chat. Keep contact details private.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
