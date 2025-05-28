import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// POST - Neue Integration erstellen
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const data = await request.json()
    
    const {
      name,
      type,
      config,
      isActive = true
    } = data

    if (!name || !type) {
      return NextResponse.json({ error: "Name und Typ sind erforderlich" }, { status: 400 })
    }

    // Validierung der unterstützten Integrationstypen
    const supportedTypes = [
      "HUBSPOT", "SALESFORCE", "PIPEDRIVE", "CLOSE_CRM",
      "ZAPIER", "MAKE", "GOOGLE_CALENDAR", "MICROSOFT_CALENDAR", "CALENDLY"
    ]

    if (!supportedTypes.includes(type)) {
      return NextResponse.json({
        error: "Nicht unterstützter Integrationstyp"
      }, { status: 400 })
    }

    if (type === "CALENDLY") {
      const { accessToken, mcpServerUrl } = config;
      if (!accessToken) {
        return NextResponse.json({ error: "Calendly Access Token ist erforderlich" }, { status: 400 });
      }
      // Prüfen, ob bereits eine Calendly-Integration für diesen Benutzer existiert
      const existingCalendlyIntegration = await prisma.calendlyIntegration.findUnique({
        where: { userId: session.user.id }
      });

      if (existingCalendlyIntegration) {
        return NextResponse.json({ error: "Es existiert bereits eine Calendly-Integration für diesen Benutzer" }, { status: 400 });
      }

      const calendlyIntegration = await prisma.calendlyIntegration.create({
        data: {
          userId: session.user.id,
          accessToken,
          mcpServerUrl
        }
      });
       // Rückgabe im gleichen Format wie andere Integrationen
      return NextResponse.json({
        ...calendlyIntegration,
        type: "CALENDLY",
        name: "Calendly",
        config: {
          accessToken: calendlyIntegration.accessToken,
          mcpServerUrl: calendlyIntegration.mcpServerUrl
        },
        isActive: true,
      }, { status: 201 });

    } else {
      const integration = await prisma.integration.create({
        data: {
          name,
          type,
          config,
          isActive,
          userId: session.user.id
        }
      });
       return NextResponse.json(integration, { status: 201 });
    }

  } catch (error) {
    console.error("Integration POST Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// PUT - Integration aktualisieren
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const integrationId = searchParams.get("id")
    const integrationType = searchParams.get("type") // Neuen Parameter für den Typ hinzufügen

    if (!integrationId || !integrationType) {
      return NextResponse.json({ error: "Integration ID und Typ sind erforderlich" }, { status: 400 })
    }

    const data = await request.json()

    let updatedIntegration;

    if (integrationType === "CALENDLY") {
      const { accessToken, mcpServerUrl } = data;
      if (!accessToken) {
        return NextResponse.json({ error: "Calendly Access Token ist erforderlich" }, { status: 400 });
      }

      // Prüfen ob Integration dem Benutzer gehört
      const existingCalendlyIntegration = await prisma.calendlyIntegration.findUnique({
        where: { id: integrationId }
      });

      if (!existingCalendlyIntegration || existingCalendlyIntegration.userId !== session.user.id) {
        return NextResponse.json({ error: "Calendly Integration nicht gefunden" }, { status: 404 });
      }

      updatedIntegration = await prisma.calendlyIntegration.update({
        where: { id: integrationId },
        data: {
          accessToken,
          mcpServerUrl,
          updatedAt: new Date()
        }
      });
    } else {
      // Prüfen ob Integration dem Benutzer gehört
      const existingIntegration = await prisma.integration.findUnique({
        where: { id: integrationId }
      })

      if (!existingIntegration || existingIntegration.userId !== session.user.id) {
        return NextResponse.json({ error: "Integration nicht gefunden" }, { status: 404 })
      }

      updatedIntegration = await prisma.integration.update({
        where: { id: integrationId },
        data: {
          ...data,
          updatedAt: new Date()
        }
      })
    }


    return NextResponse.json(updatedIntegration)

  } catch (error) {
    console.error("Integration PUT Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// DELETE - Integration löschen
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const integrationId = searchParams.get("id")
    const integrationType = searchParams.get("type") // Neuen Parameter für den Typ hinzufügen

    if (!integrationId || !integrationType) {
      return NextResponse.json({ error: "Integration ID und Typ sind erforderlich" }, { status: 400 })
    }

    if (integrationType === "CALENDLY") {
      // Prüfen ob Integration dem Benutzer gehört
      const existingCalendlyIntegration = await prisma.calendlyIntegration.findUnique({
        where: { id: integrationId }
      });

      if (!existingCalendlyIntegration || existingCalendlyIntegration.userId !== session.user.id) {
        return NextResponse.json({ error: "Calendly Integration nicht gefunden" }, { status: 404 });
      }

      await prisma.calendlyIntegration.delete({
        where: { id: integrationId }
      });
    } else {
      // Prüfen ob Integration dem Benutzer gehört
      const existingIntegration = await prisma.integration.findUnique({
        where: { id: integrationId }
      })

      if (!existingIntegration || existingIntegration.userId !== session.user.id) {
        return NextResponse.json({ error: "Integration nicht gefunden" }, { status: 404 })
      }

      await prisma.integration.delete({
        where: { id: integrationId }
      })
    }


    return NextResponse.json({ message: "Integration erfolgreich gelöscht" })

  } catch (error) {
    console.error("Integration DELETE Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// Hilfsfunktion zum Testen einer Integration
export async function testIntegration(type: string, config: any) {
  try {
    switch (type) {
      case "HUBSPOT":
        // HubSpot API Test
        if (!config.apiKey) throw new Error("HubSpot API Key fehlt")
        const hubspotResponse = await fetch("https://api.hubspot.com/contacts/v1/lists/all/contacts/all", {
          headers: {
            "Authorization": `Bearer ${config.apiKey}`
          }
        })
        return hubspotResponse.ok

      case "GOOGLE_CALENDAR":
        // Google Calendar API Test
        if (!config.accessToken) throw new Error("Google Access Token fehlt")
        const calendarResponse = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary", {
          headers: {
            "Authorization": `Bearer ${config.accessToken}`
          }
        })
        return calendarResponse.ok

      case "ZAPIER":
        // Zapier Webhook Test
        if (!config.webhookUrl) throw new Error("Zapier Webhook URL fehlt")
        const zapierResponse = await fetch(config.webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ test: true })
        })
        return zapierResponse.ok

      case "CALENDLY":
        // Calendly API Test (z.B. Benutzerinformationen abrufen)
        if (!config.accessToken) throw new Error("Calendly Access Token fehlt")
        const calendlyResponse = await fetch("https://api.calendly.com/users/me", {
          headers: {
            "Authorization": `Bearer ${config.accessToken}`
          }
        })
        return calendlyResponse.ok

      default:
        return true // Für andere Integrationen erstmal true zurückgeben
    }
  } catch (error) {
    console.error("Integration test error:", error)
    return false
  }
}

// GET - Alle Integrationen des Benutzers abrufen
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const integrations = await prisma.integration.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    })

    const calendlyIntegration = await prisma.calendlyIntegration.findUnique({
      where: { userId: session.user.id }
    });

    // Kombinieren Sie die Integrationen und die Calendly-Integration
    const allIntegrations = [...integrations];
    if (calendlyIntegration) {
      // Fügen Sie die Calendly-Integration im gleichen Format wie andere Integrationen hinzu
      allIntegrations.push({
        ...calendlyIntegration,
        type: "CALENDLY",
        name: "Calendly", // Fügen Sie einen Namen hinzu
        config: { // Fügen Sie eine config-Struktur hinzu
          accessToken: calendlyIntegration.accessToken,
          mcpServerUrl: calendlyIntegration.mcpServerUrl
        },
        isActive: true, // Setzen Sie isActive auf true, wenn die Integration existiert
      });
    }


    return NextResponse.json(allIntegrations)

  } catch (error) {
    console.error("Integrations GET Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}
