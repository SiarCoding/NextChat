import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Bot, 
  Palette, 
  RefreshCw,
  Calendar, 
  Mic, 
  TestTube,
  Store,
  HeadphonesIcon,
  MessageSquare,
  ArrowRight,
  PlayCircle,
  Sparkles,
  BarChart3,
  Users,
  Facebook,
  Linkedin,
  Twitter
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-emerald-600" />
              <span className="text-2xl font-bold text-slate-900">NextChat</span>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-slate-600">
              <Link href="#funktionen" className="hover:text-emerald-600 transition-colors">
                Funktionen
              </Link>
              <Link href="#vorlagen" className="hover:text-emerald-600 transition-colors">
                Vorlagen
              </Link>
              <Link href="#preise" className="hover:text-emerald-600 transition-colors">
                Preise
              </Link>
              <Link href="#integrationen" className="hover:text-emerald-600 transition-colors">
                Integrationen
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/signin" 
                className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
              >
                Anmelden
              </Link>
              <Button asChild>
                <Link href="/auth/signin">
                  Kostenlos starten
                </Link>
              </Button>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="py-16 md:py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
              <Sparkles className="w-4 h-4 mr-1" />
              Brandneu: Live-Sprachfunktion
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Chat-Assistenten die auch auf Ihrer Webseite{" "}
              <span className="text-emerald-600">verkaufen!</span>
            </h1>
            
            <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
              Verwandeln Sie Website-Besucher in Leads und automatisieren Sie Ihren Vertrieb mit 
              KI-gestützten Chatbots, die nahtlos in Ihre CRM- und Kalendersysteme integriert sind.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
              <Button size="lg" asChild>
                <Link href="/auth/signin" className="flex items-center">
                  Konto erstellen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="#video" className="flex items-center">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Demo ansehen
                </Link>
              </Button>
            </div>
          </div>

          {/* Hero Image with Stats */}
          <div className="mt-16 relative max-w-3xl mx-auto">
            <Card className="p-6 sm:p-8 bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
              <div className="bg-gradient-to-br from-emerald-50 to-sky-50 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Bot className="h-24 w-24 text-emerald-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Dashboard Mockup</h3>
                  <p className="text-slate-600">Hier würde das Dashboard-Mockup angezeigt</p>
                </div>
              </div>
            </Card>

            {/* Floating Stats */}
            <div className="absolute -left-10 sm:-left-20 top-1/4 transform -translate-y-1/2 hidden md:block">
              <Card className="p-4 bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-emerald-600 mr-3" />
                  <div>
                    <p className="text-xs text-slate-500">Gesamte Leads</p>
                    <p className="text-xl font-bold text-slate-800">1,289</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="absolute -right-10 sm:-right-20 top-1/3 transform -translate-y-1/2 hidden md:block">
              <Card className="p-4 bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-sky-500 mr-3" />
                  <div>
                    <p className="text-xs text-slate-500">Termine gebucht</p>
                    <p className="text-xl font-bold text-slate-800">245</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-10 sm:-bottom-16 hidden md:flex">
              <Card className="p-3 bg-white/60 backdrop-blur-sm border-white/20 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-sky-500 border-2 border-white"></div>
                    <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white"></div>
                  </div>
                  <p className="text-xs text-slate-600 ml-1">100k+ Zufriedene Nutzer</p>
                </div>
              </Card>
            </div>
          </div>
        </main>

        {/* Features Section */}
        <section className="py-16 md:py-24" id="funktionen">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Alles, was Sie für leistungsstarke Chatbots brauchen
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Von der No-Code-Erstellung bis zu nahtlosen Integrationen – wir haben alles für Sie.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 bg-white/80 border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
              <Bot className="h-10 w-10 text-emerald-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">No-Code Chatbot Builder</h3>
              <p className="text-slate-600">
                Erstellen Sie komplexe Chatbots per Drag & Drop, ohne eine einzige Zeile Code zu schreiben.
              </p>
            </Card>

            <Card className="p-6 bg-white/80 border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
              <Palette className="h-10 w-10 text-emerald-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Anpassbares Design</h3>
              <p className="text-slate-600">
                Passen Sie das Aussehen Ihres Chatbots mit unserem Baukastensystem an Ihr Branding an.
              </p>
            </Card>

            <Card className="p-6 bg-white/80 border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
              <RefreshCw className="h-10 w-10 text-emerald-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">CRM-Integrationen</h3>
              <p className="text-slate-600">
                Verbinden Sie sich mit HubSpot, PipeDrive, Salesforce, ClickUp und mehr.
              </p>
            </Card>

            <Card className="p-6 bg-white/80 border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
              <Calendar className="h-10 w-10 text-emerald-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Kalender-Integrationen</h3>
              <p className="text-slate-600">
                Automatisieren Sie Terminbuchungen mit Google Calendar, Microsoft Calendar und Calendly.
              </p>
            </Card>

            <Card className="p-6 bg-white/80 border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
              <Mic className="h-10 w-10 text-emerald-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Live-Sprachfunktion</h3>
              <p className="text-slate-600">
                Ermöglichen Sie Besuchern, direkt mit Ihrer KI zu sprechen – für ein immersives Erlebnis.
              </p>
            </Card>

            <Card className="p-6 bg-white/80 border-slate-200/50 shadow-sm hover:shadow-md transition-shadow">
              <TestTube className="h-10 w-10 text-emerald-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Live-Testing</h3>
              <p className="text-slate-600">
                Testen Sie Ihren Chatbot in Echtzeit, während Sie ihn erstellen, um sofortiges Feedback zu erhalten.
              </p>
            </Card>
          </div>
        </section>

        {/* Templates Section */}
        <section className="py-16 md:py-24 bg-slate-100 rounded-2xl my-16" id="vorlagen">
          <div className="text-center mb-12 px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Starten Sie schneller mit Vorlagen
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Wählen Sie aus einer Vielzahl von vorgefertigten Vorlagen und passen Sie sie an Ihre Bedürfnisse an.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            <Card className="p-6 bg-white/60 backdrop-blur-sm border-white/20 hover:border-emerald-500/50 transition-all duration-300 transform hover:scale-105 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-800">Vertriebs-Bot</h3>
                <Store className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-slate-600 text-sm mb-4">
                Qualifiziert Leads und bucht Demos direkt in Ihrem Kalender.
              </p>
              <Link href="#" className="text-emerald-600 hover:text-emerald-500 font-medium flex items-center text-sm">
                Vorlage verwenden <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Card>

            <Card className="p-6 bg-white/60 backdrop-blur-sm border-white/20 hover:border-sky-500/50 transition-all duration-300 transform hover:scale-105 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-800">Support-Bot</h3>
                <HeadphonesIcon className="h-6 w-6 text-sky-500" />
              </div>
              <p className="text-slate-600 text-sm mb-4">
                Beantwortet häufig gestellte Fragen und leitet komplexe Anfragen weiter.
              </p>
              <Link href="#" className="text-sky-500 hover:text-sky-400 font-medium flex items-center text-sm">
                Vorlage verwenden <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Card>

            <Card className="p-6 bg-white/60 backdrop-blur-sm border-white/20 hover:border-amber-500/50 transition-all duration-300 transform hover:scale-105 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-800">Feedback-Bot</h3>
                <MessageSquare className="h-6 w-6 text-amber-500" />
              </div>
              <p className="text-slate-600 text-sm mb-4">
                Sammelt Kundenfeedback und identifiziert Verbesserungspotenziale.
              </p>
              <Link href="#" className="text-amber-500 hover:text-amber-400 font-medium flex items-center text-sm">
                Vorlage verwenden <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24" id="registrieren">
          <div className="max-w-lg mx-auto text-center">
            <Card className="p-8 sm:p-12 bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Bereit loszulegen?</h2>
              <p className="text-slate-600 mb-8">
                Erstellen Sie Ihr kostenloses Konto und bauen Sie Ihren ersten Chatbot in wenigen Minuten. 
                Keine Kreditkarte erforderlich.
              </p>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-md"
                asChild
              >
                <Link href="/auth/signin" className="flex items-center justify-center">
                  <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Mit Google anmelden
                </Link>
              </Button>
              <p className="text-xs text-slate-500 mt-4">
                Indem Sie sich anmelden, stimmen Sie unseren{" "}
                <Link href="#" className="underline hover:text-emerald-600">Nutzungsbedingungen</Link>{" "}
                und{" "}
                <Link href="#" className="underline hover:text-emerald-600">Datenschutzrichtlinien</Link>{" "}
                zu.
              </p>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-slate-200">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Bot className="h-6 w-6 text-emerald-600" />
              <span className="text-lg font-semibold text-slate-900">NextChat</span>
            </div>
            <p className="text-sm text-slate-500 mb-4 md:mb-0">
              © 2024 NextChat. Alle Rechte vorbehalten.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-slate-500 hover:text-emerald-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-500 hover:text-emerald-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-500 hover:text-emerald-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
