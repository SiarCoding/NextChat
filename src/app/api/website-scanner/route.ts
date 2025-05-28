import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Import Prisma als optionalen Import, damit die Route auch funktioniert, wenn Prisma-Probleme auftreten
let prisma: any = null
try {
  prisma = require("@/lib/prisma").prisma
} catch (error) {
  console.error("Prisma konnte nicht importiert werden:", error)
  // Wir machen weiter ohne Prisma
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { url } = await request.json()
    
    if (!url || !url.trim().startsWith('http')) {
      return NextResponse.json({ error: "Gültige URL erforderlich" }, { status: 400 })
    }

    // Website scannen
    try {
      // Fetch-Request an die URL, um den Inhalt zu holen
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; NextChatBot/1.0; +https://nextchat.io)'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Fehler beim Abrufen der Website: ${response.status}`)
      }
      
      const html = await response.text()
      
      // Einfache Extraktion von Text aus HTML (in einer produktiven Umgebung sollte ein richtiger HTML-Parser verwendet werden)
      const textContent = extractTextFromHtml(html)
      
      // Credits abziehen, nur wenn Prisma verfügbar ist
      if (prisma) {
        try {
          await prisma.creditUsage.create({
            data: {
              type: "WEBSITE_SCAN",
              amount: 5, // Website-Scan kostet 5 Credits
              description: `Website gescannt: ${url}`,
              userId: session.user.id
            }
          })
          
          await prisma.user.update({
            where: { id: session.user.id },
            data: { credits: { decrement: 5 } }
          })
        } catch (dbError) {
          console.error("Database error in website scanner:", dbError)
          // Fehler ignorieren und trotzdem Ergebnis zurückgeben
        }
      } else {
        console.log("Website gescannt, aber keine Datenbankaktion durchgeführt (Prisma nicht verfügbar)")
      }
      
      return NextResponse.json({
        success: true,
        url,
        textContent: textContent.substring(0, 50000), // Beschränken, um große Antworten zu vermeiden
        extractedChars: textContent.length
      })
      
    } catch (error) {
      console.error("Website scanning error:", error)
      return NextResponse.json({
        error: error instanceof Error ? error.message : "Fehler beim Scannen der Website"
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error("Website scanner API error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// Hilfsfunktion zur Extraktion von Text aus HTML
function extractTextFromHtml(html: string): string {
  // Entferne alle Script- und Style-Elemente
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
  
  // Ersetze alle HTML-Tags durch Leerzeichen
  text = text.replace(/<[^>]+>/g, " ");
  
  // Ersetze mehrere Leerzeichen durch eines
  text = text.replace(/\s+/g, " ");
  
  // Dekodiere HTML-Entitäten
  text = text.replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
  
  return text.trim();
}
