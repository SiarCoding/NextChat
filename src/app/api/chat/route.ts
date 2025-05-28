import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { deductCredits } from "../credits/route"
import { generateBotResponse } from "@/lib/genai"

/**
 * Wrapper für die generateBotResponse-Funktion aus @/lib/genai
 * Bewahrt die alte Schnittstelle für Abwärtskompatibilität
 */
async function generateGeminiResponse(message: string, context: string = "", systemPrompt?: string, userId?: string, conversation: any[] = []) {
  // Nutze direkt die neue GenAI-Implementierung
  return await generateBotResponse(message, context, systemPrompt, userId, conversation);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { 
      message, 
      chatbotId, 
      conversationId, 
      visitorId, 
      isVoice = false, 
      testMode = false,
      config = {}
    } = await request.json()

    if (!message || !chatbotId) {
      return NextResponse.json({ error: "Nachricht und Chatbot-ID sind erforderlich" }, { status: 400 })
    }

    // Credits prüfen (im Testmodus überspringen)
    const creditCost = isVoice ? 2 : 1; // Voice-Nachrichten kosten mehr
    
    if (!testMode) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { credits: true }
      })
  
      if (!user || user.credits < creditCost) {
        return NextResponse.json({ error: "Nicht genügend Credits" }, { status: 402 })
      }
    } else {
      console.log('Testmodus aktiviert: Credit-Prüfung wird übersprungen');
    }

    // Chatbot-Konfiguration laden
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId },
      include: { user: true }
    })

    if (!chatbot) {
      return NextResponse.json({ error: "Chatbot nicht gefunden" }, { status: 404 })
    }

    // Konversation finden oder erstellen
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      })
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          chatbotId,
          visitorId: visitorId || `visitor_${Date.now()}`,
          messages: []
        }
      })
    }

    // Kontext für Gemini vorbereiten
    let context = ''
    let systemPrompt = ''
    
    // Im Testmodus verwenden wir die in der Anfrage mitgegebenen Konfigurationsdaten
    if (testMode && config) {
      context = `
Chatbot Name: ${chatbot.name}
Beschreibung: ${chatbot.description}
Persönlichkeit: ${config.personality || chatbot.personality}
Wissensbasis: ${config.knowledgeBase || "Keine spezifische Wissensbasis"}
Website: ${config.websiteUrl || "Keine Website angegeben"}
Modus: ${chatbot.mode}
`

      // PDFs hinzufügen, falls vorhanden
      if (config.pdfDocuments && config.pdfDocuments.length > 0) {
        context += `\nPDF-Dokumente: ${config.pdfDocuments.join(', ')}\n`
      }
      
      systemPrompt = config.personality || chatbot.personality
    } else {
      // Standardverhalten für normalen Betrieb
      context = `
Chatbot Name: ${chatbot.name}
Beschreibung: ${chatbot.description}
Persönlichkeit: ${chatbot.personality}
Wissensbasis: ${chatbot.knowledgeBase || "Keine spezifische Wissensbasis"}
Website: ${chatbot.websiteUrl || "Keine Website angegeben"}
Modus: ${chatbot.mode}
`
      
      systemPrompt = chatbot.personality
    }
    
    // Vorhandene Konversation formatieren, wenn vorhanden
    const existingMessages = conversation.messages || [];
    
    // Gemini API aufrufen und Konversationskontext übergeben
    const aiResponse = await generateGeminiResponse(
      message, 
      context, 
      systemPrompt, 
      session.user.id,
      existingMessages
    )

    // Nachrichten zur Konversation hinzufügen
    const userMessage = {
      id: `msg_${Date.now()}_user`,
      type: "user",
      content: message,
      timestamp: new Date().toISOString(),
      isVoice
    }

    const botMessage = {
      id: `msg_${Date.now()}_bot`,
      type: "bot",
      content: aiResponse,
      timestamp: new Date().toISOString(),
      isVoice
    }

    const updatedMessages = [
      ...(conversation.messages as any[]),
      userMessage,
      botMessage
    ]

    // Konversation aktualisieren
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        messages: updatedMessages,
        updatedAt: new Date()
      }
    })

    // Chatbot-Statistiken aktualisieren
    await prisma.chatbot.update({
      where: { id: chatbotId },
      data: {
        totalChats: { increment: 1 }
      }
    })

    // Credits abziehen (im Testmodus überspringen)
    if (!testMode) {
      try {
        await deductCredits(
          session.user.id,
          creditCost,
          isVoice ? "VOICE_MESSAGE" : "CHAT_MESSAGE",
          `${isVoice ? "Voice" : "Chat"} Nachricht an ${chatbot.name}`
        )
      } catch (error) {
        console.error("Credit deduction failed:", error)
      }
    } else {
      console.log('Testmodus: Keine Credits abgezogen');
    }

    return NextResponse.json({
      response: aiResponse,
      conversationId: conversation.id,
      messageId: botMessage.id,
      creditsUsed: creditCost
    })

  } catch (error) {
    console.error("Chat API Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// GET-Route für Konversationshistorie
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get("conversationId")
    const chatbotId = searchParams.get("chatbotId")

    if (conversationId) {
      // Spezifische Konversation laden
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          chatbot: {
            include: { user: true }
          }
        }
      })

      if (!conversation || conversation.chatbot.userId !== session.user.id) {
        return NextResponse.json({ error: "Konversation nicht gefunden" }, { status: 404 })
      }

      return NextResponse.json(conversation)
    }

    if (chatbotId) {
      // Alle Konversationen für einen Chatbot laden
      const conversations = await prisma.conversation.findMany({
        where: {
          chatbot: {
            id: chatbotId,
            userId: session.user.id
          }
        },
        orderBy: { updatedAt: "desc" },
        take: 50
      })

      return NextResponse.json(conversations)
    }

    return NextResponse.json({ error: "Konversations-ID oder Chatbot-ID erforderlich" }, { status: 400 })

  } catch (error) {
    console.error("Chat GET API Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}