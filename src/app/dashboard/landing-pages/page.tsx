"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Globe,
  Plus,
  Settings,
  Palette,
  Mic,
  Play,
  Save,
  Copy,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Users,
  MessageSquare
} from "lucide-react"

const existingPages = [
  {
    id: 1,
    name: "Immobilien Beratung",
    description: "Live Assistant für Immobilienkunden",
    url: "immobilien-beratung",
    status: "active",
    visitors: 1234,
    chats: 89,
    primaryColor: "#10b981"
  },
  {
    id: 2,
    name: "IT Support Live",
    description: "Technischer Support mit Sprachassistent",
    url: "it-support-live",
    status: "active",
    visitors: 567,
    chats: 23,
    primaryColor: "#3b82f6"
  },
  {
    id: 3,
    name: "Verkaufs Demo",
    description: "Produktdemo mit Live-Assistent",
    url: "verkaufs-demo",
    status: "draft",
    visitors: 0,
    chats: 0,
    primaryColor: "#f59e0b"
  }
]

export default function LandingPagesPage() {
  const [selectedPage, setSelectedPage] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const [pageConfig, setPageConfig] = useState({
    name: "",
    description: "",
    title: "Live Assistant",
    subtitle: "Sprechen Sie direkt mit unserem KI-Assistenten",
    primaryColor: "#10b981",
    secondaryColor: "#6b7280",
    fontFamily: "Inter",
    logo: "",
    assistantName: "AI Assistant",
    assistantAvatar: "",
    welcomeMessage: "Hallo! Ich bin Ihr persönlicher Assistent. Wie kann ich Ihnen helfen?",
    backgroundImage: "",
    ctaText: "Jetzt sprechen",
    features: ["24/7 verfügbar", "Sofortige Antworten", "Persönliche Beratung"]
  })

  const handleCreateNew = () => {
    setSelectedPage(null)
    setIsCreating(true)
    setPageConfig({
      name: "",
      description: "",
      title: "Live Assistant",
      subtitle: "Sprechen Sie direkt mit unserem KI-Assistenten",
      primaryColor: "#10b981",
      secondaryColor: "#6b7280",
      fontFamily: "Inter",
      logo: "",
      assistantName: "AI Assistant",
      assistantAvatar: "",
      welcomeMessage: "Hallo! Ich bin Ihr persönlicher Assistent. Wie kann ich Ihnen helfen?",
      backgroundImage: "",
      ctaText: "Jetzt sprechen",
      features: ["24/7 verfügbar", "Sofortige Antworten", "Persönliche Beratung"]
    })
  }

  const LandingPagePreview = () => (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div 
        className="relative h-96 flex items-center justify-center text-white"
        style={{ 
          backgroundColor: pageConfig.primaryColor,
          backgroundImage: pageConfig.backgroundImage ? `url(${pageConfig.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative text-center z-10 px-6">
          {pageConfig.logo && (
            <img src={pageConfig.logo} alt="Logo" className="w-16 h-16 mx-auto mb-4 rounded-full" />
          )}
          <h1 className="text-4xl font-bold mb-4">{pageConfig.title || "Live Assistant"}</h1>
          <p className="text-xl mb-6 opacity-90">{pageConfig.subtitle || "Sprechen Sie direkt mit unserem KI-Assistenten"}</p>
          
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Mic className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">{pageConfig.assistantName || "AI Assistant"}</h3>
              <p className="text-sm opacity-90">Bereit zu helfen</p>
            </div>
          </div>
          
          <Button 
            size="lg" 
            className="bg-white text-slate-900 hover:bg-slate-100"
          >
            <Mic className="w-5 h-5 mr-2" />
            {pageConfig.ctaText || "Jetzt sprechen"}
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          {pageConfig.features.map((feature, index) => (
            <div key={index} className="p-3 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-700">{feature}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (isCreating) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {selectedPage ? "Landing Page bearbeiten" : "Neue Landing Page erstellen"}
            </h1>
            <p className="text-slate-600 mt-1">
              Erstellen Sie eine Landing Page mit Live-Sprachassistent
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Zurück
            </Button>
            <Button onClick={() => setIsTesting(true)}>
              <Play className="w-4 h-4 mr-2" />
              Vorschau
            </Button>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Speichern
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="content" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Inhalt</TabsTrigger>
                <TabsTrigger value="design">Design</TabsTrigger>
                <TabsTrigger value="assistant">Assistent</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Seiten-Inhalt</CardTitle>
                    <CardDescription>
                      Grundlegende Informationen für Ihre Landing Page
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Seitenname (intern)</Label>
                      <Input
                        id="name"
                        value={pageConfig.name}
                        onChange={(e) => setPageConfig({...pageConfig, name: e.target.value})}
                        placeholder="z.B. Immobilien Beratung"
                      />
                    </div>
                    <div>
                      <Label htmlFor="title">Haupttitel</Label>
                      <Input
                        id="title"
                        value={pageConfig.title}
                        onChange={(e) => setPageConfig({...pageConfig, title: e.target.value})}
                        placeholder="Live Assistant"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subtitle">Untertitel</Label>
                      <Input
                        id="subtitle"
                        value={pageConfig.subtitle}
                        onChange={(e) => setPageConfig({...pageConfig, subtitle: e.target.value})}
                        placeholder="Sprechen Sie direkt mit unserem KI-Assistenten"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ctaText">Call-to-Action Text</Label>
                      <Input
                        id="ctaText"
                        value={pageConfig.ctaText}
                        onChange={(e) => setPageConfig({...pageConfig, ctaText: e.target.value})}
                        placeholder="Jetzt sprechen"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="design" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Design & Branding</CardTitle>
                    <CardDescription>
                      Passen Sie das Aussehen Ihrer Landing Page an
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primaryColor">Primärfarbe</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            id="primaryColor"
                            value={pageConfig.primaryColor}
                            onChange={(e) => setPageConfig({...pageConfig, primaryColor: e.target.value})}
                            className="w-12 h-10 rounded border"
                          />
                          <Input
                            value={pageConfig.primaryColor}
                            onChange={(e) => setPageConfig({...pageConfig, primaryColor: e.target.value})}
                            placeholder="#10b981"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="secondaryColor">Sekundärfarbe</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            id="secondaryColor"
                            value={pageConfig.secondaryColor}
                            onChange={(e) => setPageConfig({...pageConfig, secondaryColor: e.target.value})}
                            className="w-12 h-10 rounded border"
                          />
                          <Input
                            value={pageConfig.secondaryColor}
                            onChange={(e) => setPageConfig({...pageConfig, secondaryColor: e.target.value})}
                            placeholder="#6b7280"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="logo">Logo URL</Label>
                      <Input
                        id="logo"
                        value={pageConfig.logo}
                        onChange={(e) => setPageConfig({...pageConfig, logo: e.target.value})}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div>
                      <Label htmlFor="backgroundImage">Hintergrundbild URL</Label>
                      <Input
                        id="backgroundImage"
                        value={pageConfig.backgroundImage}
                        onChange={(e) => setPageConfig({...pageConfig, backgroundImage: e.target.value})}
                        placeholder="https://example.com/background.jpg"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="assistant" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Assistent-Konfiguration</CardTitle>
                    <CardDescription>
                      Einstellungen für den Live-Sprachassistenten
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="assistantName">Assistent Name</Label>
                      <Input
                        id="assistantName"
                        value={pageConfig.assistantName}
                        onChange={(e) => setPageConfig({...pageConfig, assistantName: e.target.value})}
                        placeholder="AI Assistant"
                      />
                    </div>
                    <div>
                      <Label htmlFor="welcomeMessage">Begrüßungsnachricht</Label>
                      <Textarea
                        id="welcomeMessage"
                        value={pageConfig.welcomeMessage}
                        onChange={(e) => setPageConfig({...pageConfig, welcomeMessage: e.target.value})}
                        placeholder="Hallo! Ich bin Ihr persönlicher Assistent. Wie kann ich Ihnen helfen?"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="assistantAvatar">Avatar URL</Label>
                      <Input
                        id="assistantAvatar"
                        value={pageConfig.assistantAvatar}
                        onChange={(e) => setPageConfig({...pageConfig, assistantAvatar: e.target.value})}
                        placeholder="https://example.com/avatar.png"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview */}
          <div>
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Live-Vorschau
                </CardTitle>
                <CardDescription>
                  So wird Ihre Landing Page aussehen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="scale-75 origin-top">
                  <LandingPagePreview />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Modal */}
        <Dialog open={isTesting} onOpenChange={setIsTesting}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Landing Page Vorschau</DialogTitle>
              <DialogDescription>
                Vollständige Vorschau Ihrer Landing Page
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <LandingPagePreview />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Landing Pages</h1>
          <p className="text-slate-600 mt-1">
            Erstellen Sie Landing Pages mit Live-Sprachassistenten
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Neue Landing Page
        </Button>
      </div>

      {/* Existing Pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {existingPages.map((page) => (
          <Card key={page.id} className="bg-white border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: page.primaryColor }}
                  ></div>
                  <CardTitle className="text-lg">{page.name}</CardTitle>
                </div>
                <Badge variant={page.status === "active" ? "default" : "secondary"}>
                  {page.status === "active" ? "Aktiv" : "Entwurf"}
                </Badge>
              </div>
              <CardDescription>{page.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">URL:</span>
                  <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
                    /{page.url}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Besucher:</span>
                  <span className="font-medium">{page.visitors.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Gespräche:</span>
                  <span className="font-medium text-emerald-600">{page.chats}</span>
                </div>
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Bearbeiten
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Ansehen
                  </Button>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Stats
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