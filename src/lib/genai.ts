/**
 * LLM Integration für NextChat
 * 
 * Diese Datei stellt die Verbindung zum lokalen Ollama-LLM und/oder zur Google Gemini API her
 * und bietet Funktionen für die Generierung von Chatbot-Antworten
 */

import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/lib/prisma';
import { localLLM } from './llm/local';
import { LLMOptions, LLMResponse } from './llm/types';

// Initialisierung des Google GenAI Clients (als Fallback)
const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY || ''
});

// Verwendung des konfigurierten LLM-Providers
const USE_LOCAL_LLM = true; // Immer lokales LLM verwenden

/**
 * Schnittstelle für Calendly-Event-Typen
 */
interface CalendlyEventType {
  name: string;
  description: string;
  duration: number;
  scheduling_url: string;
  uri: string;
}

/**
 * Hilfsfunktion zum direkten Abrufen von Calendly-Veranstaltungstypen 
 * unter Verwendung des MCP-Servers
 * 
 * @param userId - Die ID des Benutzers zur Abfrage der Integration
 * @returns Liste der Event-Typen oder null bei Fehler
 */
async function getCalendlyEventTypes(userId: string): Promise<CalendlyEventType[] | null> {
  try {
    // Calendly-Integration für den Benutzer abrufen
    const calendlyIntegration = await prisma.calendlyIntegration.findUnique({
      where: { userId }
    });

    if (!calendlyIntegration?.accessToken) {
      console.log('Keine Calendly-Integration oder kein Token gefunden für Benutzer:', userId);
      return null;
    }

    // MCP-Anfrage an die Next.js API-Route senden
    console.log('Sende MCP-Anfrage an /api/mcp für list_event_types...');
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/mcp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        server: 'calendly',
        request: {
          id: Date.now().toString(),
          jsonrpc: "2.0",
          method: "list_event_types",
          params: {}
        },
        userId: userId // Sende userId zur Authentifizierung in der API-Route
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Fehler bei MCP-Anfrage:', errorData.error);
      return [];
    }

    const responseData = await response.json();
    console.log('MCP-Antwort erhalten:', responseData);

    if (responseData.result && Array.isArray(responseData.result)) {
      console.log(`${responseData.result.length} Calendly Event-Typen gefunden`);
      return responseData.result;
    } else if (responseData.error) {
      console.error('MCP-Server Fehler:', responseData.error);
      return [];
    } else {
      console.log('Unerwartetes Antwortformat von /api/mcp:', responseData);
      return [];
    }

  } catch (error) {
    console.error("Fehler beim Abrufen der Calendly Event-Typen über /api/mcp:", error);
    return [];
  }
}

/**
 * Bucht einen Termin über Calendly für einen bestimmten Benutzer
 * 
 * @param userId - Die ID des Benutzers zur Abfrage der Integration
 * @param userInfo - Die gesammelten Benutzerinformationen für die Buchung
 * @param eventTypeUri - Die URI des Event-Typs
 * @returns Buchungsinformationen oder null bei Fehler
 */
