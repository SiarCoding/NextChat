import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Alle verfügbaren Templates abrufen
export async function GET(request: NextRequest) {
  try {
    const templates = await prisma.chatbotTemplate.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(templates)

  } catch (error) {
    console.error("Templates GET Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// POST - Neues Template erstellen (Admin only)
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
      category,
      mode = "CHAT",
      primaryColor = "#10b981",
      secondaryColor = "#6b7280",
      chatTitle = "Chat Assistant",
      welcomeMessage = "Hallo! Wie kann ich Ihnen helfen?",
      personality = "freundlich und hilfsbereit",
      systemPrompt,
      industry,
      useCase
    } = data

    if (!name || !description || !systemPrompt) {
      return NextResponse.json({ 
        error: "Name, Beschreibung und System-Prompt sind erforderlich" 
      }, { status: 400 })
    }

    const template = await prisma.chatbotTemplate.create({
      data: {
        name,
        description,
        category,
        mode,
        primaryColor,
        secondaryColor,
        chatTitle,
        welcomeMessage,
        personality,
        systemPrompt,
        industry,
        useCase
      }
    })

    return NextResponse.json(template, { status: 201 })

  } catch (error) {
    console.error("Template POST Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}