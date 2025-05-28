import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

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

    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: "Keine Datei hochgeladen" }, { status: 400 })
    }

    // Validierung der Dateigröße (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Datei zu groß (max 5MB)" }, { status: 400 })
    }

    // Validierung des Dateityps
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Ungültiger Dateityp. Erlaubt: JPEG, PNG, GIF, WebP, PDF" 
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Eindeutigen Dateinamen generieren
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`
    
    // Stellen sicher, dass das Uploads-Verzeichnis existiert
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    const filePath = join(uploadDir, filename)
    
    try {
      // Erstelle das Verzeichnis, falls es nicht existiert
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
      await writeFile(filePath, buffer)
    } catch (error) {
      console.error("File write error:", error)
      return NextResponse.json({ error: "Fehler beim Speichern der Datei" }, { status: 500 })
    }

    const fileUrl = `/uploads/${filename}`

    // Versuche, Datenbankeinträge zu erstellen, aber nur wenn Prisma verfügbar ist
    let fileUpload = null
    
    // Wir versuchen die Datenbank-Operationen nur, wenn Prisma erfolgreich importiert wurde
    if (prisma) {
      try {
        // Datei-Info in Datenbank speichern
        fileUpload = await prisma.fileUpload.create({
          data: {
            filename,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            url: fileUrl,
            userId: session.user.id
          }
        })
  
        // Credits abziehen
        await prisma.creditUsage.create({
          data: {
            type: "FILE_UPLOAD",
            amount: 1,
            description: `Datei hochgeladen: ${file.name}`,
            userId: session.user.id
          }
        })
  
        await prisma.user.update({
          where: { id: session.user.id },
          data: { credits: { decrement: 1 } }
        })
      } catch (error) {
        console.error("Database error:", error)
        // DB-Fehler ignorieren, aber loggen
      }
    } else {
      console.log("Datei gespeichert, aber keine Datenbankaktion durchgeführt (Prisma nicht verfügbar)")
    }

    return NextResponse.json({
      id: fileUpload?.id || null,
      url: fileUrl,
      filename: file.name,
      size: file.size,
      type: file.type
    })

  } catch (error) {
    console.error("Upload Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// GET - Benutzer-Uploads abrufen
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const uploads = await prisma.fileUpload.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50
    })

    return NextResponse.json(uploads)

  } catch (error) {
    console.error("Uploads GET Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}