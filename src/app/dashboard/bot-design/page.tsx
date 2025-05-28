"use client"

import { useState, useEffect } from "react"
import {
  Bot,
  Plus,
  Settings,
  Palette,
  MessageSquare,
  Mic,
  Play,
  Save,
  Copy,
  Edit,
  Trash2,
  Globe,
  Upload,
  Link as LinkIcon,
  Loader2,
  FileText
} from "lucide-react"
import LiveTesting from "@/components/dashboard/live-testing"
import { useToast } from "@/hooks/use-toast"
import { BotList } from "@/components/dashboard/bot-design/bot-list"
import { TemplateDialog } from "@/components/dashboard/bot-design/template-dialog"
import { BotConfigurator } from "@/components/dashboard/bot-design/bot-configurator"

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

export default function BotDesignPage() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedBot, setSelectedBot] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const { toast } = useToast()

  const [botConfig, setBotConfig] = useState({
    name: "",
    description: "",
    mode: "CHAT",
    primaryColor: "#10b981",
    secondaryColor: "#6b7280",
    fontFamily: "Inter",
    logo: "",
    chatTitle: "Chat Assistant",
    welcomeMessage: "Hallo! Wie kann ich Ihnen helfen?",
    personality: "freundlich und hilfsbereit",
    websiteUrl: "",
    knowledgeBase: "",
    pdfDocuments: [] as string[] // URLs zu hochgeladenen PDFs
  })

  useEffect(() => {
    loadChatbots()
    loadTemplates()
  }, [])

  const loadChatbots = async () => {
    try {
      const response = await fetch('/api/chatbots')
      if (response.ok) {
        const data = await response.json()
        setChatbots(data)
      }
    } catch (error) {
      console.error('Error loading chatbots:', error)
      toast({
        title: "Fehler",
        description: "Chatbots konnten nicht geladen werden",
        variant: "destructive"
      })
    }
  }

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const handleCreateNew = () => {
    setSelectedBot(null)
    setIsCreating(true)
    setBotConfig({
      name: "",
      description: "",
      mode: "CHAT",
      primaryColor: "#10b981",
      secondaryColor: "#6b7280",
      fontFamily: "Inter",
      logo: "",
      chatTitle: "Chat Assistant",
      welcomeMessage: "Hallo! Wie kann ich Ihnen helfen?",
      personality: "freundlich und hilfsbereit",
      websiteUrl: "",
      knowledgeBase: "",
      pdfDocuments: []
    })
  }

  const handleUseTemplate = (template: Template) => {
    setBotConfig({
      name: template.name,
      description: template.description,
      mode: template.mode,
      primaryColor: template.primaryColor,
      secondaryColor: "#6b7280",
      fontFamily: "Inter",
      logo: "",
      chatTitle: template.chatTitle,
      welcomeMessage: template.welcomeMessage,
      personality: template.personality,
      websiteUrl: "",
      knowledgeBase: template.systemPrompt,
      pdfDocuments: []
    })
    setShowTemplates(false)
    setIsCreating(true)
  }

  const handleEditBot = (bot: Chatbot) => {
    setSelectedBot(bot.id)
    setIsCreating(true)
    setBotConfig({
      name: bot.name,
      description: bot.description,
      mode: bot.mode,
      primaryColor: bot.primaryColor,
      secondaryColor: bot.secondaryColor,
      fontFamily: "Inter",
      logo: bot.logo || "",
      chatTitle: bot.chatTitle,
      welcomeMessage: bot.welcomeMessage,
      personality: bot.personality,
      websiteUrl: bot.websiteUrl || "",
      knowledgeBase: bot.knowledgeBase || "",
      pdfDocuments: bot.pdfDocuments || []
    })
  }

  const handleSaveBot = async () => {
    if (!botConfig.name.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Namen für den Chatbot ein",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const url = selectedBot ? `/api/chatbots?id=${selectedBot}` : '/api/chatbots'
      const method = selectedBot ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(botConfig)
      })

      if (response.ok) {
        const savedBot = await response.json()
        toast({
          title: "Erfolg",
          description: selectedBot ? "Chatbot aktualisiert" : "Chatbot erstellt"
        })
        setIsCreating(false)
        loadChatbots()
      } else {
        const error = await response.json()
        toast({
          title: "Fehler",
          description: error.error || "Fehler beim Speichern",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Speichern",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBot = async (botId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Chatbot löschen möchten?')) {
      return
    }

    try {
      const response = await fetch(`/api/chatbots?id=${botId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "Erfolg",
          description: "Chatbot gelöscht"
        })
        loadChatbots()
      } else {
        toast({
          title: "Fehler",
          description: "Fehler beim Löschen",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Löschen",
        variant: "destructive"
      })
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setBotConfig({ ...botConfig, logo: data.url })
        toast({
          title: "Erfolg",
          description: "Logo hochgeladen"
        })
      } else {
        toast({
          title: "Fehler",
          description: "Fehler beim Hochladen",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Hochladen",
        variant: "destructive"
      })
    }
  }

  const handlePdfUpload = async (files: File[]) => {
    if (files.length === 0) return

    setIsLoading(true)

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(`Fehler beim Hochladen von ${file.name}`)
        }

        return await response.json()
      })

      const results = await Promise.all(uploadPromises)

      // URLs der hochgeladenen PDFs zum botConfig hinzufügen
      const pdfUrls = results.map(result => result.url)

      // Aktualisiere den Chatbot mit den PDF-URLs
      setBotConfig(prev => ({
        ...prev,
        pdfDocuments: [...prev.pdfDocuments || [], ...pdfUrls]
      }))

      toast({
        title: "Erfolg",
        description: `${files.length} PDF-Dokument${files.length > 1 ? 'e' : ''} hochgeladen`
      })

    } catch (error) {
      console.error('PDF upload error:', error)
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Fehler beim PDF-Upload",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }


  if (isCreating) {
    return (
      <BotConfigurator
        botConfig={botConfig}
        setBotConfig={setBotConfig}
        selectedBot={selectedBot}
        isTesting={isTesting}
        setIsCreating={setIsCreating}
        setIsTesting={setIsTesting}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        onSaveBot={handleSaveBot}
        onFileUpload={handleFileUpload}
        onPdfUpload={handlePdfUpload}
      />
    )
  }

  return (
    <>
      <BotList
        chatbots={chatbots}
        templates={templates}
        onEditBot={handleEditBot}
        onDeleteBot={handleDeleteBot}
        onCreateNew={handleCreateNew}
        onUseTemplate={handleUseTemplate}
        showTemplates={showTemplates}
        setShowTemplates={setShowTemplates}
      />
      <TemplateDialog
        templates={templates}
        onUseTemplate={handleUseTemplate}
        open={showTemplates}
        onOpenChange={setShowTemplates}
      />
       {/* LiveTesting Komponente */}
       <LiveTesting
        isOpen={isTesting}
        onClose={() => setIsTesting(false)}
        chatbotConfig={botConfig}
        chatbotId={selectedBot || undefined}
      />
    </>
  )
}
