import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Text-to-Speech mit ElevenLabs
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
    }

    const { text, voiceId = "21m00Tcm4TlvDq8ikWAM" } = await request.json() // Default: Rachel voice

    if (!text) {
      return NextResponse.json({ error: "Text ist erforderlich" }, { status: 400 })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "ElevenLabs API Key nicht konfiguriert" }, { status: 500 })
    }

    // ElevenLabs API aufrufen
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("ElevenLabs API Error:", errorText)
      return NextResponse.json({ error: "Fehler bei der Sprachgenerierung" }, { status: 500 })
    }

    // Audio-Daten als Buffer zurückgeben
    const audioBuffer = await response.arrayBuffer()
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    })

  } catch (error) {
    console.error("Voice API Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}

// GET - Verfügbare Stimmen abrufen
export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "ElevenLabs API Key nicht konfiguriert" }, { status: 500 })
    }

    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Fehler beim Abrufen der Stimmen" }, { status: 500 })
    }

    const voices = await response.json()
    
    // Nur die wichtigsten Informationen zurückgeben
    const simplifiedVoices = voices.voices.map((voice: any) => ({
      voice_id: voice.voice_id,
      name: voice.name,
      category: voice.category,
      description: voice.description,
      preview_url: voice.preview_url,
      labels: voice.labels
    }))

    return NextResponse.json({ voices: simplifiedVoices })

  } catch (error) {
    console.error("Voices GET Error:", error)
    return NextResponse.json(
      { error: "Interner Server-Fehler" },
      { status: 500 }
    )
  }
}