import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Credits und Verbrauch abrufen
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true, plan: true }
    })

    if (!user) {
      return NextResponse.json({ error: "Benutzer nicht gefunden" }, { status: 404 })
    }

    // Letzten 30 Tage Credit-Verbrauch
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const creditUsage = await prisma.creditUsage.findMany({
      where: {
        userId: session.user.id,
        createdAt: { gte: thirtyDaysAgo }
      },
      orderBy: { createdAt: "desc" },
      take: 100
    })

    // Verbrauch nach Typ gruppieren
    const usageByType = creditUsage.reduce((acc, usage) => {
      acc[usage.type] = (acc[usage.type] || 0) + usage.amount
      return acc
    }, {} as Record<string, number>)

    // Täglicher Verbrauch für Chart
    const dailyUsage = creditUsage.reduce((acc, usage) => {
      const date = usage.createdAt.toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + usage.amount
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      currentCredits: user.credits,
      plan: user.plan,
      usageByType,
      dailyUsage,
      recentUsage: creditUsage.slice(0, 20)
    })

  } catch (error) {
    console.error("Credits GET Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// POST - Credits hinzufügen (für Käufe/Upgrades)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { amount, description, type = "PURCHASE" } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Ungültiger Credit-Betrag" }, { status: 400 })
    }

    // Credits hinzufügen
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { credits: { increment: amount } }
    })

    // Credit-Transaktion protokollieren
    await prisma.creditUsage.create({
      data: {
        type: "CHAT_MESSAGE", // Placeholder, da wir keinen PURCHASE type haben
        amount: -amount, // Negativ für Hinzufügung
        description: description || `${amount} Credits hinzugefügt`,
        userId: session.user.id
      }
    })

    return NextResponse.json({
      newBalance: updatedUser.credits,
      message: `${amount} Credits erfolgreich hinzugefügt`
    })

  } catch (error) {
    console.error("Credits POST Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// Hilfsfunktion zum Abziehen von Credits
export async function deductCredits(userId: string, amount: number, type: string, description?: string) {
  try {
    // Prüfen ob genug Credits vorhanden
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    })

    if (!user || user.credits < amount) {
      throw new Error("Nicht genügend Credits")
    }

    // Credits abziehen
    await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: amount } }
    })

    // Verbrauch protokollieren
    await prisma.creditUsage.create({
      data: {
        type: type as any,
        amount,
        description,
        userId
      }
    })

    return true
  } catch (error) {
    console.error("Deduct Credits Error:", error)
    throw error
  }
}