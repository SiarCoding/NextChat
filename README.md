# NextChat - No-Code Chatbot Builder

NextChat ist eine moderne SaaS-Lösung für die Erstellung von KI-gestützten Chatbots ohne Programmierkenntnisse. Die Plattform ermöglicht es Unternehmen, intelligente Verkaufs- und Support-Assistenten zu erstellen, die nicht nur Fragen beantworten, sondern auch aktiv verkaufen können.

## 🚀 Features

### Core Features
- **No-Code Chatbot Builder** - Erstellen Sie komplexe Chatbots per Drag & Drop
- **Live-Speaking Modus** - Voice-basierte Chatbots mit ElevenLabs Integration
- **Hybrid-Modus** - Kombination aus Chat und Voice
- **KI-gestützt** - Powered by Google Gemini 2.0 Flash
- **Verkaufsorientiert** - Chatbots die aktiv verkaufen und Leads generieren

### Design & Anpassung
- **Baukastensystem** - Vollständig anpassbares Design
- **Branding** - Logo, Farben und Schriftarten
- **Responsive** - Funktioniert auf allen Geräten
- **Embed Code** - Einfache Integration in jede Website

### Integrationen
- **CRM-Systeme**: HubSpot, Salesforce, PipeDrive, Close CRM
- **Automation**: Zapier, Make
- **Kalender**: Google Calendar, Microsoft Calendar
- **Voice**: ElevenLabs Text-to-Speech

### Erweiterte Features
- **Landing Page Builder** - Erstellen Sie Voice-Assistant Landing Pages
- **Workflow Builder** - Visuelle Workflow-Erstellung mit Nodes
- **Knowledge Base** - PDF-Upload und Website-Scraping
- **Analytics** - Detaillierte Statistiken und KPIs
- **Credits System** - Flexible Nutzungsabrechnung

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React Framework mit App Router
- **TypeScript** - Type-safe Development
- **Tailwind CSS** - Utility-first CSS Framework
- **Shadcn/ui** - Moderne UI-Komponenten
- **Lucide React** - Icon Library

### Backend
- **Next.js API Routes** - Serverless API
- **Prisma ORM** - Type-safe Database Access
- **Supabase** - PostgreSQL Database
- **NextAuth.js** - Authentication

### External APIs
- **Google Gemini 2.0 Flash** - AI Language Model
- **ElevenLabs** - Text-to-Speech
- **Google OAuth** - Authentication

## 📦 Installation

### Voraussetzungen
- Node.js 18+ 
- npm oder yarn
- Supabase Account
- Google Cloud Account (für Gemini API)
- ElevenLabs Account (für Voice Features)

### Setup

1. **Repository klonen**
```bash
git clone https://github.com/yourusername/nextchat.git
cd nextchat
```

2. **Dependencies installieren**
```bash
npm install
```

3. **Umgebungsvariablen konfigurieren**
```bash
cp .env.example .env.local
```

Füllen Sie die `.env.local` Datei mit Ihren API-Keys aus:

```env
# Database
DATABASE_URL="your-supabase-database-url"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google Gemini API
GOOGLE_GEMINI_API_KEY="your-gemini-api-key"

# ElevenLabs API
ELEVENLABS_API_KEY="your-elevenlabs-api-key"

# App Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Datenbank Setup**
```bash
npm run db:push
npm run db:generate
```

5. **Entwicklungsserver starten**
```bash
npm run dev
```

Die Anwendung ist nun unter `http://localhost:3000` verfügbar.

## 🏗 Projektstruktur

```
nextchat/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   ├── dashboard/         # Dashboard Pages
│   │   ├── auth/             # Authentication Pages
│   │   └── page.tsx          # Landing Page
│   ├── components/           # React Components
│   │   ├── ui/              # Shadcn/ui Components
│   │   └── dashboard/       # Dashboard Components
│   ├── lib/                 # Utilities & Configurations
│   └── hooks/               # Custom React Hooks
├── prisma/                  # Database Schema
├── public/                  # Static Assets
└── uploads/                # File Uploads
```

