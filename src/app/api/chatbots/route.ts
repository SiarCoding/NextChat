import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Alle Chatbots des Benutzers abrufen
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const chatbots = await prisma.chatbot.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: {
            conversations: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(chatbots)

  } catch (error) {
    console.error("Chatbots GET Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// POST - Neuen Chatbot erstellen
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
      mode = "CHAT",
      primaryColor = "#10b981",
      secondaryColor = "#6b7280",
      fontFamily = "Inter",
      logo,
      chatTitle = "Chat Assistant",
      welcomeMessage = "Hallo! Wie kann ich Ihnen helfen?",
      personality = "freundlich und hilfsbereit",
      language = "de",
      websiteUrl,
      knowledgeBase,
      pdfDocuments = []
    } = data

    if (!name) {
      return NextResponse.json({ error: "Name ist erforderlich" }, { status: 400 })
    }

    // Embed-Code generieren - moderner, responsiver Ansatz
    const embedCode = `<script>
  (function() {
    // Stil für das Widget definieren
    var style = document.createElement('style');
    style.innerHTML = '\
      #nextchat-widget {\
        position: fixed;\
        bottom: 20px;\
        right: 20px;\
        z-index: 2147483647;\
        border-radius: 10px;\
        overflow: hidden;\
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);\
        width: 400px;\
        height: 600px;\
        max-width: calc(100vw - 40px);\
        max-height: calc(100vh - 40px);\
        transition: all 0.3s ease;\
      }\
      @media (max-width: 500px) {\
        #nextchat-widget {\
          width: calc(100vw - 40px);\
          height: calc(100vh - 40px);\
        }\
      }\
      #nextchat-frame {\
        width: 100%;\
        height: 100%;\
        border: none;\
      }\
    ';
    document.head.appendChild(style);
    
    // Widget-Container erstellen
    var container = document.createElement('div');
    container.id = 'nextchat-widget';
    
    // iframe erstellen
    var iframe = document.createElement('iframe');
    iframe.id = 'nextchat-frame';
    iframe.src = '${process.env.NEXT_PUBLIC_APP_URL}/embed/CHATBOT_ID';
    iframe.setAttribute('allow', 'microphone; camera');
    
    // Alles zusammenfügen und in die Seite einfügen
    container.appendChild(iframe);
    document.body.appendChild(container);
  })();
</script>`

    const chatbot = await prisma.chatbot.create({
      data: {
        name,
        description,
        mode,
        primaryColor,
        secondaryColor,
        fontFamily,
        logo,
        chatTitle,
        welcomeMessage,
        personality,
        language,
        websiteUrl,
        knowledgeBase,
        pdfDocuments,
        embedCode: embedCode.replace('CHATBOT_ID', ''), // Wird nach Erstellung aktualisiert
        userId: session.user.id
      }
    })

    // Embed-Code mit echter ID aktualisieren
    const finalEmbedCode = embedCode.replace('CHATBOT_ID', chatbot.id)
    
    const updatedChatbot = await prisma.chatbot.update({
      where: { id: chatbot.id },
      data: { embedCode: finalEmbedCode }
    })

    return NextResponse.json(updatedChatbot, { status: 201 })

  } catch (error) {
    console.error("Chatbot POST Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// PUT - Chatbot aktualisieren
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get("id")

    if (!chatbotId) {
      return NextResponse.json({ error: "Chatbot-ID erforderlich" }, { status: 400 })
    }

    const data = await request.json()

    // Prüfen ob Chatbot dem Benutzer gehört
    const existingChatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId }
    })

    if (!existingChatbot || existingChatbot.userId !== session.user.id) {
      return NextResponse.json({ error: "Chatbot nicht gefunden" }, { status: 404 })
    }

    const updatedChatbot = await prisma.chatbot.update({
      where: { id: chatbotId },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedChatbot)

  } catch (error) {
    console.error("Chatbot PUT Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// DELETE - Chatbot löschen
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chatbotId = searchParams.get("id")

    if (!chatbotId) {
      return NextResponse.json({ error: "Chatbot-ID erforderlich" }, { status: 400 })
    }

    // Prüfen ob Chatbot dem Benutzer gehört
    const existingChatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId }
    })

    if (!existingChatbot || existingChatbot.userId !== session.user.id) {
      return NextResponse.json({ error: "Chatbot nicht gefunden" }, { status: 404 })
    }

    // Chatbot und alle zugehörigen Konversationen löschen
    await prisma.conversation.deleteMany({
      where: { chatbotId }
    })

    await prisma.chatbot.delete({
      where: { id: chatbotId }
    })

    return NextResponse.json({ message: "Chatbot erfolgreich gelöscht" })

  } catch (error) {
    console.error("Chatbot DELETE Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}