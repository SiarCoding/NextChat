"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Copy, Trash2, MessageSquare, Mic, Bot, FileText } from "lucide-react"
import { Dialog } from "@/components/ui/dialog" // Import Dialog for TemplateDialog

interface Chatbot {
  id: string
  name: string
  description: string
  mode: string
  isActive: boolean
  primaryColor: string
  secondaryColor: string
  chatTitle: string
  welcomeMessage: string
  personality: string
  websiteUrl?: string
  knowledgeBase?: string
  logo?: string
  totalChats: number
  leadsGenerated: number
  embedCode?: string
  pdfDocuments?: string[]
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  mode: string
  primaryColor: string
  chatTitle: string
  welcomeMessage: string
  personality: string
  systemPrompt: string
  industry?: string
  useCase?: string
}

interface BotListProps {
  chatbots: Chatbot[]
  templates: Template[]
  onEditBot: (bot: Chatbot) => void
  onDeleteBot: (botId: string) => void
  onCreateNew: () => void
  onUseTemplate: (template: Template) => void
  showTemplates: boolean
  setShowTemplates: (show: boolean) => void
}

export function BotList({
  chatbots,
  templates,
  onEditBot,
  onDeleteBot,
  onCreateNew,
  onUseTemplate,
  showTemplates,
  setShowTemplates,
}: BotListProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bot Design</h1>
          <p className="text-slate-600 mt-1">
            Erstellen und verwalten Sie Ihre Chatbots
          </p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Neuen Bot erstellen
        </Button>
      </div>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        {/* DialogContent and its children will be in TemplateDialog component */}
      </Dialog>

      {/* Action Buttons */}
      <div className="flex space-x-4 mb-6">
        <Button onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Von Grund auf erstellen
        </Button>
        <Button variant="outline" onClick={() => setShowTemplates(true)}>
          <FileText className="w-4 h-4 mr-2" />
          Aus Vorlage erstellen
        </Button>
      </div>

      {/* Existing Bots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chatbots.map((bot) => (
          <Card key={bot.id} className="bg-white border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: bot.primaryColor }}
                  ></div>
                  <CardTitle className="text-lg">{bot.name}</CardTitle>
                </div>
                <Badge variant={bot.isActive ? "default" : "secondary"}>
                  {bot.isActive ? "Aktiv" : "Entwurf"}
                </Badge>
              </div>
              <CardDescription>{bot.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Modus:</span>
                  <div className="flex items-center">
                    {bot.mode === "CHAT" && <MessageSquare className="w-4 h-4 mr-1" />}
                    {bot.mode === "VOICE" && <Mic className="w-4 h-4 mr-1" />}
                    {bot.mode === "HYBRID" && <Bot className="w-4 h-4 mr-1" />}
                    <span>{bot.mode === "CHAT" ? "Chat" : bot.mode === "VOICE" ? "Voice" : "Hybrid"}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Gespräche:</span>
                  <span className="font-medium">{bot.totalChats.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Leads:</span>
                  <span className="font-medium text-emerald-600">{bot.leadsGenerated}</span>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => onEditBot(bot)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Bearbeiten
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(bot.embedCode || '')}>
                    <Copy className="w-4 h-4 mr-1" />
                    Code
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDeleteBot(bot.id)}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Löschen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
