"use client"

import { Bot, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatbotConfig {
  name: string
  description: string
  mode: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  logo: string
  chatTitle: string
  welcomeMessage: string
  personality: string
  websiteUrl: string
  knowledgeBase: string
  pdfDocuments: string[]
}

interface ChatPreviewProps {
  botConfig: ChatbotConfig
}

export function ChatPreview({ botConfig }: ChatPreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg max-w-sm mx-auto">
      <div
        className="p-4 rounded-t-lg text-white"
        style={{ backgroundColor: botConfig.primaryColor }}
      >
        <div className="flex items-center space-x-2">
          {botConfig.logo ? (
            <img src={botConfig.logo} alt="Logo" className="w-8 h-8 rounded-full" />
          ) : (
            <Bot className="w-8 h-8" />
          )}
          <div>
            <h3 className="font-medium">{botConfig.chatTitle || "Chat Assistant"}</h3>
            <p className="text-xs opacity-90">Online</p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="bg-slate-100 rounded-lg p-3 max-w-[80%]">
          <p className="text-sm">{botConfig.welcomeMessage || "Hallo! Wie kann ich Ihnen helfen?"}</p>
        </div>
        <div className="bg-blue-500 text-white rounded-lg p-3 max-w-[80%] ml-auto">
          <p className="text-sm">Hallo, ich interessiere mich für Ihre Dienstleistungen.</p>
        </div>
        <div className="bg-slate-100 rounded-lg p-3 max-w-[80%]">
          <p className="text-sm">Das freut mich zu hören! Gerne helfe ich Ihnen weiter. Können Sie mir mehr über Ihre Anforderungen erzählen?</p>
        </div>
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Nachricht eingeben..."
            className="flex-1 p-2 border rounded-lg text-sm"
            disabled
          />
          <Button size="sm" style={{ backgroundColor: botConfig.primaryColor }}>
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
