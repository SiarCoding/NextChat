"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Zap,
  Plus,
  Settings,
  Check,
  X,
  Calendar,
  Database,
  Workflow,
  ExternalLink,
  Key,
  Globe,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Integration {
  id: string
  type: string
  name: string
  config: any
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const integrationCategories = [
  {
    id: "crm",
    name: "CRM Systeme",
    description: "Verbinden Sie Ihre Leads direkt mit Ihrem CRM",
    icon: Database,
    integrations: [
      {
        id: "hubspot",
        name: "HubSpot",
        description: "Leads automatisch in HubSpot erstellen",
        logo: "https://www.hubspot.com/hubfs/HubSpot_Logos/HubSpot-Inversed-Favicon.png",
        type: "HUBSPOT",
        features: ["Lead-Erstellung", "Contact-Sync", "Deal-Tracking"],
      },
      {
        id: "salesforce",
        name: "Salesforce",
        description: "Nahtlose Integration mit Salesforce CRM",
        logo: "https://c1.sfdcstatic.com/content/dam/web/en_us/www/images/nav/salesforce-cloud-logo-sm.png",
        type: "SALESFORCE",
        features: ["Lead-Management", "Opportunity-Tracking", "Custom Fields"],
      },
      {
        id: "pipedrive",
        name: "PipeDrive",
        description: "Verkaufspipeline automatisch befüllen",
        logo: "https://cdn.worldvectorlogo.com/logos/pipedrive.svg",
        type: "PIPEDRIVE",
        features: ["Pipeline-Management", "Activity-Tracking", "Deal-Automation"],
      },
      {
        id: "close",
        name: "Close CRM",
        description: "Leads direkt in Close CRM übertragen",
        logo: "https://close.com/static/img/close-logo.svg",
        type: "CLOSE_CRM",
        features: ["Lead-Import", "Call-Logging", "Email-Sync"],
      },
    ],
  },
  {
    id: "calendar",
    name: "Kalender",
    description: "Automatische Terminbuchungen",
    icon: Calendar,
    integrations: [
      {
        id: "google-calendar",
        name: "Google Calendar",
        description: "Termine direkt in Google Calendar buchen",
        logo: "https://calendar.google.com/googlecalendar/images/favicons_2020q4/calendar_31.ico",
        type: "GOOGLE_CALENDAR",
        features: ["Terminbuchung", "Verfügbarkeit", "Erinnerungen"],
      },
      {
        id: "microsoft-calendar",
        name: "Microsoft Calendar",
        description: "Integration mit Outlook Calendar",
        logo: "https://res.cdn.office.net/assets/mail/file-icon/png/calendar_16x16.png",
        type: "MICROSOFT_CALENDAR",
        features: ["Outlook-Integration", "Teams-Meetings", "Sync"],
      },
      {
        id: "calendly",
        name: "Calendly",
        description: "Nahtlose Calendly-Integration",
        logo: "https://calendly.com/favicon.ico",
        type: "CALENDLY",
        features: ["Booking-Links", "Availability", "Notifications"],
      },
    ],
  },
  {
    id: "automation",
    name: "Automatisierung",
    description: "Workflows und Automatisierungen",
    icon: Workflow,
    integrations: [
      {
        id: "zapier",
        name: "Zapier",
        description: "Verbinden Sie 5000+ Apps mit Zapier",
        logo: "https://cdn.zapier.com/storage/photos/9ec65c79de8ae54080c98384d4e7b9_2.png",
        type: "ZAPIER",
        features: ["5000+ Apps", "Workflows", "Triggers"],
      },
      {
        id: "make",
        name: "Make (Integromat)",
        description: "Erweiterte Automatisierungen",
        logo: "https://www.make.com/en/help/image/uuid-e8b0e4e8-7c8f-3c8f-7c8f-3c8f7c8f3c8f.png",
        type: "MAKE",
        features: ["Visual Builder", "Complex Logic", "API Connections"],
      },
    ],
  },
]

export default function IntegrationsPage() {
  const [selectedCategory, setSelectedCategory] = useState("crm")
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null)
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userIntegrations, setUserIntegrations] = useState<Integration[]>([])
  const { toast } = useToast()

  const [config, setConfig] = useState({
    apiKey: "",
    apiSecret: "",
    webhookUrl: "",
    accessToken: "",
    mcpServerUrl: "",
    customFields: {},
  })

  useEffect(() => {
    loadUserIntegrations()
  }, [])

  const loadUserIntegrations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/integrations")
      if (response.ok) {
        const data = await response.json()
        setUserIntegrations(data)
      } else {
        toast({
          title: "Fehler",
          description: "Integrationen konnten nicht geladen werden",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading integrations:", error)
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Laden der Integrationen",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = (integration: any) => {
    setSelectedIntegration(integration)
    setConfig({
      apiKey: "",
      apiSecret: "",
      webhookUrl: "",
      accessToken: "",
      mcpServerUrl: "",
      customFields: {},
    })
    setIsConfiguring(true)
  }

  const handleDisconnect = async (integration: Integration) => {
    if (!confirm(`Sind Sie sicher, dass Sie die Integration "${integration.name}" trennen möchten?`)) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/integrations?id=${integration.id}&type=${integration.type}`,
        { method: "DELETE" }
      )

      if (response.ok) {
        toast({
          title: "Erfolg",
          description: "Integration erfolgreich getrennt",
        })
        loadUserIntegrations()
      } else {
        const error = await response.json()
        toast({
          title: "Fehler",
          description: error.error || "Fehler beim Trennen der Integration",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Disconnect error:", error)
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Trennen der Integration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveConnection = async () => {
    if (!selectedIntegration) return

    setIsLoading(true)
    try {
      const payload: any = {
        type: selectedIntegration.type,
        name: selectedIntegration.name,
        config: {},
      }

      if (selectedIntegration.type === "CALENDLY") {
        if (!config.accessToken) {
          toast({
            title: "Fehler",
            description: "Calendly Access Token ist erforderlich",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
        payload.config.accessToken = config.accessToken
        if (config.mcpServerUrl) {
          payload.config.mcpServerUrl = config.mcpServerUrl
        }
      } else {
        if (!config.apiKey && selectedIntegration.id !== "zapier" && selectedIntegration.id !== "make") {
          toast({
            title: "Fehler",
            description: "API Key ist erforderlich",
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
        payload.config = config
      }

      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast({
          title: "Erfolg",
          description: `${selectedIntegration.name} erfolgreich verbunden`,
        })
        setIsConfiguring(false)
        loadUserIntegrations()
      } else {
        const error = await response.json()
        toast({
          title: "Fehler",
          description: error.error || "Fehler beim Verbinden",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Save connection error:", error)
      toast({
        title: "Fehler",
        description: "Netzwerkfehler beim Verbinden",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const ConfigurationDialog = () => (
    <Dialog open={isConfiguring} onOpenChange={setIsConfiguring}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <img src={selectedIntegration?.logo} alt={selectedIntegration?.name} className="w-6 h-6 mr-2" />
            {selectedIntegration?.name} konfigurieren
          </DialogTitle>
          <DialogDescription>
            Geben Sie Ihre API-Credentials ein, um die Integration zu aktivieren
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {selectedIntegration?.type === "CALENDLY" ? (
            <>
              <div>
                <Label htmlFor="accessToken">Calendly Access Token</Label>
                <Input
                  id="accessToken"
                  type="password"
                  value={config.accessToken}
                  onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
                  placeholder="Ihr Calendly Access Token"
                />
              </div>
              <div>
                <Label htmlFor="mcpServerUrl">MCP Server URL (optional)</Label>
                <Input
                  id="mcpServerUrl"
                  value={config.mcpServerUrl}
                  onChange={(e) => setConfig({ ...config, mcpServerUrl: e.target.value })}
                  placeholder="URL Ihres MCP Servers"
                />
              </div>
            </>
          ) : (
            <>
              {selectedIntegration?.id !== "zapier" && selectedIntegration?.id !== "make" && (
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={config.apiKey}
                    onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                    placeholder="Ihr API Key"
                  />
                </div>
              )}
              {selectedIntegration?.id === "salesforce" && (
                <div>
                  <Label htmlFor="apiSecret">API Secret</Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    value={config.apiSecret}
                    onChange={(e) => setConfig({ ...config, apiSecret: e.target.value })}
                    placeholder="Ihr API Secret"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="webhookUrl">Webhook URL (optional)</Label>
                <Input
                  id="webhookUrl"
                  value={config.webhookUrl}
                  onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                  placeholder="https://ihre-domain.de/webhook"
                />
              </div>
            </>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsConfiguring(false)} disabled={isLoading}>
            Abbrechen
          </Button>
          <Button onClick={handleSaveConnection} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
            Verbinden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  const getIntegrationStatus = (integrationId: string, integrationType: string) => {
    const found = userIntegrations.find((userInt) => userInt.type === integrationType)
    return found ? { status: "connected", userIntegration: found } : { status: "available" }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Integrationen</h1>
          <p className="text-slate-600 mt-1">Verbinden Sie NextChat mit Ihren bevorzugten Tools und Services</p>
        </div>
        <Button variant="outline">
          <ExternalLink className="w-4 h-4 mr-2" />
          API Dokumentation
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Aktive Integrationen</p>
                <p className="text-2xl font-bold text-slate-900">{userIntegrations.length}</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Verfügbare Integrationen</p>
                <p className="text-2xl font-bold text-slate-900">
                  {integrationCategories.reduce((sum, category) => sum + category.integrations.length, 0)}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Daten übertragen</p>
                <p className="text-2xl font-bold text-slate-900">N/A</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3">
          {integrationCategories.map((category) => {
            const Icon = category.icon
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center">
                <Icon className="w-4 h-4 mr-2" />
                {category.name}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {integrationCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <div className="text-center py-4">
              <h2 className="text-xl font-semibold text-slate-900">{category.name}</h2>
              <p className="text-slate-600">{category.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.integrations.map((integration) => {
                const { status, userIntegration } = getIntegrationStatus(integration.id, integration.type)
                return (
                  <Card
                    key={integration.id}
                    className="bg-white border-slate-200 hover:shadow-md transition-shadow"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img src={integration.logo} alt={integration.name} className="w-10 h-10 rounded" />
                          <div>
                            <CardTitle className="text-lg">{integration.name}</CardTitle>
                            <Badge
                              variant={status === "connected" ? "default" : "secondary"}
                              className={
                                status === "connected"
                                  ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                  : ""
                              }
                            >
                              {status === "connected" ? (
                                <>
                                  <Check className="w-3 h-3 mr-1" />
                                  Verbunden
                                </>
                              ) : (
                                "Verfügbar"
                              )}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <CardDescription>{integration.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-2">Features:</p>
                          <div className="space-y-1">
                            {integration.features.map((feature, index) => (
                              <div key={index} className="flex items-center text-sm text-slate-600">
                                <Check className="w-3 h-3 mr-2 text-emerald-600" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="pt-2">
                          {status === "connected" ? (
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" disabled={isLoading}>
                                <Settings className="w-4 h-4 mr-1" />
                                Konfigurieren
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDisconnect(userIntegration!)}
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <X className="w-4 h-4 mr-1" />
                                )}
                                Trennen
                              </Button>
                            </div>
                          ) : (
                            <Button
                              className="w-full"
                              size="sm"
                              onClick={() => handleConnect(integration)}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Plus className="w-4 h-4 mr-1" />
                              )}
                              Verbinden
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="bg-gradient-to-r from-emerald-50 to-sky-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="w-5 h-5 mr-2 text-emerald-600" />
            Custom Integration
          </CardTitle>
          <CardDescription>
            Benötigen Sie eine spezielle Integration? Nutzen Sie unsere REST API oder Webhooks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900">REST API & Webhooks</p>
              <p className="text-sm text-slate-600">
                Vollständige API-Dokumentation und Webhook-Support für custom Integrationen
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-1" />
                API Docs
              </Button>
              <Button size="sm">
                <Key className="w-4 h-4 mr-1" />
                API Key erstellen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfigurationDialog />
    </div>
  )
}
