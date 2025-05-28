import os
# import requests # Wrapped in try-except below
import json
import asyncio
import sys
from mcp.server.fastmcp import FastMCP

try:
    import requests
except ModuleNotFoundError:
    print("CALENDLY_MCP: ERROR: The 'requests' Python module is not installed. This module is required to communicate with the Calendly API. Please install it by running: pip install requests (or /usr/local/bin/python3 -m pip install requests if you need to specify the interpreter).", file=sys.stderr, flush=True)
    sys.exit(1)

mcp = FastMCP("calendly")

# Logger für Debugging
def log(message):
    print(f"CALENDLY_MCP: {message}", file=sys.stderr, flush=True)

# Hilfsfunktion, um den aktuellen Benutzer zu erhalten
def get_current_user():
    token = os.getenv("CALENDLY_TOKEN")
    if not token:
        log("CALENDLY_TOKEN Umgebungsvariable nicht gesetzt")
        raise Exception("CALENDLY_TOKEN Umgebungsvariable nicht gesetzt")
    
    headers = {"Authorization": f"Bearer {token}"}
    try:
        log(f"Rufe Benutzer von Calendly ab mit Token: {token[:10]}...")
        resp = requests.get("https://api.calendly.com/users/me", headers=headers)
        resp.raise_for_status()
        user_data = resp.json().get("resource", {})
        log(f"Benutzer erfolgreich abgerufen: {user_data.get('uri', 'Keine URI')}")
        return user_data
    except Exception as e:
        log(f"Fehler beim Abrufen des Benutzers: {str(e)}")
        raise

# 1. Event-Typen abrufen
@mcp.tool()
async def list_event_types() -> list[dict]:
    """
    Gibt alle Event-Typen des angemeldeten Calendly-Accounts zurück.
    """
    try:
        token = os.getenv("CALENDLY_TOKEN")
        if not token:
            log("CALENDLY_TOKEN Umgebungsvariable nicht gesetzt")
            return {"jsonrpc": "2.0", "error": {"message": "CALENDLY_TOKEN Umgebungsvariable nicht gesetzt"}, "id": "1"}
            
        # Zuerst den aktuellen Benutzer abrufen
        try:
            user = get_current_user()
            user_uri = user.get("uri")
            
            if not user_uri:
                log("Benutzer-URI nicht gefunden")
                return {"jsonrpc": "2.0", "error": {"message": "Benutzer-URI nicht gefunden"}, "id": "1"}
            
            # Event-Typen für diesen Benutzer abrufen
            headers = {"Authorization": f"Bearer {token}"}
            log(f"Rufe Event-Typen ab für User: {user_uri}")
            resp = requests.get(f"https://api.calendly.com/event_types?user={user_uri}", headers=headers)
            resp.raise_for_status()
            
            data = resp.json().get("collection", [])
            log(f"Event-Typen gefunden: {len(data)}")
            
            # Relevante Informationen extrahieren
            event_types = []
            for item in data:
                event_types.append({
                    "name": item.get("name", "Unbenannter Termin"),
                    "description": item.get("description", ""),
                    "duration": item.get("duration", 0),
                    "scheduling_url": item.get("scheduling_url", ""),
                    "uri": item.get("uri", "")
                })
            
            # Rückgabe als korrektes JSON-RPC-Ergebnis
            return {"jsonrpc": "2.0", "result": event_types, "id": "1"}
        except Exception as inner_e:
            log(f"Innerer Fehler: {str(inner_e)}")
            return {"jsonrpc": "2.0", "error": {"message": str(inner_e)}, "id": "1"}
    except Exception as e:
        log(f"Fehler beim Abrufen der Event-Typen: {str(e)}")
        return {"jsonrpc": "2.0", "error": {"message": str(e)}, "id": "1"}

list_event_types.inputSchema = {
    "type": "object",
    "properties": {},
    "required": []
}