## 🎯 Verwendung

### 1. Chatbot erstellen
1. Melden Sie sich im Dashboard an
2. Gehen Sie zu "Bot Design"
3. Klicken Sie auf "Neuen Bot erstellen" oder wählen Sie eine Vorlage
4. Konfigurieren Sie Design, Persönlichkeit und Verhalten
5. Testen Sie den Bot im Live-Modus
6. Generieren Sie den Embed-Code

### 2. Voice-Assistant Landing Page
1. Navigieren Sie zu "Landing Page Builder"
2. Erstellen Sie eine neue Landing Page
3. Konfigurieren Sie den Voice-Assistant
4. Testen Sie die Sprachfunktion
5. Veröffentlichen Sie die Landing Page

### 3. Integrationen einrichten
1. Gehen Sie zu "Integrationen"
2. Wählen Sie Ihr CRM oder Automation-Tool
3. Geben Sie die API-Credentials ein
4. Testen Sie die Verbindung
5. Aktivieren Sie die Integration

### 4. Workflows erstellen
1. Öffnen Sie den "Workflow Builder"
2. Erstellen Sie Nodes für verschiedene Aktionen
3. Verbinden Sie die Nodes mit Pfeilen
4. Definieren Sie Bedingungen und Aktionen
5. Aktivieren Sie den Workflow

## 🔧 API Endpoints

### Chatbots
- `GET /api/chatbots` - Alle Chatbots abrufen
- `POST /api/chatbots` - Neuen Chatbot erstellen
- `PUT /api/chatbots?id={id}` - Chatbot aktualisieren
- `DELETE /api/chatbots?id={id}` - Chatbot löschen

### Chat
- `POST /api/chat` - Chat-Nachricht senden

### Voice
- `POST /api/voice` - Text-to-Speech
- `GET /api/voice` - Verfügbare Stimmen

### Templates
- `GET /api/templates` - Chatbot-Templates abrufen

### Uploads
- `POST /api/upload` - Datei hochladen

### Credits
- `GET /api/credits` - Credit-Status abrufen
- `POST /api/credits` - Credits hinzufügen

## 🎨 Design System

Das Projekt verwendet ein konsistentes Design-System basierend auf:

- **Farben**: Emerald als Primärfarbe, Slate für Grautöne
- **Typografie**: Inter Font Family
- **Spacing**: Tailwind CSS Spacing Scale
- **Components**: Shadcn/ui für konsistente UI-Elemente

## 🚀 Deployment

### Vercel (Empfohlen)
1. Pushen Sie Ihren Code zu GitHub
2. Verbinden Sie Ihr Repository mit Vercel
3. Konfigurieren Sie die Umgebungsvariablen
4. Deployen Sie die Anwendung

### Docker
```bash
docker build -t nextchat .
docker run -p 3000:3000 nextchat
```

## 🤝 Contributing

1. Fork das Repository
2. Erstellen Sie einen Feature Branch (`git checkout -b feature/amazing-feature`)
3. Committen Sie Ihre Änderungen (`git commit -m 'Add amazing feature'`)
4. Pushen Sie den Branch (`git push origin feature/amazing-feature`)
5. Öffnen Sie einen Pull Request

## 📝 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert. Siehe [LICENSE](LICENSE) für Details.

## 🆘 Support

Bei Fragen oder Problemen:
- Öffnen Sie ein Issue auf GitHub
- Kontaktieren Sie uns unter support@nextchat.ai
- Besuchen Sie unsere Dokumentation

## 🔮 Roadmap

- [ ] Multi-Language Support
- [ ] Advanced Analytics Dashboard
- [ ] WhatsApp Integration
- [ ] Telegram Bot Support
- [ ] Advanced Workflow Conditions
- [ ] A/B Testing für Chatbots
- [ ] Team Collaboration Features
- [ ] White-Label Solution

---

**NextChat** - Erstellen Sie intelligente Chatbots, die verkaufen! 🤖💰
