"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Play,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  MessageSquare,
  Bot,
  User,
  Loader2
} from "lucide-react"

interface Message {
  id: string
  type: "user" | "bot"
  content: string
  timestamp: string
  isVoice?: boolean
}

interface LiveTestingProps {
  isOpen: boolean
  onClose: () => void
  chatbotConfig: {
    name: string
    mode: string
    primaryColor: string
    chatTitle: string
    welcomeMessage: string
    personality: string
    logo?: string
    knowledgeBase?: string
    pdfDocuments?: string[]
    websiteUrl?: string
  }
  chatbotId?: string
}

export default function LiveTesting({ 
  isOpen, 
  onClose, 
  chatbotConfig, 
  chatbotId 
}: LiveTestingProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    if (isOpen) {
      // Initialisiere Chat mit Willkommensnachricht
      const welcomeMessage: Message = {
        id: `welcome_${Date.now()}`,
        type: "bot",
        content: chatbotConfig.welcomeMessage,
        timestamp: new Date().toISOString()
      }
      setMessages([welcomeMessage])
      setConversationId(null)
    }
  }, [isOpen, chatbotConfig.welcomeMessage])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = async (content: string, isVoice = false) => {
    if (!content.trim() || !chatbotId) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      type: "user",
      content,
      timestamp: new Date().toISOString(),
      isVoice
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: content,
          chatbotId,
          conversationId,
          visitorId: `test_visitor_${Date.now()}`,
          isVoice,
          // Zusätzliche Informationen für das Live-Testing
          testMode: true,
          config: {
            knowledgeBase: chatbotConfig.knowledgeBase,
            pdfDocuments: chatbotConfig.pdfDocuments,
            websiteUrl: chatbotConfig.websiteUrl,
            personality: chatbotConfig.personality
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        const botMessage: Message = {
          id: `bot_${Date.now()}`,
          type: "bot",
          content: data.response,
          timestamp: new Date().toISOString(),
          isVoice
        }

        setMessages(prev => [...prev, botMessage])
        
        if (!conversationId && data.conversationId) {
          setConversationId(data.conversationId)
        }

        // Text-to-Speech für Voice-Modus
        if ((chatbotConfig.mode === "VOICE" || chatbotConfig.mode === "HYBRID") && isVoice) {
          await playTextToSpeech(data.response)
        }
      } else {
        const errorData = await response.json()
        const errorMessage: Message = {
          id: `error_${Date.now()}`,
          type: "bot",
          content: `Fehler: ${errorData.error || 'Unbekannter Fehler'}`,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        type: "bot",
        content: "Entschuldigung, es gab einen Verbindungsfehler.",
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const playTextToSpeech = async (text: string) => {
    try {
      setIsSpeaking(true)
      const response = await fetch('/api/voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        
        audio.onended = () => {
          setIsSpeaking(false)
          URL.revokeObjectURL(audioUrl)
        }
        
        await audio.play()
      }
    } catch (error) {
      console.error('TTS error:', error)
      setIsSpeaking(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await processVoiceInput(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Recording error:', error)
      alert('Mikrofon-Zugriff nicht möglich')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processVoiceInput = async (audioBlob: Blob) => {
    // Hier würde normalerweise Speech-to-Text implementiert werden
    // Für Demo-Zwecke verwenden wir einen Platzhalter-Text
    const transcribedText = "Hallo, das ist eine Spracheingabe (Demo)"
    await sendMessage(transcribedText, true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim()) {
      sendMessage(inputMessage)
      setInputMessage("")
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center">
            <Play className="w-5 h-5 mr-2 text-emerald-600" />
            Live Testing - {chatbotConfig.name}
          </DialogTitle>
          <DialogDescription>
            Testen Sie Ihren Chatbot in Echtzeit
          </DialogDescription>
        </DialogHeader>

        {/* Chat Interface */}
        <div className="flex flex-col h-[500px]">
          {/* Chat Header - Angepasst an die Vorschau */}
          <div 
            className="p-4 rounded-t-lg text-white"
            style={{ backgroundColor: chatbotConfig.primaryColor }}
          >
            <div className="flex items-center space-x-2">
              {chatbotConfig.logo ? (
                <img src={chatbotConfig.logo} alt="Logo" className="w-8 h-8 rounded-full" />
              ) : (
                <Bot className="w-8 h-8" />
              )}
              <div>
                <h3 className="font-medium">{chatbotConfig.chatTitle || "Chat Assistant"}</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
              
              {/* Funktionsabzeichen für Sprache beibehalten */}
              <div className="ml-auto flex space-x-2">
                {isSpeaking && (
                  <Badge variant="secondary" className="text-xs">
                    <Volume2 className="w-3 h-3 mr-1" />
                    Spricht...
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
                  {chatbotConfig.mode === "CHAT" && <MessageSquare className="w-3 h-3 mr-1" />}
                  {chatbotConfig.mode === "VOICE" && <Mic className="w-3 h-3 mr-1" />}
                  {chatbotConfig.mode === "HYBRID" && <Bot className="w-3 h-3 mr-1" />}
                  {chatbotConfig.mode}
                </Badge>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex items-start max-w-[80%] ${
                  message.type === "user" ? "flex-row-reverse ml-auto" : ""
                }`}>
                  {/* Design angepasst an die Vorschau */}
                  <div className={`rounded-lg p-3 ${
                    message.type === "user"
                      ? "bg-blue-500 text-white" /* Benutzer-Nachrichten blau */
                      : "bg-slate-100 text-slate-900" /* Bot-Nachrichten grau */
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Zusätzliche Informationen (Zeitstempel, Sprachindikator) beibehalten */}
                    <div className="flex items-center justify-between mt-1 text-xs">
                      <span className={
                        message.type === "user" ? "text-white/70" : "text-slate-500"
                      }>
                        {formatTime(message.timestamp)}
                      </span>
                      {message.isVoice && (
                        <Mic className="w-3 h-3 ml-1" color={
                          message.type === "user" ? "white" : "gray"
                        } />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start max-w-[80%]">
                <div className="rounded-lg p-3 bg-slate-100 text-slate-900">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Angepasst an die Vorschau */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nachricht eingeben..."
                disabled={isLoading}
                className="flex-1 p-2 border rounded-lg text-sm"
              />
              
              {/* Voice-Button beibehalten für Funktionalität */}
              {(chatbotConfig.mode === "VOICE" || chatbotConfig.mode === "HYBRID") && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                  className={isRecording ? "bg-red-100 border-red-300" : ""}
                >
                  {isRecording ? (
                    <MicOff className="w-4 h-4 text-red-600" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
              )}
              
              <Button 
                type="submit" 
                disabled={!inputMessage.trim() || isLoading}
                style={{ backgroundColor: chatbotConfig.primaryColor }}
                size="sm"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}