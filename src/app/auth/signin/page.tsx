"use client"

import { signIn, getSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SignInPage() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push("/dashboard")
      }
    }
    checkSession()
  }, [router])

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Bot className="h-8 w-8 text-emerald-600" />
            <span className="text-2xl font-bold text-slate-900">NextChat</span>
          </Link>
        </div>

        <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-900">
              Willkommen zurück
            </CardTitle>
            <CardDescription className="text-slate-600">
              Melden Sie sich an, um Ihre Chatbots zu verwalten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGoogleSignIn}
              variant="outline" 
              className="w-full bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Mit Google anmelden
            </Button>

            <div className="text-center">
              <p className="text-xs text-slate-500">
                Indem Sie sich anmelden, stimmen Sie unseren{" "}
                <Link href="#" className="underline hover:text-emerald-600">
                  Nutzungsbedingungen
                </Link>{" "}
                und{" "}
                <Link href="#" className="underline hover:text-emerald-600">
                  Datenschutzrichtlinien
                </Link>{" "}
                zu.
              </p>
            </div>

            <div className="text-center pt-4">
              <Link 
                href="/" 
                className="text-sm text-slate-600 hover:text-emerald-600 transition-colors"
              >
                ← Zurück zur Startseite
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}