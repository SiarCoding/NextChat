import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Alle Conversations des Benutzers abrufen
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        chatbot: {
          userId: session.user.id
        }
      },
      include: {
        chatbot: {
          select: {
            name: true,
            id: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    })

    return NextResponse.json(conversations)

  } catch (error) {
    console.error("Conversations GET Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// POST - Neue Conversation erstellen
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const data = await request.json()
    
    const {
      chatbotId,
      visitorId,
      visitorEmail,
      visitorName,
      visitorPhone,
      messages = []
    } = data

    if (!chatbotId) {
      return NextResponse.json({ error: "Chatbot ID ist erforderlich" }, { status: 400 })
    }

    // Prüfen ob Chatbot dem Benutzer gehört
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId }
    })

    if (!chatbot || chatbot.userId !== session.user.id) {
      return NextResponse.json({ error: "Chatbot nicht gefunden" }, { status: 404 })
    }

    const conversation = await prisma.conversation.create({
      data: {
        chatbotId,
        visitorId,
        visitorEmail,
        visitorName,
        visitorPhone,
        messages
      },
      include: {
        chatbot: {
          select: {
            name: true,
            id: true
          }
        }
      }
    })

    return NextResponse.json(conversation, { status: 201 })

  } catch (error) {
    console.error("Conversation POST Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// PUT - Conversation aktualisieren (z.B. Lead-Status)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("id")

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID erforderlich" }, { status: 400 })
    }

    const data = await request.json()

    // Prüfen ob Conversation dem Benutzer gehört
    const existingConversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        chatbot: true
      }
    })

    if (!existingConversation || existingConversation.chatbot.userId !== session.user.id) {
      return NextResponse.json({ error: "Conversation nicht gefunden" }, { status: 404 })
    }

    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        chatbot: {
          select: {
            name: true,
            id: true
          }
        }
      }
    })

    return NextResponse.json(updatedConversation)

  } catch (error) {
    console.error("Conversation PUT Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// DELETE - Conversation löschen
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("id")

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID erforderlich" }, { status: 400 })
    }

    // Prüfen ob Conversation dem Benutzer gehört
    const existingConversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        chatbot: true
      }
    })

    if (!existingConversation || existingConversation.chatbot.userId !== session.user.id) {
      return NextResponse.json({ error: "Conversation nicht gefunden" }, { status: 404 })
    }

    await prisma.conversation.delete({
      where: { id: conversationId }
    })

    return NextResponse.json({ message: "Conversation erfolgreich gelöscht" })

  } catch (error) {
    console.error("Conversation DELETE Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}