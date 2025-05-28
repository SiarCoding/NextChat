import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Alle Workflows des Benutzers abrufen
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const workflows = await prisma.workflow.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(workflows)

  } catch (error) {
    console.error("Workflows GET Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// POST - Neuen Workflow erstellen
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const data = await request.json()
    
    const {
      name,
      description,
      nodes = [],
      connections = [],
      isActive = false
    } = data

    if (!name) {
      return NextResponse.json({ error: "Name ist erforderlich" }, { status: 400 })
    }

    const workflow = await prisma.workflow.create({
      data: {
        name,
        description,
        nodes,
        connections,
        isActive,
        userId: session.user.id
      }
    })

    return NextResponse.json(workflow, { status: 201 })

  } catch (error) {
    console.error("Workflow POST Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// PUT - Workflow aktualisieren
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workflowId = searchParams.get("id")

    if (!workflowId) {
      return NextResponse.json({ error: "Workflow ID erforderlich" }, { status: 400 })
    }

    const data = await request.json()

    // Prüfen ob Workflow dem Benutzer gehört
    const existingWorkflow = await prisma.workflow.findUnique({
      where: { id: workflowId }
    })

    if (!existingWorkflow || existingWorkflow.userId !== session.user.id) {
      return NextResponse.json({ error: "Workflow nicht gefunden" }, { status: 404 })
    }

    const updatedWorkflow = await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedWorkflow)

  } catch (error) {
    console.error("Workflow PUT Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// DELETE - Workflow löschen
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workflowId = searchParams.get("id")

    if (!workflowId) {
      return NextResponse.json({ error: "Workflow ID erforderlich" }, { status: 400 })
    }

    // Prüfen ob Workflow dem Benutzer gehört
    const existingWorkflow = await prisma.workflow.findUnique({
      where: { id: workflowId }
    })

    if (!existingWorkflow || existingWorkflow.userId !== session.user.id) {
      return NextResponse.json({ error: "Workflow nicht gefunden" }, { status: 404 })
    }

    await prisma.workflow.delete({
      where: { id: workflowId }
    })

    return NextResponse.json({ message: "Workflow erfolgreich gelöscht" })

  } catch (error) {
    console.error("Workflow DELETE Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// POST - Workflow ausführen
export async function executeWorkflow(workflowId: string, inputData: any) {
  try {
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId }
    })

    if (!workflow || !workflow.isActive) {
      throw new Error("Workflow nicht gefunden oder inaktiv")
    }

    const nodes = workflow.nodes as any[]
    const edges = workflow.connections as any[]

    // Einfache Workflow-Ausführung
    let currentData = inputData
    let currentNodeId = nodes.find(node => node.type === "start")?.id

    while (currentNodeId) {
      const currentNode = nodes.find(node => node.id === currentNodeId)
      
      if (!currentNode) break

      // Node-spezifische Logik ausführen
      switch (currentNode.type) {
        case "condition":
          // Bedingung prüfen
          const condition = currentNode.data?.condition
          if (condition && evaluateCondition(condition, currentData)) {
            currentNodeId = getNextNodeId(edges, currentNodeId, "true")
          } else {
            currentNodeId = getNextNodeId(edges, currentNodeId, "false")
          }
          break

        case "action":
          // Aktion ausführen
          currentData = await executeAction(currentNode.data, currentData)
          currentNodeId = getNextNodeId(edges, currentNodeId)
          break

        case "end":
          currentNodeId = null
          break

        default:
          currentNodeId = getNextNodeId(edges, currentNodeId)
      }
    }

    return currentData

  } catch (error) {
    console.error("Workflow execution error:", error)
    throw error
  }
}

// Hilfsfunktionen
function getNextNodeId(edges: any[], currentNodeId: string, condition?: string): string | null {
  const edge = edges.find(e => 
    e.source === currentNodeId && 
    (!condition || e.label === condition)
  )
  return edge?.target || null
}

function evaluateCondition(condition: string, data: any): boolean {
  // Einfache Bedingungsauswertung
  try {
    return new Function('data', `return ${condition}`)(data)
  } catch {
    return false
  }
}

async function executeAction(actionData: any, inputData: any): Promise<any> {
  // Aktions-spezifische Logik
  switch (actionData?.type) {
    case "webhook":
      await fetch(actionData.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputData)
      })
      break

    case "email":
      // E-Mail senden (Placeholder)
      console.log("Sending email:", actionData.template, inputData)
      break

    case "crm_update":
      // CRM Update (Placeholder)
      console.log("Updating CRM:", actionData.fields, inputData)
      break
  }

  return inputData
}