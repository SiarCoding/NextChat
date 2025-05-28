"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Target, Bot, Zap, Plus } from "lucide-react"
import Link from "next/link"

// Import our new bento grid components
import { StatsGrid } from "@/components/dashboard/stats-grid"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { PerformanceChart } from "@/components/dashboard/performance-chart"

interface DashboardData {
  totalLeads: number
  activeChatbots: number
  totalChats: number
  totalBookings: number
  recentActivities: Array<{
    id: string
    type: string
    message: string
    time: string
    avatar: string
  }>
}

const quickActions = [
  {
    title: "Neuen Chatbot erstellen",
    description: "Starten Sie mit einer Vorlage oder von Grund auf",
    icon: Bot,
    href: "/dashboard/bot-design",
    color: "emerald"
  },
  {
    title: "Landing Page erstellen",
    description: "Live Assistant für Ihre Website",
    icon: Zap,
    href: "/dashboard/landing-pages",
    color: "blue"
  },
  {
    title: "Integration hinzufügen",
    description: "CRM oder Kalender verbinden",
    icon: Plus,
    href: "/dashboard/integrations",
    color: "purple"
  }
]

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Lade Chatbots
      const chatbotsResponse = await fetch('/api/chatbots')
      const chatbots = chatbotsResponse.ok ? await chatbotsResponse.json() : []
      
      // Lade Conversations für Lead-Zählung
      const conversationsResponse = await fetch('/api/conversations')
      const conversations = conversationsResponse.ok ? await conversationsResponse.json() : []
      
      // Berechne KPIs
      const totalLeads = conversations.filter((conv: any) => conv.isLead).length
      const activeChatbots = chatbots.filter((bot: any) => bot.isActive).length
      const totalChats = chatbots.reduce((sum: number, bot: any) => sum + bot.totalChats, 0)
      const totalBookings = conversations.filter((conv: any) =>
        conv.messages?.some((msg: any) =>
          msg.content?.toLowerCase().includes('termin') ||
          msg.content?.toLowerCase().includes('booking')
        )
      ).length

      // Erstelle Recent Activities aus echten Daten
      const recentActivities = conversations
        .slice(0, 4)
        .map((conv: any, index: number) => ({
          id: conv.id,
          type: conv.isLead ? "lead" : "chat",
          message: conv.isLead ?
            `Neuer Lead generiert` :
            `Neue Unterhaltung gestartet`,
          time: formatTimeAgo(new Date(conv.createdAt)),
          avatar: conv.chatbot?.name?.substring(0, 2).toUpperCase() || "CB"
        }))

      setDashboardData({
        totalLeads,
        activeChatbots,
        totalChats,
        totalBookings,
        recentActivities
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Fallback zu Mock-Daten
      setDashboardData({
        totalLeads: 0,
        activeChatbots: 0,
        totalChats: 0,
        totalBookings: 0,
        recentActivities: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "gerade eben"
    if (diffInMinutes < 60) return `vor ${diffInMinutes} Minuten`
    if (diffInMinutes < 1440) return `vor ${Math.floor(diffInMinutes / 60)} Stunden`
    return `vor ${Math.floor(diffInMinutes / 1440)} Tagen`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-slate-600">Dashboard wird geladen...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6 px-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Willkommen zu NextChat, Ihrem intelligenten Chatbot-System.
          </p>
        </div>
        <div>
          <Button variant="default" className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 transition-all duration-300">
            <Bot className="h-4 w-4 mr-2" /> Neuer Chatbot
          </Button>
        </div>
      </div>

      {/* KPI Stats with Bento Grid */}
      <StatsGrid 
        totalLeads={dashboardData?.totalLeads || 0}
        activeChatbots={dashboardData?.activeChatbots || 0}
        totalChats={dashboardData?.totalChats || 0}
        totalBookings={dashboardData?.totalBookings || 0}
        isLoading={isLoading}
      />

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        {/* Quick Actions using Bento Grid */}
        <QuickActions />

        {/* Recent Activities using Bento Grid */}
        <ActivityFeed activities={dashboardData?.recentActivities || []} />
      </div>

      {/* Performance Chart with Bento Grid */}
      <div className="mt-6">
        <PerformanceChart />
      </div>
    </div>
  )
}