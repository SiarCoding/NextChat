"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bot,
  Play,
  Save,
  Globe,
  Upload,
  Loader2,
  MessageSquare,
  Mic,
  FileText,
  Trash2
} from "lucide-react"
import LiveTesting from "@/components/dashboard/live-testing"
import { ChatPreview } from "./chat-preview"
import { useToast } from "@/hooks/use-toast"

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

interface BotConfiguratorProps {
  botConfig: ChatbotConfig
  setBotConfig: React.Dispatch<React.SetStateAction<ChatbotConfig>>
  selectedBot: string | null
  isTesting: boolean // Add isTesting prop
  setIsCreating: (isCreating: boolean) => void
  setIsTesting: (isTesting: boolean) => void
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  onSaveBot: () => void
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onPdfUpload: (files: File[]) => Promise<void>
}

export function BotConfigurator({
  botConfig,
  setBotConfig,
  selectedBot,
  isTesting, // Destructure isTesting prop
  setIsCreating,
  setIsTesting,
  isLoading,
  setIsLoading,
  onSaveBot,
  onFileUpload,
  onPdfUpload,
}: BotConfiguratorProps) {
  const { toast } = useToast()

  const handleWebsiteScan = async () => {
    if (!botConfig.websiteUrl || !botConfig.websiteUrl.trim().startsWith('http')) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine gültige URL ein (beginnend mit http:// oder https://)",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/website-scanner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: botConfig.websiteUrl })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Fehler beim Scannen der Website");
      }

      const data = await response.json();

      // Extrahierten Text zur Wissensbasis hinzufügen
      setBotConfig({
        ...botConfig,
        knowledgeBase: botConfig.knowledgeBase ?
          `${botConfig.knowledgeBase}\n\n--- Inhalte von ${botConfig.websiteUrl} ---\n${data.textContent}` :
          `--- Inhalte von ${botConfig.websiteUrl} ---\n${data.textContent}`
      });

      toast({
        title: "Erfolg",
        description: `Website gescannt und ${data.extractedChars.toLocaleString()} Zeichen extrahiert`
      });

    } catch (error) {
      console.error('Website scan error:', error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Fehler beim Scannen der Website",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {selectedBot ? "Chatbot bearbeiten" : "Neuen Chatbot erstellen"}
          </h1>
          <p className="text-slate-600 mt-1">
            Gestalten Sie Ihren Chatbot mit dem Baukastensystem
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsCreating(false)}>
            Zurück
          </Button>
          <Button onClick={() => setIsTesting(true)}>
            <Play className="w-4 h-4 mr-2" />
            Live Test
          </Button>
          <Button onClick={onSaveBot} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isLoading ? "Speichert..." : "Speichern"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Grundlagen</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="behavior">Verhalten</TabsTrigger>
              <TabsTrigger value="knowledge">Wissen</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Grundeinstellungen</CardTitle>
                  <CardDescription>
                    Name, Beschreibung und Modus Ihres Chatbots
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={botConfig.name}
                      onChange={(e) => setBotConfig({...botConfig, name: e.target.value})}
                      placeholder="z.B. Vertriebs-Bot"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Beschreibung</Label>
                    <Textarea
                      id="description"
                      value={botConfig.description}
                      onChange={(e) => setBotConfig({...botConfig, description: e.target.value})}
                      placeholder="Kurze Beschreibung des Chatbot-Zwecks"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mode">Modus</Label>
                    <Select value={botConfig.mode} onValueChange={(value) => setBotConfig({...botConfig, mode: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CHAT">
                          <div className="flex items-center">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Chat-Modus
                          </div>
                        </SelectItem>
                        <SelectItem value="VOICE">
                          <div className="flex items-center">
                            <Mic className="w-4 h-4 mr-2" />
                            Live-Speaking
                          </div>
                        </SelectItem>
                        <SelectItem value="HYBRID">
                          <div className="flex items-center">
                            <Bot className="w-4 h-4 mr-2" />
                            Hybrid (Chat + Voice)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="design" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Design & Branding</CardTitle>
                  <CardDescription>
                    Passen Sie das Aussehen an Ihr Branding an
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
                          value={botConfig.primaryColor}
                          onChange={(e) => setBotConfig({...botConfig, primaryColor: e.target.value})}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={botConfig.primaryColor}
                          onChange={(e) => setBotConfig({...botConfig, primaryColor: e.target.value})}
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
                          value={botConfig.secondaryColor}
                          onChange={(e) => setBotConfig({...botConfig, secondaryColor: e.target.value})}
                          className="w-12 h-10 rounded border"
                        />
                        <Input
                          value={botConfig.secondaryColor}
                          onChange={(e) => setBotConfig({...botConfig, secondaryColor: e.target.value})}
                          placeholder="#6b7280"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="chatTitle">Chat-Titel</Label>
                    <Input
                      id="chatTitle"
                      value={botConfig.chatTitle}
                      onChange={(e) => setBotConfig({...botConfig, chatTitle: e.target.value})}
                      placeholder="Chat Assistant"
                    />
                  </div>
                  <div>
                    <Label htmlFor="logo">Logo URL</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="logo"
                        value={botConfig.logo}
                        onChange={(e) => setBotConfig({...botConfig, logo: e.target.value})}
                        placeholder="https://example.com/logo.png"
                      />
                      <Button variant="outline" size="sm" onClick={() => document.getElementById('logo-upload')?.click()}>
                        <Upload className="w-4 h-4" />
                      </Button>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={onFileUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="behavior" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Verhalten & Persönlichkeit</CardTitle>
                  <CardDescription>
                    Definieren Sie, wie Ihr Chatbot kommuniziert
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="welcomeMessage">Begrüßungsnachricht</Label>
                    <Textarea
                      id="welcomeMessage"
                      value={botConfig.welcomeMessage}
                      onChange={(e) => setBotConfig({...botConfig, welcomeMessage: e.target.value})}
                      placeholder="Hallo! Wie kann ich Ihnen helfen?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="personality">Persönlichkeit</Label>
                    <Input
                      id="personality"
                      value={botConfig.personality}
                      onChange={(e) => setBotConfig({...botConfig, personality: e.target.value})}
                      placeholder="freundlich und hilfsbereit"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="knowledge" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Wissensbasis</CardTitle>
                  <CardDescription>
                    Fügen Sie Inhalte hinzu, die Ihr Chatbot kennen soll
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="websiteUrl">Website URL scannen</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="websiteUrl"
                        value={botConfig.websiteUrl}
                        onChange={(e) => setBotConfig({...botConfig, websiteUrl: e.target.value})}
                        placeholder="https://ihre-website.de"
                      />
                      <Button
                        variant="outline"
                        onClick={handleWebsiteScan}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Globe className="w-4 h-4 mr-2" />
                        )}
                        Scannen
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="knowledgeBase">Zusätzliches Wissen</Label>
                    <Textarea
                      id="knowledgeBase"
                      value={botConfig.knowledgeBase}
                      onChange={(e) => setBotConfig({...botConfig, knowledgeBase: e.target.value})}
                      placeholder="Fügen Sie hier zusätzliche Informationen hinzu..."
                      rows={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>PDF-Dokumente</Label>
                    <div
                      className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors"
                      onClick={() => document.getElementById('pdf-upload')?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.add('border-emerald-300', 'bg-emerald-50/30');
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.remove('border-emerald-300', 'bg-emerald-50/30');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.currentTarget.classList.remove('border-emerald-300', 'bg-emerald-50/30');

                        const files = Array.from(e.dataTransfer.files);
                        if (files.length > 0) {
                          const pdfFiles = files.filter(file => file.type === 'application/pdf');
                          if (pdfFiles.length > 0) {
                            onPdfUpload(pdfFiles);
                          } else {
                            toast({
                              title: "Fehler",
                              description: "Bitte nur PDF-Dateien hochladen",
                              variant: "destructive"
                            });
                          }
                        }
                      }}
                    >
                      <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">PDF-Dateien hier ablegen oder klicken zum Hochladen</p>
                    </div>
                    <input
                      id="pdf-upload"
                      type="file"
                      accept="application/pdf"
                      multiple
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          onPdfUpload(Array.from(e.target.files));
                        }
                      }}
                      className="hidden"
                    />

                    {/* Anzeige der hochgeladenen PDF-Dokumente */}
                    {botConfig.pdfDocuments && botConfig.pdfDocuments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Hochgeladene Dokumente:</h4>
                        <div className="space-y-2">
                          {botConfig.pdfDocuments.map((pdfUrl, index) => {
                            const filename = pdfUrl.split('/').pop() || `Dokument ${index + 1}`;
                            return (
                              <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-md border border-slate-200">
                                <div className="flex items-center">
                                  <FileText className="w-4 h-4 text-slate-500 mr-2" />
                                  <span className="text-sm truncate" style={{ maxWidth: '200px' }}>
                                    {filename}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setBotConfig((prev: ChatbotConfig) => ({
                                      ...prev,
                                      pdfDocuments: prev.pdfDocuments.filter((url: string) => url !== pdfUrl),
                                    }));
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-500" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
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
                <Bot className="w-5 h-5 mr-2" />
                Live-Vorschau
              </CardTitle>
              <CardDescription>
                So wird Ihr Chatbot aussehen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChatPreview botConfig={botConfig} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* LiveTesting Komponente */}
      <LiveTesting
        isOpen={isTesting}
        onClose={() => setIsTesting(false)}
        chatbotConfig={botConfig}
        chatbotId={selectedBot || undefined}
      />
    </div>
  )
}