async function bookCalendlyAppointment(userId: string, userInfo: UserInfo, eventTypeUri: string): Promise<any> {
  try {
    // Prüfen, ob die notwendigen Informationen vorhanden sind
    if (!userInfo.name || !userInfo.email) {
      console.log('Fehlende Informationen für die Buchung:', { name: userInfo.name, email: userInfo.email });
      return {
        error: "Fehlende Informationen",
        missingFields: [
          !userInfo.name ? "name" : null,
          !userInfo.email ? "email" : null
        ].filter(Boolean)
      };
    }

    // Datum und Uhrzeit formatieren
    let formattedDate = "";
    let formattedTime = "";
    
    if (userInfo.preferredDate) {
      // Einfache Konvertierung verschiedener Datumsformate in YYYY-MM-DD
      const dateString = userInfo.preferredDate;
      // Deutsche Datumsformate wie 29.05.2025 oder 29.5.2025
      const germanDateRegex = /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/;
      const germanMatch = dateString.match(germanDateRegex);
      
      if (germanMatch) {
        const day = germanMatch[1].padStart(2, '0');
        const month = germanMatch[2].padStart(2, '0');
        const year = germanMatch[3].length === 2 ? `20${germanMatch[3]}` : germanMatch[3];
        formattedDate = `${year}-${month}-${day}`;
      } else {
        // Andernfalls Originalformat verwenden
        formattedDate = dateString;
      }
    }
    
    if (userInfo.preferredTime) {
      // Einfache Konvertierung verschiedener Zeitformate in HH:MM
      const timeString = userInfo.preferredTime;
      // Format wie "12:00" oder "12 Uhr"
      const timeRegex = /(\d{1,2})(?::(\d{2}))?(?:\s*Uhr)?/i;
      const timeMatch = timeString.match(timeRegex);
      
      if (timeMatch) {
        const hours = timeMatch[1].padStart(2, '0');
        const minutes = timeMatch[2] ? timeMatch[2] : "00";
        formattedTime = `${hours}:${minutes}`;
      } else {
        formattedTime = timeString;
      }
    }

    // MCP-Anfrage an die Next.js API-Route senden
    console.log('Sende MCP-Anfrage an /api/mcp für book_appointment...');
    const response = await fetch('/api/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        server: 'calendly',
        request: {
          id: Date.now().toString(),
          jsonrpc: "2.0",
          method: "book_appointment",
          params: {
            event_type_uri: eventTypeUri,
            name: userInfo.name,
            email: userInfo.email,
            phone: userInfo.phone || "",
            date: formattedDate,
            time: formattedTime,
            notes: `Lead aus NextChat - Score: ${userInfo.leadScore || 0}`
          }
        },
        userId: userId // Sende userId zur Authentifizierung in der API-Route
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Fehler bei MCP-Buchungsanfrage:', errorData.error);
      return { error: errorData.error || 'Fehler bei der Buchungsanfrage' };
    }

    const responseData = await response.json();
    console.log('MCP-Buchungs-Antwort erhalten:', responseData);

    if (responseData.result) {
      console.log('Calendly-Buchungs-Antwort:', responseData.result);
      return responseData.result;
    } else if (responseData.error) {
      console.error('MCP-Server Fehler bei Buchung:', responseData.error);
      return { error: responseData.error.message || 'Unbekannter Fehler' };
    } else {
      console.log('Unerwartetes Antwortformat von /api/mcp für Buchung:', responseData);
      return { error: 'Unerwartetes Antwortformat' };
    }

  } catch (error) {
    console.error("Fehler bei der Terminbuchung über /api/mcp:", error);
    return { error: String(error) };
  }
}

/**
 * Benutzerinformationen aus der Konversation extrahieren
 * 
 * @param conversation - Die aktuelle Konversation
 * @returns Extrahierte Benutzerinformationen
 */
interface UserInfo {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  interests?: string[];
  preferredDate?: string;
  preferredTime?: string;
  stage?: 'initial' | 'qualifying' | 'scheduling' | 'collecting_info' | 'ready_to_book';
  leadScore?: number;
}

