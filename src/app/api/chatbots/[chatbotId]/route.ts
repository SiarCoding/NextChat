import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Einzelnen Chatbot abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { chatbotId: string } }
) {
  try {
    const chatbotId = params.chatbotId

    // Wenn keine ID angegeben wurde
    if (!chatbotId) {
      return NextResponse.json({ error: "Chatbot-ID erforderlich" }, { status: 400 })
    }

    // Chatbot aus der Datenbank abrufen
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId },
    })

    // Wenn kein Chatbot gefunden wurde
    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot nicht gefunden" }, { status: 404 })
    }

    // Wir erlauben öffentlichen Zugriff auf die Chatbot-Konfiguration,
    // da diese für das Embedding benötigt wird
    return NextResponse.json(chatbot)
  } catch (error) {
    console.error("Chatbot GET Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}
