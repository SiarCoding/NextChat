import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Alle Landing Pages des Benutzers abrufen
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const landingPages = await prisma.landingPage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(landingPages)

  } catch (error) {
    console.error("Landing Pages GET Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// POST - Neue Landing Page erstellen
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
      primaryColor = "#10b981",
      secondaryColor = "#6b7280",
      fontFamily = "Inter",
      logo,
      title = "Live Assistant",
      subtitle,
      assistantName = "AI Assistant",
      assistantAvatar,
      welcomeMessage = "Hallo! Ich bin Ihr persönlicher Assistent.",
      content
    } = data

    if (!name) {
      return NextResponse.json({ error: "Name ist erforderlich" }, { status: 400 })
    }

    const landingPage = await prisma.landingPage.create({
      data: {
        name,
        description,
        primaryColor,
        secondaryColor,
        fontFamily,
        logo,
        title,
        subtitle,
        assistantName,
        assistantAvatar,
        welcomeMessage,
        content,
        userId: session.user.id
      }
    })

    // TODO: Credits abziehen wenn CreditUsage Model verfügbar ist

    return NextResponse.json(landingPage, { status: 201 })

  } catch (error) {
    console.error("Landing Page POST Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// PUT - Landing Page aktualisieren
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get("id")

    if (!pageId) {
      return NextResponse.json({ error: "Landing Page ID erforderlich" }, { status: 400 })
    }

    const data = await request.json()

    // Prüfen ob Landing Page dem Benutzer gehört
    const existingPage = await prisma.landingPage.findUnique({
      where: { id: pageId }
    })

    if (!existingPage || existingPage.userId !== session.user.id) {
      return NextResponse.json({ error: "Landing Page nicht gefunden" }, { status: 404 })
    }

    const updatedPage = await prisma.landingPage.update({
      where: { id: pageId },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedPage)

  } catch (error) {
    console.error("Landing Page PUT Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// DELETE - Landing Page löschen
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get("id")

    if (!pageId) {
      return NextResponse.json({ error: "Landing Page ID erforderlich" }, { status: 400 })
    }

    // Prüfen ob Landing Page dem Benutzer gehört
    const existingPage = await prisma.landingPage.findUnique({
      where: { id: pageId }
    })

    if (!existingPage || existingPage.userId !== session.user.id) {
      return NextResponse.json({ error: "Landing Page nicht gefunden" }, { status: 404 })
    }

    await prisma.landingPage.delete({
      where: { id: pageId }
    })

    return NextResponse.json({ message: "Landing Page erfolgreich gelöscht" })

  } catch (error) {
    console.error("Landing Page DELETE Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}