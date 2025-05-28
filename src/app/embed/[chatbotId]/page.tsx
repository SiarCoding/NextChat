"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bot, Send, Mic, MicOff, Minimize2, Maximize2 } from "lucide-react"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: string
}

interface ChatbotConfig {
  id: string
  name: string
  chatTitle: string
  welcomeMessage: string
  primaryColor: string
  secondaryColor: string
  logo?: string
  mode: "CHAT" | "VOICE" | "HYBRID"
}

export default function EmbedChatbot({ params }: { params: { chatbotId: string } }) {
  const [chatbot, setChatbot] = useState<ChatbotConfig | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    loadChatbot()
    initializeSpeechRecognition()
  }, [params.chatbotId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatbot = async () => {
    try {
      const response = await fetch(`/api/chatbots/${params.chatbotId}`)
      if (response.ok) {
        const data = await response.json()
        setChatbot(data)
        
        // Begrüßungsnachricht hinzufügen
        const welcomeMessage: Message = {
          id: `welcome_${Date.now()}`,
          type: "bot",
          content: data.welcomeMessage,
          timestamp: new Date().toISOString()
        }
        setMessages([welcomeMessage])
      }
    } catch (error) {
      console.error("Fehler beim Laden des Chatbots:", error)
    }
  }

  const initializeSpeechRecognition = () => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = "de-DE"

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || !chatbot) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: "user",
      content: inputMessage,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: inputMessage,
          chatbotId: chatbot.id,
          conversationId,
          visitorId: `visitor_${Date.now()}`
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        const botMessage: Message = {
          id: data.messageId,
          type: "bot",
          content: data.response,
          timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, botMessage])
        setConversationId(data.conversationId)

        // Text-to-Speech für Voice-Modus
        if (chatbot.mode === "VOICE" || chatbot.mode === "HYBRID") {
          speakText(data.response)
        }
      }
    } catch (error) {
      console.error("Fehler beim Senden der Nachricht:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const speakText = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = "de-DE"
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
  }

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!chatbot) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white shadow-lg rounded-lg overflow-hidden max-w-sm mx-auto">
      {/* Header */}
      <div 
        className="p-4 text-white flex items-center justify-between"
        style={{ backgroundColor: chatbot.primaryColor }}
      >
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            {chatbot.logo ? (
              <AvatarImage src={chatbot.logo} alt={chatbot.name} />
            ) : (
              <AvatarFallback className="bg-white/20">
                <Bot className="h-6 w-6" />
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h3 className="font-semibold">{chatbot.chatTitle}</h3>
            <p className="text-xs opacity-90">Online</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMinimized(!isMinimized)}
          className="text-white hover:bg-white/20"
        >
          {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </Button>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.type === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-slate-900 shadow-sm"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex items-center space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nachricht eingeben..."
                className="flex-1"
                disabled={isLoading}
              />
              
              {(chatbot.mode === "VOICE" || chatbot.mode === "HYBRID") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isListening ? stopListening : startListening}
                  className={isListening ? "bg-red-100 border-red-300" : ""}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
              )}
              
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="sm"
                style={{ backgroundColor: chatbot.primaryColor }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}