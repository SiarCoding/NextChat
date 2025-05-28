"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TemplateCard } from "./template-card"

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

interface TemplateDialogProps {
  templates: Template[]
  onUseTemplate: (template: Template) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TemplateDialog({ templates, onUseTemplate, open, onOpenChange }: TemplateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vorlage auswählen</DialogTitle>
          <DialogDescription>
            Starten Sie schnell mit einer vorgefertigten Vorlage
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} onClick={onUseTemplate} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