function extractUserInfo(conversation: any[]): UserInfo {
  const userInfo: UserInfo = {
    interests: [],
    stage: 'initial',
    leadScore: 0
  };
  
  // Reguläre Ausdrücke für die Extraktion
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /\b(\+?\d{1,3}[- ]?)?\(?\d{3,4}\)?[- ]?\d{3,4}[- ]?\d{3,5}\b/g;
  const dateRegex = /\b\d{1,2}[./-]\d{1,2}([./-]\d{2,4})?\b|\b(\d{1,2}\s(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)|\d{1,2}\s(Jan|Feb|Mär|Apr|Mai|Jun|Jul|Aug|Sep|Okt|Nov|Dez))\b/gi;
  const timeRegex = /\b\d{1,2}:\d{2}\b|\b\d{1,2}\s?(Uhr)\b/gi;
  
  // Interessenbereiche
  const interestKeywords = [
    'produkt', 'preis', 'kosten', 'demo', 'funktionen', 'features', 'integration', 
    'sicherheit', 'support', 'technologie', 'implementation'
  ];
  
  // Konversation durchlaufen und Informationen extrahieren
  for (const message of conversation) {
    if (message.type === 'user') {
      const content = message.content.toLowerCase();
      
      // Email
      const emails = content.match(emailRegex);
      if (emails && !userInfo.email) userInfo.email = emails[0];
      
      // Telefonnummer
      const phones = content.match(phoneRegex);
      if (phones && !userInfo.phone) userInfo.phone = phones[0];
      
      // Datum
      const dates = content.match(dateRegex);
      if (dates && !userInfo.preferredDate) userInfo.preferredDate = dates[0];
      
      // Uhrzeit
      const times = content.match(timeRegex);
      if (times && !userInfo.preferredTime) userInfo.preferredTime = times[0];
      
      // Name (einfache Heuristik: erste Wörter, wenn nicht offensichtlich etwas anderes)
      if (!userInfo.name && content.length < 30 && !content.includes('?') && 
          !['was', 'wie', 'wo', 'wann', 'warum', 'ja', 'nein', 'hallo', 'hi', 'hey', 'termin'].some(w => content.startsWith(w))) {
        userInfo.name = message.content.split(' ').slice(0, 2).join(' ');
      }
      
      // Interessen identifizieren
      interestKeywords.forEach(keyword => {
        if (content.includes(keyword) && !userInfo.interests?.includes(keyword)) {
          userInfo.interests?.push(keyword);
        }
      });
      
      // Stage und Lead Score basierend auf Konversation aktualisieren
      if (content.includes('termin') || content.includes('meeting') || content.includes('demo')) {
        userInfo.stage = 'scheduling';
        userInfo.leadScore = Math.min(90, (userInfo.leadScore || 0) + 20);
      }
      
      if (content.includes('kaufen') || content.includes('preis') || content.includes('kosten')) {
        userInfo.stage = 'qualifying';
        userInfo.leadScore = Math.min(90, (userInfo.leadScore || 0) + 15);
      }
      
      if (userInfo.email || userInfo.phone) {
        userInfo.stage = 'collecting_info';
        userInfo.leadScore = Math.min(90, (userInfo.leadScore || 0) + 30);
      }
      
      if (userInfo.email && userInfo.phone && userInfo.name && (userInfo.preferredDate || userInfo.preferredTime)) {
        userInfo.stage = 'ready_to_book';
        userInfo.leadScore = 100;
      }
    }
  }
  
  return userInfo;
}

/**
 * Generiert eine Antwort mit dem lokalen Ollama-LLM oder dem Gemini-Modell basierend auf einer Benutzeranfrage
 * 
 * @param prompt - Die Benutzeranfrage/Nachricht
 * @param context - Zusätzlicher Kontext für die Anfrage (z.B. Chatbot-Einstellungen)
 * @param systemPrompt - Optionale Anweisungen zur Steuerung des Antwort-Stils
 * @param userId - Die ID des Benutzers (optional, wird für MCP-Anfragen benötigt)
 * @param conversation - Die bisherige Konversation (für Kontext und Gedächtnis)
 * @returns Der generierte Antworttext
 */