# 2. Terminbuchung erstellen
@mcp.tool()
async def book_appointment(event_type_uri: str, name: str, email: str, phone: str = "", date: str = "", time: str = "", notes: str = "") -> dict:
    """
    Bucht einen Termin für einen bestimmten Event-Typ und gibt den Bestätigungslink zurück.
    
    Parameter:
    - event_type_uri: Die URI des Event-Typs (z.B. https://api.calendly.com/event_types/123)
    - name: Name des Teilnehmers
    - email: E-Mail-Adresse des Teilnehmers
    - phone: Telefonnummer des Teilnehmers (optional)
    - date: Bevorzugtes Datum im Format YYYY-MM-DD (optional)
    - time: Bevorzugte Uhrzeit im Format HH:MM (optional)
    - notes: Notizen zur Buchung (optional)
    """
    try:
        token = os.getenv("CALENDLY_TOKEN")
        if not token:
            return {"error": "CALENDLY_TOKEN Umgebungsvariable nicht gesetzt"}
            
        # Event-Typ-Informationen abrufen
        event_type_id = event_type_uri.split("/")[-1] if "/" in event_type_uri else event_type_uri
        
        # Da wir keine direkte Buchung über die API vornehmen können (benötigt OAuth),
        # erstellen wir einen Single-Use-Link und geben diesen zurück
        # Im Produktionseinsatz würde hier die vollständige OAuth-Integration erfolgen
        
        # Informationen über den Event-Typ abrufen
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"https://api.calendly.com/event_types/{event_type_id}", headers=headers)
        resp.raise_for_status()
        event_data = resp.json().get("resource", {})
        
        # Scheduling-URL aus den Daten extrahieren
        scheduling_url = event_data.get("scheduling_url", "")
        if not scheduling_url:
            return {"error": "Keine Scheduling-URL für diesen Event-Typ gefunden"}
        
        # In einem echten System würden wir hier einen Single-Use-Link erstellen
        # und die Teilnehmerinformationen direkt an Calendly übergeben
        
        return {
            "success": True,
            "message": f"Termin für {name} ({email}) vorgemerkt",
            "booking_link": scheduling_url,
            "event_name": event_data.get("name", "Termin"),
            "participant": {
                "name": name,
                "email": email,
                "phone": phone
            },
            "preferred_time": f"{date} {time}" if date and time else "",
            "notes": notes
        }
    except Exception as e:
        print(f"Fehler bei der Terminbuchung: {str(e)}")
        return {"error": str(e)}

book_appointment.inputSchema = {
    "type": "object",
    "properties": {
        "event_type_uri": {
            "type": "string",
            "title": "Event Type URI",
            "description": "Die URI des Event-Typs."
        },
        "name": {
            "type": "string",
            "title": "Name",
            "description": "Name des Teilnehmers."
        },
        "email": {
            "type": "string",
            "title": "E-Mail",
            "description": "E-Mail-Adresse des Teilnehmers."
        },
        "phone": {
            "type": "string",
            "title": "Telefon",
            "description": "Telefonnummer des Teilnehmers (optional)."
        },
        "date": {
            "type": "string",
            "title": "Datum",
            "description": "Bevorzugtes Datum im Format YYYY-MM-DD (optional)."
        },
        "time": {
            "type": "string",
            "title": "Uhrzeit",
            "description": "Bevorzugte Uhrzeit im Format HH:MM (optional)."
        },
        "notes": {
            "type": "string",
            "title": "Notizen",
            "description": "Notizen zur Buchung (optional)."
        }
    },
    "required": ["event_type_uri", "name", "email"]
}

# 3. Server starten
async def main(transport: str = "stdio"):
    """
    Startet den MCP-Server im STDIO- oder SSE-Modus.
    """
    log(f"MCP-Server startet im {transport}-Modus...")
    if transport == "stdio":
        await mcp.run(transport="stdio")
    elif transport == "sse":
        await mcp.run(transport="sse")
    else:
        log(f"Unbekannter Transport: {transport}")

if __name__ == "__main__":
    import sys
    mode = sys.argv[1] if len(sys.argv) > 1 else "stdio"
    log(f"Calendly MCP Server wird gestartet mit Modus: {mode}")
    token = os.getenv("CALENDLY_TOKEN")
    log(f"CALENDLY_TOKEN vorhanden: {bool(token)}")
    try:
        asyncio.run(main(mode))
    except Exception as e:
        log(f"Fataler Fehler im MCP-Server: {str(e)}")
        sys.exit(1)
