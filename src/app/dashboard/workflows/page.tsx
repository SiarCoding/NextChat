"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Workflow,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  Save,
  ArrowRight,
  MessageSquare,
  Users,
  Calendar,
  Mail,
  Database,
  Zap,
  GitBranch,
  Clock,
  Target
} from "lucide-react"

const workflowTemplates = [
  {
    id: "lead-qualification",
    name: "Lead Qualifizierung",
    description: "Automatische Qualifizierung und Weiterleitung von Leads",
    category: "Sales",
    nodes: 5,
    triggers: ["Neue Nachricht", "Lead Score > 80"],
    actions: ["CRM Update", "Email senden", "Termin buchen"]
  },
  {
    id: "support-escalation",
    name: "Support Eskalation",
    description: "Automatische Eskalation bei komplexen Anfragen",
    category: "Support",
    nodes: 4,
    triggers: ["Keyword erkannt", "Sentiment negativ"],
    actions: ["Ticket erstellen", "Team benachrichtigen"]
  },
  {
    id: "appointment-booking",
    name: "Terminbuchung",
    description: "Vollautomatische Terminbuchung mit Kalender-Integration",
    category: "Booking",
    nodes: 6,
    triggers: ["Terminanfrage", "Verfügbarkeit prüfen"],
    actions: ["Kalender prüfen", "Termin buchen", "Bestätigung senden"]
  }
]

const existingWorkflows = [
  {
    id: 1,
    name: "Immobilien Lead Flow",
    description: "Qualifiziert Immobilien-Interessenten",
    status: "active",
    triggers: 45,
    success_rate: 87,
    last_run: "vor 2 Minuten",
    nodes: 8
  },
  {
    id: 2,
    name: "Support Ticket Flow",
    description: "Automatische Ticket-Erstellung",
    status: "active",
    triggers: 23,
    success_rate: 94,
    last_run: "vor 15 Minuten",
    nodes: 5
  },
  {
    id: 3,
    name: "Demo Buchung Flow",
    description: "Produktdemo-Terminbuchung",
    status: "paused",
    triggers: 12,
    success_rate: 76,
    last_run: "vor 2 Stunden",
    nodes: 7
  }
]

const nodeTypes = [
  {
    type: "trigger",
    name: "Trigger",
    icon: Zap,
    color: "emerald",
    description: "Startet den Workflow"
  },
  {
    type: "condition",
    name: "Bedingung",
    icon: GitBranch,
    color: "blue",
    description: "Verzweigt basierend auf Bedingungen"
  },
  {
    type: "action",
    name: "Aktion",
    icon: Target,
    color: "purple",
    description: "Führt eine Aktion aus"
  },
  {
    type: "delay",
    name: "Verzögerung",
    icon: Clock,
    color: "orange",
    description: "Wartet eine bestimmte Zeit"
  }
]

export default function WorkflowsPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  const WorkflowBuilder = () => (
    <div className="h-96 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
      <div className="text-center">
        <Workflow className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Workflow Builder</h3>
        <p className="text-slate-500 mb-4">Ziehen Sie Nodes hierher, um Ihren Workflow zu erstellen</p>
        <div className="flex justify-center space-x-2">
          {nodeTypes.map((nodeType) => {
            const Icon = nodeType.icon
            return (
              <div
                key={nodeType.type}
                className={`p-3 rounded-lg border-2 border-dashed cursor-pointer hover:border-${nodeType.color}-300 hover:bg-${nodeType.color}-50 transition-colors`}
              >
                <Icon className={`w-6 h-6 text-${nodeType.color}-600 mx-auto mb-1`} />
                <p className="text-xs font-medium">{nodeType.name}</p>
              </div>
            )
          })}
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
              {selectedTemplate ? "Workflow aus Vorlage erstellen" : "Neuen Workflow erstellen"}
            </h1>
            <p className="text-slate-600 mt-1">
              Erstellen Sie automatisierte Workflows mit Nodes und Verbindungen
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Zurück
            </Button>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Speichern
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Node Palette */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Node-Palette</CardTitle>
                <CardDescription>
                  Ziehen Sie Nodes in den Builder
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {nodeTypes.map((nodeType) => {
                  const Icon = nodeType.icon
                  return (
                    <div
                      key={nodeType.type}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-${nodeType.color}-100`}>
                          <Icon className={`w-4 h-4 text-${nodeType.color}-600`} />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{nodeType.name}</p>
                          <p className="text-xs text-slate-500">{nodeType.description}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Workflow-Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="workflowName">Name</Label>
                  <Input
                    id="workflowName"
                    placeholder="Mein Workflow"
                  />
                </div>
                <div>
                  <Label htmlFor="workflowDescription">Beschreibung</Label>
                  <Input
                    id="workflowDescription"
                    placeholder="Workflow-Beschreibung"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Builder */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Workflow className="w-5 h-5 mr-2" />
                  Workflow Builder
                </CardTitle>
                <CardDescription>
                  Erstellen Sie Ihren Workflow durch Verbinden von Nodes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorkflowBuilder />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Workflows</h1>
          <p className="text-slate-600 mt-1">
            Automatisieren Sie Ihre Chatbot-Prozesse mit visuellen Workflows
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Neuen Workflow erstellen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Aktive Workflows</p>
                <p className="text-2xl font-bold text-slate-900">2</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Workflow className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Ausführungen heute</p>
                <p className="text-2xl font-bold text-slate-900">68</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Play className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Erfolgsrate</p>
                <p className="text-2xl font-bold text-slate-900">89%</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Gesparte Zeit</p>
                <p className="text-2xl font-bold text-slate-900">24h</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow-Vorlagen</CardTitle>
          <CardDescription>
            Starten Sie schnell mit vorgefertigten Workflow-Vorlagen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workflowTemplates.map((template) => (
              <div
                key={template.id}
                className="p-4 border rounded-lg hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedTemplate(template.id)
                  setIsCreating(true)
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{template.name}</h3>
                  <Badge variant="outline">{template.category}</Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">{template.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-xs text-slate-500">
                    <Workflow className="w-3 h-3 mr-1" />
                    {template.nodes} Nodes
                  </div>
                  <div className="text-xs text-slate-500">
                    <strong>Trigger:</strong> {template.triggers.join(", ")}
                  </div>
                  <div className="text-xs text-slate-500">
                    <strong>Aktionen:</strong> {template.actions.join(", ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Existing Workflows */}
      <Card>
        <CardHeader>
          <CardTitle>Meine Workflows</CardTitle>
          <CardDescription>
            Verwalten Sie Ihre erstellten Workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {existingWorkflows.map((workflow) => (
              <div
                key={workflow.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${workflow.status === "active" ? "bg-emerald-100" : "bg-slate-100"}`}>
                    <Workflow className={`w-5 h-5 ${workflow.status === "active" ? "text-emerald-600" : "text-slate-400"}`} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{workflow.name}</h3>
                      <Badge variant={workflow.status === "active" ? "default" : "secondary"}>
                        {workflow.status === "active" ? "Aktiv" : "Pausiert"}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{workflow.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                      <span>{workflow.nodes} Nodes</span>
                      <span>{workflow.triggers} Ausführungen</span>
                      <span>{workflow.success_rate}% Erfolgsrate</span>
                      <span>Zuletzt: {workflow.last_run}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-1" />
                    Bearbeiten
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-1" />
                    Duplizieren
                  </Button>
                  {workflow.status === "active" ? (
                    <Button variant="outline" size="sm">
                      <Pause className="w-4 h-4 mr-1" />
                      Pausieren
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm">
                      <Play className="w-4 h-4 mr-1" />
                      Starten
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}