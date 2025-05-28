"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Mic, Bot } from "lucide-react"

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

interface TemplateCardProps {
  template: Template
  onClick: (template: Template) => void
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  return (
    <Card className="cursor-pointer hover:border-emerald-300 transition-colors" onClick={() => onClick(template)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          <Badge variant="outline">{template.category}</Badge>
        </div>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            {template.mode === "CHAT" && <MessageSquare className="w-4 h-4 mr-2" />}
            {template.mode === "VOICE" && <Mic className="w-4 h-4 mr-2" />}
            {template.mode === "HYBRID" && <Bot className="w-4 h-4 mr-2" />}
            <span>{template.mode}</span>
          </div>
          {template.industry && (
            <div className="text-sm text-slate-600">
              <strong>Branche:</strong> {template.industry}
            </div>
          )}
          {template.useCase && (
            <div className="text-sm text-slate-600">
              <strong>Anwendung:</strong> {template.useCase}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
