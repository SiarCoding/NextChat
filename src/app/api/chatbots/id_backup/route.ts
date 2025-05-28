import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Einzelnen Chatbot abrufen (öffentlich für Embed)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        description: true,
        mode: true,
        primaryColor: true,
        secondaryColor: true,
        fontFamily: true,
        logo: true,
        chatTitle: true,
        welcomeMessage: true,
        personality: true,
        language: true,
        isActive: true
      }
    })

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot nicht gefunden" }, { status: 404 })
    }

    if (!chatbot.isActive) {
      return NextResponse.json({ error: "Chatbot ist nicht aktiv" }, { status: 403 })
    }

    return NextResponse.json(chatbot)

  } catch (error) {
    console.error("Chatbot GET Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}