export async function generateBotResponse(
  prompt: string, 
  context: string = "", 
  systemPrompt?: string,
  userId?: string,
  conversation: any[] = []
): Promise<string> {
  try {
    // Benutzerinformationen aus der Konversation extrahieren
    const userInfo = extractUserInfo(conversation);
    console.log('Extrahierte Benutzerinformationen:', userInfo);
    
    // Prüfen, ob die Nachricht auf Terminplanung hinweist oder wir bereits im Terminplanungsprozess sind
    const schedulingKeywords = [
      "termin", "meeting", "besprechung", "gespräch", "call", "buchen", "reservieren", 
      "kalendar", "calendly", "zeitplan", "verfügbarkeit", "wann passt es", "treffen"
    ];
    
    const hasSchedulingIntent = schedulingKeywords.some(keyword => 
      prompt.toLowerCase().includes(keyword)
    ) || userInfo.stage === 'scheduling' || userInfo.stage === 'ready_to_book';

    // Wenn Terminbuchungs-Absicht erkannt wurde und eine Benutzer-ID vorhanden ist, 
    // prüfen wir, ob wir einen Termin buchen oder Terminoptionen anbieten können
    let calendlyData = null;
    let bookingResult = null;
    
    if (hasSchedulingIntent && userId) {
      try {
        // Event-Typen über den MCP-Server abrufen
        const eventTypes = await getCalendlyEventTypes(userId);

        if (eventTypes && eventTypes.length > 0) {
          console.log('Calendly Event-Typen gefunden:', eventTypes.length);
          
          // Prüfen, ob wir genug Informationen haben, um einen Termin zu buchen
          const readyToBook = userInfo.stage === 'ready_to_book' && 
                            userInfo.name && 
                            userInfo.email && 
                            (userInfo.preferredDate || userInfo.preferredTime);
          
          // Wenn wir genug Informationen haben, versuchen wir, einen Termin zu buchen
          if (readyToBook) {
            console.log('Versuche Termin zu buchen mit Informationen:', {
              name: userInfo.name,
              email: userInfo.email,
              phone: userInfo.phone,
              date: userInfo.preferredDate,
              time: userInfo.preferredTime
            });
            
            // Versuche, einen Termin mit dem ersten Event-Typ zu buchen
            bookingResult = await bookCalendlyAppointment(userId, userInfo, eventTypes[0].uri);
            
            if (bookingResult && !bookingResult.error) {
              console.log('Terminbuchung erfolgreich:', bookingResult);
              calendlyData = {
                bookingLink: bookingResult.booking_link,
                eventName: bookingResult.event_name,
                participant: bookingResult.participant,
                preferredTime: bookingResult.preferred_time,
                booked: true,
                message: bookingResult.message
              };
            } else {
              console.error('Fehler bei der Terminbuchung:', bookingResult?.error || 'Unbekannter Fehler');
              // Wenn die Buchung fehlschlägt, zeigen wir zumindest den Link an
              calendlyData = {
                bookingLink: eventTypes[0].scheduling_url,
                eventName: eventTypes[0].name,
                booked: false,
                missingFields: bookingResult?.missingFields || []
              };
            }
          } else {
            // Wenn wir nicht genug Informationen haben, zeigen wir nur den Link an
            calendlyData = {
              bookingLink: eventTypes[0].scheduling_url,
              eventName: eventTypes[0].name,
              booked: false,
              missingFields: [
                !userInfo.name ? "name" : null,
                !userInfo.email ? "email" : null,
                !userInfo.phone ? "phone" : null,
                !userInfo.preferredDate && !userInfo.preferredTime ? "date/time" : null
              ].filter(Boolean)
            };
          }
        } else {
          console.log('Keine Calendly Event-Typen gefunden');
        }
      } catch (error) {
        console.error("Calendly Integration Error:", error);
        // Bei einem Fehler mit der Calendly-Integration fahren wir normal fort
      }
    }

    // Vergangene Nachrichten für Kontext zusammenfassen
    let conversationHistory = '';
    if (conversation && conversation.length > 0) {
      // Maximal die letzten 10 Nachrichten als Kontext verwenden
      const recentMessages = conversation.slice(-10);
      conversationHistory = recentMessages.map(msg => 
        `${msg.type === 'user' ? 'Benutzer' : 'Bot'}: ${msg.content}`
      ).join('\n');
    }

    // Lead-Qualifizierungsanweisungen basierend auf dem aktuellen Stadium
    let qualificationInstructions = '';
    if (userInfo.stage === 'initial' || userInfo.stage === 'qualifying') {
      qualificationInstructions = `
Als proaktiver Verkaufsassistent, versuche den Benutzer zu qualifizieren und Informationen zu sammeln. 
Stelle offene Fragen zu seinen Bedürfnissen und Herausforderungen. 
Wenn der Benutzer Interesse zeigt, biete proaktiv einen kostenlosen Beratungstermin an.`;
    } else if (userInfo.stage === 'scheduling') {
      qualificationInstructions = `
Der Benutzer zeigt Interesse an einem Termin. Frage aktiv nach einem bevorzugten Datum und einer Uhrzeit.
Falls noch nicht geschehen, versuche den Namen, die E-Mail-Adresse und Telefonnummer zu erfragen, damit ein Termin vereinbart werden kann.`;
    } else if (userInfo.stage === 'collecting_info') {
      qualificationInstructions = `
Wir sammeln bereits Informationen für einen Termin. ${!userInfo.name ? 'Frage nach dem Namen des Benutzers. ' : ''}${!userInfo.email ? 'Frage nach der E-Mail-Adresse. ' : ''}${!userInfo.phone ? 'Frage nach der Telefonnummer. ' : ''}${!userInfo.preferredDate ? 'Frage nach einem bevorzugten Datum. ' : ''}${!userInfo.preferredTime ? 'Frage nach einer bevorzugten Uhrzeit. ' : ''}`;
    } else if (userInfo.stage === 'ready_to_book') {
      qualificationInstructions = `
Der Benutzer hat alle nötigen Informationen bereitgestellt. Biete aktiv an, den Termin jetzt zu buchen und teile den Calendly-Link mit.`;
    }

    // Vollständigen Prompt erstellen
    let fullPrompt = `Du bist ein intelligenter, proaktiver Verkaufs-Assistent für ein Unternehmen.
Du sollst den Benutzer durch den Prozess führen, Informationen sammeln und ihn für einen Verkauf qualifizieren.

Kontext: ${context}

${systemPrompt || "Sei freundlich, hilfsbereit und führe das Gespräch zielgerichtet. Qualifiziere den Lead und arbeite auf einen Termin hin."}

${qualificationInstructions}

Bisherige Konversation:
${conversationHistory}

${userInfo.name ? `Der Name des Benutzers ist: ${userInfo.name}\n` : ''}
${userInfo.email ? `Die E-Mail-Adresse des Benutzers ist: ${userInfo.email}\n` : ''}
${userInfo.phone ? `Die Telefonnummer des Benutzers ist: ${userInfo.phone}\n` : ''}
${userInfo.preferredDate ? `Das bevorzugte Datum ist: ${userInfo.preferredDate}\n` : ''}
${userInfo.preferredTime ? `Die bevorzugte Uhrzeit ist: ${userInfo.preferredTime}\n` : ''}
${userInfo.interests && userInfo.interests.length > 0 ? `Interessengebiete: ${userInfo.interests.join(', ')}\n` : ''}

Benutzer-Nachricht: ${prompt}`;

    // Wenn Calendly-Daten vorhanden sind, fügen wir entsprechende Anweisungen für den Bot hinzu
    if (calendlyData) {
      if (calendlyData.booked) {
        // Ein Termin wurde erfolgreich gebucht
        fullPrompt += `

WICHTIG: Ich habe erfolgreich einen Termin für den Benutzer gebucht!

Buchungsdetails:
- Teilnehmer: ${calendlyData.participant.name} (${calendlyData.participant.email})
- Termin: ${calendlyData.eventName}
${calendlyData.preferredTime ? `- Bevorzugte Zeit: ${calendlyData.preferredTime}` : ''}

Bestätigungslink: ${calendlyData.bookingLink}

Teile dem Benutzer mit, dass der Termin erfolgreich gebucht wurde und dass er eine Bestätigung per E-Mail erhalten wird.
Wenn er weitere Fragen hat, kann er sich jederzeit wieder melden.`;
      } else {
        // Es fehlen noch Informationen oder der Termin konnte nicht gebucht werden
        let missingInfoText = '';
        
        if (calendlyData.missingFields && calendlyData.missingFields.length > 0) {
          missingInfoText = `
Es fehlen noch folgende Informationen für die Terminbuchung: ${calendlyData.missingFields.join(', ')}.
Frage aktiv nach diesen Informationen, BEVOR du den Buchungslink teilst.`;
        }
        
        fullPrompt += `

WICHTIG: Ich habe einen Terminbuchungs-Link vorbereitet.${missingInfoText}

Biete an, einen Termin zu buchen unter folgendem Link:
${calendlyData.bookingLink}

Füge diesen Link in deine Antwort ein und erkläre dem Benutzer, dass er dort einen passenden Termin auswählen kann.`;
      }
    }

    fullPrompt += `

Wichtig: Beziehe dich auf frühere Nachrichten und zeige, dass du dich an den Kontext erinnerst.
Bleibe fokussiert auf das Ziel, einen qualifizierten Lead zu erzeugen und einen Termin zu vereinbaren.
Formuliere eine natürliche, personalisierte Antwort in 2-3 Sätzen.`;

    // Verwendung des lokalen Ollama-LLM (falls aktiviert) oder Fallback auf Gemini
    console.log(`[GenAI] Verwende ${USE_LOCAL_LLM ? 'lokales Ollama-LLM' : 'Gemini API'} für Textgenerierung`);
    
    try {
      if (USE_LOCAL_LLM) {
        // Lokales Ollama-LLM verwenden
        console.log('[GenAI] Sende Anfrage an lokales Ollama-LLM...');
        
        const llmOptions = {
          temperature: 0.7,
          maxTokens: 1024,
          systemPrompt: systemPrompt || "Du bist ein hilfreicher, freundlicher Assistent."
        };
        
        const llmResponse = await localLLM.generateText(fullPrompt, llmOptions);
        console.log(`[GenAI] Antwort vom lokalen LLM erhalten: ${llmResponse.model}`);
        
        return llmResponse.text;
      } else {
        // Fallback: Gemini API verwenden
        console.log('[GenAI] Sende Anfrage an Gemini API...');
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`, 
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: fullPrompt
                }]
              }],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              },
              safetySettings: [
                {
                  category: "HARM_CATEGORY_HARASSMENT",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                  category: "HARM_CATEGORY_HATE_SPEECH",
                  threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
              ]
            })
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API Error: ${response.status}`)
        }

        const data = await response.json()
        return data.candidates[0]?.content?.parts[0]?.text || "Entschuldigung, ich konnte keine Antwort generieren.";
      }
    } catch (llmError) {
      console.error('[GenAI] Fehler bei der Textgenerierung:', llmError);
      
      // Wenn ein Fehler mit dem lokalen LLM auftritt und wir es benutzen,
      // versuchen wir es mit der Gemini API als letzten Ausweg
      if (USE_LOCAL_LLM && !process.env.GOOGLE_GEMINI_API_KEY) {
        console.log('[GenAI] Versuche Fallback auf Gemini API...');
        
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`, 
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: fullPrompt
                  }]
                }],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 1024,
                }
              })
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            return data.candidates[0]?.content?.parts[0]?.text || "Entschuldigung, ich konnte keine Antwort generieren.";
          }
        } catch (fallbackError) {
          console.error('[GenAI] Auch Fallback auf Gemini fehlgeschlagen:', fallbackError);
        }
      }
      
      return "Entschuldigung, ich konnte keine Antwort generieren. Bitte versuchen Sie es später erneut.";
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Entschuldigung, es gab ein technisches Problem. Bitte versuchen Sie es später erneut.";
  }
}
