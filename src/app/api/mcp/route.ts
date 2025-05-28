import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { spawn } from "child_process";

// MCP API Handler
export async function POST(request: NextRequest) {
  console.log('MCP API request received');
  try {
    const data = await request.json();
    console.log('Request data:', JSON.stringify(data));
    const { server, request: mcpRequest, userId } = data;

    // Prüfen, ob der Server unterstützt wird
    if (server !== "calendly") {
      return NextResponse.json({ error: `MCP Server '${server}' wird nicht unterstützt` }, { status: 400 });
    }

    // Temporäre Umgehung der Session-Prüfung für Debugging-Zwecke
    // In einer Produktionsumgebung sollte hier eine robuste Authentifizierung erfolgen
    let userIdToUse = userId;
    const session = await getServerSession(authOptions);

    if (session?.user?.id) {
      userIdToUse = session.user.id;
      if (userId && userId !== session.user.id) {
        console.log('User ID in Anfrage stimmt nicht mit Session überein', { requestUserId: userId, sessionUserId: session.user.id });
      }
    } else if (!userIdToUse) {
       console.log('Nicht authentifiziert - kein Session User und keine userId im Request Body');
       return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }

    console.log('Verwendete User ID für MCP:', userIdToUse);
    console.log('Suche Calendly-Integration für User:', userIdToUse);
    
    // Calendly-Integration für den Benutzer abrufen
    const calendlyIntegration = await prisma.calendlyIntegration.findUnique({
      where: { userId: userIdToUse }
    });

    console.log('Calendly-Integration gefunden:', calendlyIntegration ? 'Ja' : 'Nein');
    
    if (!calendlyIntegration) {
      return NextResponse.json({ error: "Calendly-Integration nicht konfiguriert" }, { status: 404 });
    }
    
    console.log('Access Token vorhanden:', !!calendlyIntegration.accessToken);

    // MCP-Anfrage an den Python-Server weiterleiten
    // Im einfachsten Fall starten wir den Server für jede Anfrage neu (nicht effizient, aber funktional)
    // In einer Produktionsumgebung würde man einen langlebigen Server betreiben
    try {
      // Absoluten Pfad zum Python-Skript verwenden
      const path = require('path');
      const scriptPath = path.join(process.cwd(), 'calendly_mcp_server.py');
      console.log('Executing Python script at:', scriptPath);
      
      // Voller Pfad zum Python-Executable verwenden, basierend auf pip-Ausgabe
      const pythonCommand = '/usr/local/bin/python3'; // Angenommener Pfad basierend auf pip-Ausgabe
      console.log(`Verwendetes Python-Command: ${pythonCommand}`);
      console.log(`Setze CALENDLY_TOKEN: ${calendlyIntegration.accessToken.substring(0, 10)}...`);
      
      // Wir verwenden stdio als Transport-Mechanismus
      const pythonProcess = spawn(pythonCommand, [scriptPath, "stdio"], {
        env: {
          ...process.env,
          CALENDLY_TOKEN: calendlyIntegration.accessToken
        }
      });

      // MCP-Anfrage an den Python-Prozess senden
      const mcpRequestJson = JSON.stringify(mcpRequest) + "\n";
      pythonProcess.stdin.write(mcpRequestJson);
      pythonProcess.stdin.end();

      // Antwort vom Python-Prozess lesen
      let responseData = "";
      pythonProcess.stdout.on("data", (data) => {
        const chunk = data.toString();
        console.log('Python stdout:', chunk);
        responseData += chunk;
      });
      
      // Fehlerausgabe vom Python-Prozess lesen
      let errorOutput = "";
      pythonProcess.stderr.on("data", (data) => {
        const chunk = data.toString();
        console.error('Python stderr:', chunk);
        errorOutput += chunk;
      });

      // Warten auf Beendigung des Python-Prozesses
      const exitCode = await new Promise((resolve) => {
        pythonProcess.on("close", resolve);
      });

      console.log(`Python process exited with code ${exitCode}`);
      if (exitCode !== 0) {
        console.error(`Fehlercode: ${exitCode}, Fehlerausgabe: ${errorOutput}`);
        return NextResponse.json({ 
          error: "MCP Server-Fehler", 
          details: errorOutput || "Kein Fehlertext verfügbar" 
        }, { status: 500 });
      }

      // Antwort zurückgeben
      try {
        const parsedResponse = JSON.parse(responseData.trim());
        return NextResponse.json(parsedResponse);
      } catch (error) {
        console.error("Failed to parse MCP response:", error);
        console.error("Raw response:", responseData);
        return NextResponse.json({ error: "Ungültige MCP-Antwort" }, { status: 500 });
      }
    } catch (error) {
      console.error("MCP Server error:", error);
      return NextResponse.json({ error: "MCP Server-Fehler" }, { status: 500 });
    }
  } catch (error) {
    console.error("MCP API Error:", error);
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    );
  }
}
